import { deletePreference } from "./adb/operations";

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
  console.log("Starting...");
  const pref = { key: "boolean", value: "true" };
  const url = URL.parse(
    "pref-editor://emulator-5554/com.charlesmuchene.datastore/proto.preferences_pb"
  )!;
  deletePreference(pref, url);
}

main().catch(console.error);
