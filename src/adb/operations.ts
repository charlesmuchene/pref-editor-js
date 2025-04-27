import {
  FileType,
  PartialPreference,
  Preference,
  Preferences,
} from "../types/type";
import { encodeDatastorePrefs } from "../utils/proto-utils";
import { readPreferences, writeToDatastore, writeToKeyValue } from "./bridge";
import { fileTypeFromUrl, validUrl } from "../utils/utils";
import { encodeKeyValuePreference } from "../utils/xml-utils";

export enum Op {
  ADD = "add",
  DELETE = "delete",
  CHANGE = "change",
}

const escape = (content: string) => content.replace(/\//g, "\\/").trim();

export const addPreference = async (preference: Preference, url: URL) => {
  if (!validUrl(url)) throw new Error(`Invalid URL: ${url}`);

  const prefs: Preferences = await readPreferences(url);

  if (prefs.some((p) => p.key === preference.key))
    throw new Error(`Preference already exists: ${preference.key}`);

  switch (fileTypeFromUrl(url)) {
    case FileType.DATA_STORE:
      {
        prefs.push(preference);
        await writeToDatastore(url, encodeDatastorePrefs(prefs));
      }
      break;
    case FileType.KEY_VALUE:
      await writeToKeyValue(
        url,
        Op.ADD,
        escape("</map>"),
        escape(encodeKeyValuePreference(preference))
      );
      break;
  }
};

export const deletePreference = async (
  preference: PartialPreference,
  url: URL
) => {
  if (!validUrl(url)) throw new Error(`Invalid URL: ${url}`);

  const prefs: Preferences = await readPreferences(url);

  const index = prefs.findIndex((p) => p.key === preference.key);
  if (index === -1) throw new Error(`Preference not found: ${preference.key}`);

  switch (fileTypeFromUrl(url)) {
    case FileType.DATA_STORE:
      prefs.splice(index, 1);
      await writeToDatastore(url, encodeDatastorePrefs(prefs));
      break;
    case FileType.KEY_VALUE:
      await writeToKeyValue(
        url,
        Op.DELETE,
        escape(encodeKeyValuePreference(prefs[index]))
      );
      break;
  }
};

export const changePreference = async (
  preference: PartialPreference,
  url: URL
) => {
  if (!validUrl(url)) throw new Error(`Invalid URL: ${url}`);

  const prefs: Preferences = await readPreferences(url);

  const index = prefs.findIndex((p) => p.key === preference.key);
  if (index === -1) throw new Error(`Preference not found: ${preference.key}`);
  const existing = prefs[index];
  const newPref = {
    key: existing.key,
    value: preference.value,
    tag: existing.tag,
  };
  switch (fileTypeFromUrl(url)) {
    case FileType.DATA_STORE:
      {
        prefs[index] = newPref;
        await writeToDatastore(url, encodeDatastorePrefs(prefs));
      }
      break;
    case FileType.KEY_VALUE:
      await writeToKeyValue(
        url,
        Op.CHANGE,
        escape(encodeKeyValuePreference(existing)),
        escape(encodeKeyValuePreference(newPref))
      );
      break;
  }
};
