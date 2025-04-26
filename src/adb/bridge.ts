import { Apps, Files, FileType } from "./../types/type";
import Adb, { Device as FarmDevice } from "@devicefarmer/adbkit";
import { Devices } from "../types/type";
import { parseDatastore } from "../utils/proto-utils";
import { parseKeyValue } from "../utils/xml-utils";
import { createConnection, createFile, filePath } from "../utils/utils";

const client = Adb.createClient();

const shell = async (serial: string, command: string) => {
  const stream = await client.getDevice(serial).shell(command);
  return await Adb.util.readAll(stream);
};

export const listDevices: () => Promise<Devices> = async () =>
  await client
    .listDevices()
    .then((devices: FarmDevice[]) =>
      devices.map((device) => ({ serial: device.id, state: device.type }))
    );

export const listApps: (url: URL) => Promise<Apps> = async (url) =>
  (
    await shell(
      createConnection(url).device,
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

export const listFiles: (url: URL) => Promise<Files> = async (url) => {
  const connection = createConnection(url);
  return Promise.all([
    (
      await shell(
        connection.device,
        `run-as ${connection.app} ls shared_prefs | grep "xml$"`
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
        connection.device,
        `run-as ${connection.app} ls files/datastore | grep "_pb$"`
      )
    )
      .toString()
      .trim()
      .split("\n")
      .map((line: string) => {
        return { name: line.trim(), type: FileType.DATA_STORE };
      }),
  ]);
};

export const readPreferences = async (url: URL) => {
  const connection = createConnection(url);
  const file = createFile(connection.file!);
  const output = await shell(
    connection.device,
    `run-as ${connection.app} cat ${filePath(file)}`
  );
  if (file.type === FileType.KEY_VALUE) return parseKeyValue(output);
  if (file.type === FileType.DATA_STORE) return parseDatastore(output);

  throw new Error("Unknown file type");
};
