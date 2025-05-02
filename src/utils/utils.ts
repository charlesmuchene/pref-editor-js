import { listFiles } from "../adb/bridge";
import { Connection, File, FileType } from "../types/type";

export const STRINGSET_SEPARATOR = "|";
export const fileTypeFromName = (filename: string): FileType => {
  const type = filename.endsWith(".xml")
    ? FileType.KEY_VALUE
    : filename.endsWith(".preferences_pb")
    ? FileType.DATA_STORE
    : undefined;

  if (!type) throw new Error("Unknown file type");
  return type;
};

export function createFile(name: string): File {
  const type = fileTypeFromName(name);
  return { name, type };
}

export function filePath(file: File): string {
  switch (file.type) {
    case "key_value":
      return `shared_prefs/${file.name}`;
    case "data_store":
      return `files/datastore/${file.name}`;
  }
  throw new Error("Unknown file type");
}

export const validUrl = (url: URL): boolean => {
  return url.protocol.startsWith("pref-editor");
};

export const assertType = (value: string, type: string) => {
  let shouldThrow = true;
  switch (type) {
    case "string":
      shouldThrow = false;
      break;
    case "number":
    case "integer":
    case "float":
    case "double":
      shouldThrow = isNaN(Number(value));
      break;
    case "boolean":
      shouldThrow = value !== "true" && value !== "false";
      break;
    case "bigint":
    case "long":
      try {
        BigInt(value);
        shouldThrow = false;
      } catch {
        /* empty */
      }
      break;
  }
  if (shouldThrow) throw new Error(`'${value}' cannot be cast to '${type}'`);
};

export const filenameWithExtension = async (
  connection: Connection
): Promise<string> => {
  const regex = /.*\.(xml|preferences_pb)$/;
  const filename = connection.filename;
  if (filename === undefined) throw new Error("Missing filename");

  if (regex.test(filename)) return filename;

  const files = await listFiles(connection);

  const keyValueFile = files
    .filter((file) => file.type == FileType.KEY_VALUE)
    .find((file) => file.name.startsWith(filename));

  const datastoreFile = files
    .filter((file) => file.type == FileType.DATA_STORE)
    .find((file) => file.name.startsWith(filename));

  if (keyValueFile !== undefined && datastoreFile !== undefined)
    throw new Error(
      `Ambiguous file name ('${filename}'): provide the filename with extension`
    );

  if (keyValueFile !== undefined) return keyValueFile.name;
  if (datastoreFile !== undefined) return datastoreFile.name;

  throw new Error(
    `Cannot determine file: '${filename}'. Ensure the file exists and provide the filename with extension`
  );
};
