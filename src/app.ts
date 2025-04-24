require("@dotenvx/dotenvx").config();
import { App, Device, File, FileType } from "./types/type";
import { readPreferences } from "./adb/bridge";

async function main() {
  const device: Device = {
    serial: process.env.SERIAL!,
    type: "device",
  };
  const app: App = {
    packageName: process.env.APP!,
  };
  const file: File = {
    name: process.env.PREF_FILE!,
    type: FileType.DATA_STORE,
  };
  const prefs = await readPreferences(device, app, file);
  console.log(prefs);
}

main().catch(console.error);
