import { readPreferences } from "./adb/bridge";
export {
  App,
  File,
  Device,
  Preference,
  Apps,
  Files,
  Devices,
  FileType,
  Preferences,
  TypeTag,
  PartialPreference,
} from "./types/type";

export {
  listDevices,
  listApps,
  listFiles,
  readPreferences,
} from "./adb/bridge";

export { createFile } from "./utils/utils";

// DEV work
async function main() {
  console.log("Starting work...");
  // const pref = { key: "boolean", value: "false", tag: TypeTag.BOOLEAN };
  const url = URL.parse(
    "pref-editor://emulator-5554/com.charlesmuchene.datastore/legacy-prefs.xml"
  )!;
  console.log(await readPreferences(url));
}

main().catch(console.error);
