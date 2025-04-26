import { PartialPreference } from "../types/type";
import { validUrl } from "../utils/utils";

export const deletePreference = async (
  preference: PartialPreference,
  url: URL
) => {
  if (!validUrl(url)) throw new Error(`Invalid URL: ${url}`);
  console.log(`Deleting preference: ${preference.key}`);
  // Read all preferences given the url
  // - construct: cxn from url
  // Remove the preference from the list
  // Write the remaining preferences back to the file
};
