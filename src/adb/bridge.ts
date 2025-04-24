import { App, Device, File, FileType, Preferences } from "./../types/type";
import Adb, { Device as FarmDevice } from "@devicefarmer/adbkit";
import { extractTypeValue, filePath } from "../utils/utils";
import { PreferenceMap } from "../../protos/message";
import { Devices } from "../types/type";

const client = Adb.createClient();

export const getDevice = (serial: string) => client.getDevice(serial);

async function shell(device: Device, command: string) {
  const stream = await getDevice(device.serial).shell(command);
  return await Adb.util.readAll(stream);
}

export const listDevices: () => Promise<Devices> = async () =>
  await client.listDevices().then((devices: FarmDevice[]) =>
    devices.map((device) => {
      return { serial: device.id, type: device.type };
    })
  );

export const listApps = async (device: Device) =>
  (
    await shell(
      device,
      "pm list packages -3 --user 0 | sed 's/^package://g' | sort"
    )
  )
    .toString()
    .split("\n")
    .map((line: string) => {
      return {
        packageName: line.trim(),
      };
    });

export const listFiles = async (device: Device, app: App) =>
  Promise.all([
    (
      await shell(
        device,
        `run-as ${app.packageName} ls shared_prefs | grep "xml$"`
      )
    )
      .toString()
      .trim()
      .split("\n")
      .map((line: string) => {
        return { name: line.trim(), type: FileType.KEY_VALUE };
      }),
    (
      await shell(
        device,
        `run-as ${app.packageName} ls files/datastore | grep "_pb$"`
      )
    )
      .toString()
      .trim()
      .split("\n")
      .map((line: string) => {
        return { name: line.trim(), type: FileType.DATA_STORE };
      }),
  ]);

export const readPreferences = async (device: Device, app: App, file: File) => {
  const output = await shell(
    device,
    `run-as ${app.packageName} cat ${filePath(file)}`
  );
  if (file.type === FileType.KEY_VALUE) return parseKeyValue(output);
  if (file.type === FileType.DATA_STORE) return parseDatastore(output);

  throw new Error("Unknown file type");
};

const parseDatastore = (buffer: Buffer<ArrayBufferLike>): Preferences =>
  Object.entries(PreferenceMap.decode(buffer).preferences)
    .filter(([_key, value]) => extractTypeValue(value) !== undefined)
    .map(([key, value]) => {
      return {
        key,
        ...extractTypeValue(value)!,
      };
    });

function parseKeyValue(_buffer: Buffer<ArrayBufferLike>): Preferences {
  return [];
}
