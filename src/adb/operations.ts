import { Url } from "url";
import { PartialPreference } from "../types/type";

function validUrl(url: Url): boolean {
  return url.protocol === "pref-editor";
}

export const deletePreference = async (
  preference: PartialPreference,
  uri: Url
) => {
  if (!validUrl(uri)) throw new Error(`Invalid URL: ${uri}`);
  console.log(`Deleting preference: ${preference.key}`);
};
