import { Op } from "./operations";
import {
  Apps,
  Connection,
  Files,
  FileType,
  Preferences,
} from "./../types/type";
import { Devices } from "../types/type";
import { decodeDatastorePrefs } from "../utils/proto-utils";
import { parseKeyValue as decodeKeyValuePrefs } from "../utils/xml-utils";
import { createFile, filePath } from "../utils/utils";
import client from "./client";

const shell = async (serial: string, command: string) =>
  client.shell(serial, command);

export const listDevices: () => Promise<Devices> = async () =>
  client.listDevices();

export const listApps: (connection: Connection) => Promise<Apps> = async (
  connection
) =>
  (
    await shell(
      connection.deviceId,
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

export const listFiles: (connection: Connection) => Promise<Files> = async (
  connection
) =>
  Promise.all([
    ...(
      await shell(
        connection.deviceId,
        `run-as ${connection.appId} ls shared_prefs | grep "xml$"`
      )
    )
      .toString()
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line: string) => {
        return { name: line.trim(), type: FileType.KEY_VALUE };
      }),
    ...(
      await shell(
        connection.deviceId,
        `run-as ${connection.appId} ls files/datastore | grep "_pb$"`
      )
    )
      .toString()
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line: string) => {
        return { name: line.trim(), type: FileType.DATA_STORE };
      }),
  ]);

export const readPreferences: (
  connection: Connection
) => Promise<Preferences> = async (connection: Connection) => {
  const file = createFile(connection.filename!);
  const output = await shell(
    connection.deviceId,
    `run-as ${connection.appId} cat ${filePath(file)}`
  );
  if (file.type === FileType.KEY_VALUE) return decodeKeyValuePrefs(output);
  if (file.type === FileType.DATA_STORE) return decodeDatastorePrefs(output);

  throw new Error("Unknown file type");
};

export const writeToDatastore = async (
  connection: Connection,
  data: Uint8Array<ArrayBufferLike>
) => {
  const file = createFile(connection.filename!);
  const path = filePath(file);
  const encodedData = Buffer.from(data).toString("base64");
  await shell(
    connection.deviceId,
    `run-as ${connection.appId} sh -c 'echo ${encodedData} | base64 -d | dd of=${path} status=none'`
  );
};

export const writeToKeyValue = async (
  connection: Connection,
  op: Op,
  matcher: string,
  content?: string
) => {
  const file = createFile(connection.filename!);
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
    connection.deviceId,
    `run-as ${connection.appId} sed -Ei -e '${expression}' ${path}`
  );
};
