import { PartialPreference, Preference, Preferences } from "../types/type";
import { encodeDatastorePrefs } from "../utils/proto-utils";
import { readPreferences, writePreferences } from "./bridge";
import { validUrl } from "../utils/utils";

export const addPreference = async (preference: Preference, url: URL) => {
  if (!validUrl(url)) throw new Error(`Invalid URL: ${url}`);

  const prefs: Preferences = await readPreferences(url);

  if (prefs.some((p) => p.key === preference.key))
    throw new Error(`Preference already exists: ${preference.key}`);
  prefs.push(preference);
  const encodedPrefs = encodeDatastorePrefs(prefs);
  await writePreferences(url, encodedPrefs);
};

export const deletePreference = async (
  preference: PartialPreference,
  url: URL
) => {
  if (!validUrl(url)) throw new Error(`Invalid URL: ${url}`);

  const prefs: Preferences = await readPreferences(url);

  const index = prefs.findIndex((p) => p.key === preference.key);
  if (index === -1) throw new Error(`Preference not found: ${preference.key}`);
  prefs.splice(index, 1);

  const encodedPrefs = encodeDatastorePrefs(prefs);
  await writePreferences(url, encodedPrefs);
};
