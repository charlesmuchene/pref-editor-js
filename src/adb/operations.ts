import {
  Connection,
  FileType,
  PartialPreference,
  Preference,
  PreferenceKey,
  Preferences,
  PreferenceWatch,
} from "../types/type";
import { encodeDatastorePrefs } from "../utils/proto-utils";
import { readPreferences, writeToDatastore, writeToKeyValue } from "./bridge";
import {
  assertType,
  filenameWithExtension,
  fileTypeFromName,
} from "../utils/utils";
import { encodeKeyValuePreference } from "../utils/xml-utils";
import { setInterval } from "node:timers/promises";
import { Readable } from "node:stream";

export enum Op {
  ADD = "add",
  DELETE = "delete",
  CHANGE = "change",
}

const escape = (content: string) => content.replace(/\//g, "\\/").trim();

export const addPreference = async (
  preference: Preference,
  connection: Connection
) => {
  assertType(preference.value, preference.type);

  if (connection.filename)
    connection = Object.assign(connection, {
      filename: await filenameWithExtension(connection),
    });

  const prefs: Preferences = await readPreferences(connection);

  if (prefs.some((p) => p.key === preference.key))
    throw new Error(`Preference already exists: ${preference.key}`);

  switch (fileTypeFromName(connection.filename!)) {
    case FileType.DATA_STORE:
      {
        prefs.push(preference);
        await writeToDatastore(connection, encodeDatastorePrefs(prefs));
      }
      break;
    case FileType.KEY_VALUE:
      await writeToKeyValue(
        connection,
        Op.ADD,
        escape("</map>"),
        escape(encodeKeyValuePreference(preference))
      );
      break;
  }
};

export const deletePreference = async (
  prefKey: PreferenceKey,
  connection: Connection
) => {
  if (connection.filename)
    connection = Object.assign(connection, {
      filename: await filenameWithExtension(connection),
    });
  const prefs: Preferences = await readPreferences(connection);

  const index = prefs.findIndex((p) => p.key === prefKey.key);
  if (index === -1) throw new Error(`Preference not found: ${prefKey.key}`);

  switch (fileTypeFromName(connection.filename!)) {
    case FileType.DATA_STORE:
      prefs.splice(index, 1);
      await writeToDatastore(connection, encodeDatastorePrefs(prefs));
      break;
    case FileType.KEY_VALUE:
      await writeToKeyValue(connection, Op.DELETE, createMatcher(prefs[index]));
      break;
  }
};

export const changePreference = async (
  preference: PartialPreference,
  connection: Connection
) => {
  if (connection.filename)
    connection = Object.assign(connection, {
      filename: await filenameWithExtension(connection),
    });
  const prefs: Preferences = await readPreferences(connection);

  const index = prefs.findIndex((p) => p.key === preference.key);
  if (index === -1) throw new Error(`Preference not found: ${preference.key}`);

  const existing = prefs[index];
  assertType(preference.value, existing.type);

  const newPref: Preference = {
    key: existing.key,
    value: preference.value,
    type: existing.type,
  };
  switch (fileTypeFromName(connection.filename!)) {
    case FileType.DATA_STORE:
      {
        prefs[index] = newPref;
        await writeToDatastore(connection, encodeDatastorePrefs(prefs));
      }
      break;
    case FileType.KEY_VALUE:
      await writeToKeyValue(
        connection,
        Op.CHANGE,
        createMatcher(existing),
        escape(encodeKeyValuePreference(newPref))
      );
      break;
  }
};

/**
 * Create a matcher string
 *
 * @deprecated Remove before 1.0. Backwards compatibility with < 0.3.2
 *
 * @param preference The user preference to find
 * @returns String representation to find preference
 */
const createMatcher = (preference: Preference): string => {
  const encode = encodeKeyValuePreference(preference).trimEnd();
  if (!encode.endsWith("/>")) return encode;
  const result = encode.slice(0, encode.length - 2).trimEnd(); // remove ' />'
  return escape(`${result}.*$`);
};

const watchIntervalMs = process.env.PREF_EDITOR_WATCHER_INTERVAL_MS
  ? Number(process.env.PREF_EDITOR_WATCHER_INTERVAL_MS)
  : 3000;

export const watchPreference = async (
  key: PreferenceKey,
  connection: Connection
): Promise<PreferenceWatch> => {
  if (isNaN(watchIntervalMs) || watchIntervalMs <= 0)
    throw new Error("PREF_EDITOR_WATCHER_INTERVAL_MS should be a number > 0");

  if (connection.filename)
    connection = Object.assign(connection, {
      filename: await filenameWithExtension(connection),
    });

  const existing = (await readPreferences(connection)).find(
    (p) => p.key === key.key
  );
  if (!existing) throw new Error(`Preference not found: ${key.key}`);

  let shouldStopRead = false;

  const close = () => {
    shouldStopRead = true;
    stream.destroy();
  };

  async function* readPref() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _start of setInterval(watchIntervalMs)) {
      if (shouldStopRead) break;

      const prefs = await readPreferences(connection);
      const pref = prefs.find((p) => p.key === key.key);

      if (!pref) throw new Error(`Preference not found: ${key.key}`);

      if (pref.value !== existing!.value) {
        yield pref.value;
        close();
        break;
      }
    }
  }

  const stream = Readable.from(readPref());

  return { stream, close };
};
