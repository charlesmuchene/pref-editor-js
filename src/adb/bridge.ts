import { App, Apps, Device, File, Files, FileType } from "./../types/type";
import Adb, { Device as FarmDevice } from "@devicefarmer/adbkit";
import { Devices } from "../types/type";
import { parseDatastore } from "../utils/proto-utils";
import { parseKeyValue } from "../utils/xml-utils";
import { filePath } from "../utils/utils";

const client = Adb.createClient();

export const getDevice: (serial: string) => Device = (serial: string) => ({
  serial,
  state: client.getDevice(serial).getState(),
});

const shell = async (device: Device, command: string) => {
  const stream = await client.getDevice(device.serial).shell(command);
  return await Adb.util.readAll(stream);
};

export const listDevices: () => Promise<Devices> = async () =>
  await client.listDevices().then((devices: FarmDevice[]) =>
    devices.map((device) => {
      return { serial: device.id, type: device.type };
    })
  );

export const listApps: (device: Device) => Promise<Apps> = async (
  device: Device
) =>
  (
    await shell(
      device,
      "pm list packages -3 --user 0 | sed 's/^package://g' | sort"
    )
  )
    .toString()
    .trim()
    .split("\n")
    .map((line: string) => {
      return {
        packageName: line.trim(),
      };
    });

export const listFiles: (device: Device, app: App) => Promise<Files> = async (
  device: Device,
  app: App
) =>
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
