import { addPreference, deletePreference } from "./adb/operations";
import { TypeTag } from "./types/type";

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
  const pref = { key: "boolean", value: "true", tag: TypeTag.BOOLEAN };
  const url = URL.parse(
    "pref-editor://emulator-5554/com.charlesmuchene.datastore/proto.preferences_pb"
  )!;
  addPreference(pref, url);
}

main().catch(console.error);
