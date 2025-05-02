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
import { createFile, filenameWithExtension, filePath } from "../utils/utils";
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
    .map((line: string) => ({ packageName: line.trim() }));

export const listFiles: (connection: Connection) => Promise<Files> = async (
  connection
) => {
  if (!connection.appId) throw new Error("Missing app id");

  const instructions = [
    { command: 'shared_prefs | grep "xml$"', type: FileType.KEY_VALUE },
    { command: 'files/datastore | grep "_pb$"', type: FileType.DATA_STORE },
  ];

  const output = await Promise.all(
    instructions.map(
      async (instruction) =>
        await shell(
          connection.deviceId,
          `run-as ${connection.appId} ls ${instruction.command}`
        )
    )
  );
  return output.flatMap((result, index) => {
    const content = result.toString();
    if (content.startsWith("run-as: unknown package:"))
      throw new Error(`Unknown app: ${connection.appId}`);
    return extractFiles(content, instructions[index].type);
  });
};

const extractFiles = (content: string, type: FileType): Files => {
  return content
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line: string) => ({
      name: line.trim(),
      type,
    }));
};

export const readPreferences: (
  connection: Connection
) => Promise<Preferences> = async (connection: Connection) => {
  if (!connection.appId) throw new Error("Missing app id");
  if (!connection.filename) throw new Error("Missing filename");
  connection = Object.assign(connection, {
    filename: await filenameWithExtension(connection),
  });

  const file = createFile(connection.filename!);
  const output = await shell(
    connection.deviceId,
    `run-as ${connection.appId} cat ${filePath(file)}`
  );
  if (output.toString().startsWith("run-as: unknown package:"))
    throw new Error(`Unknown app: ${connection.appId}`);

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
