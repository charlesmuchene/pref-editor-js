import {
  Connection,
  FileType,
  PartialPreference,
  Preference,
  PreferenceKey,
  Preferences,
} from "../types/type";
import { encodeDatastorePrefs } from "../utils/proto-utils";
import { readPreferences, writeToDatastore, writeToKeyValue } from "./bridge";
import { fileTypeFromName } from "../utils/utils";
import { encodeKeyValuePreference } from "../utils/xml-utils";

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
  const prefs: Preferences = await readPreferences(connection);

  const index = prefs.findIndex((p) => p.key === prefKey.key);
  if (index === -1) throw new Error(`Preference not found: ${prefKey.key}`);

  switch (fileTypeFromName(connection.filename!)) {
    case FileType.DATA_STORE:
      prefs.splice(index, 1);
      await writeToDatastore(connection, encodeDatastorePrefs(prefs));
      break;
    case FileType.KEY_VALUE:
      await writeToKeyValue(
        connection,
        Op.DELETE,
        escape(encodeKeyValuePreference(prefs[index]))
      );
      break;
  }
};

export const changePreference = async (
  preference: PartialPreference,
  connection: Connection
) => {
  const prefs: Preferences = await readPreferences(connection);

  const index = prefs.findIndex((p) => p.key === preference.key);
  if (index === -1) throw new Error(`Preference not found: ${preference.key}`);
  const existing = prefs[index];
  const newPref = {
    key: existing.key,
    value: preference.value,
    tag: existing.tag,
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
        escape(encodeKeyValuePreference(existing)),
        escape(encodeKeyValuePreference(newPref))
      );
      break;
  }
};
