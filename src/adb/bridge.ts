import { Op } from "./operations";
import { Apps, Files, FileType } from "./../types/type";
import Adb, { Device as FarmDevice } from "@devicefarmer/adbkit";
import { Devices } from "../types/type";
import { decodeDatastorePrefs } from "../utils/proto-utils";
import { parseKeyValue as decodeKeyValuePrefs } from "../utils/xml-utils";
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
  if (file.type === FileType.KEY_VALUE) return decodeKeyValuePrefs(output);
  if (file.type === FileType.DATA_STORE) return decodeDatastorePrefs(output);

  throw new Error("Unknown file type");
};

export const writeToDatastore = async (
  url: URL,
  data: Uint8Array<ArrayBufferLike>
) => {
  const connection = createConnection(url);
  const file = createFile(connection.file!);
  const path = filePath(file);
  const encodedData = Buffer.from(data).toString("base64");
  await shell(
    connection.device,
    `run-as ${connection.app} sh -c 'echo ${encodedData} | base64 -d | dd of=${path} status=none'`
  );
};

export const writeToKeyValue = async (
  url: URL,
  op: Op,
  matcher: string,
  content?: string
) => {
  const connection = createConnection(url);
  const file = createFile(connection.file!);
  const path = filePath(file);
  let expression: string;
  switch (op) {
    case Op.ADD:
      expression = `/${matcher}/i${content}`;
      break;
    case Op.CHANGE:
      expression = `s/${matcher}/${content}/`;
      break;
    case Op.DELETE:
      expression = `/${matcher}/d`;
      break;
    default:
      throw new Error(`Unknown operation: ${op}`);
  }
  await shell(
    connection.device,
    `run-as ${connection.app} sed -Ei -e '${expression}' ${path}`
  );
};
