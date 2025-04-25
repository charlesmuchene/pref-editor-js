import { File, FileType, Type } from "../types/type";
import { IValue, Value } from "../protos/message";

export function extractTypeValue(
  value: IValue
): { type: Type; value: string } | undefined {
  if (!(value instanceof Value)) throw new Error(`Unknown value: ${value}`);

  switch (value.value) {
    case "string":
      return { type: Type.STRING, value: value.string! };
    case "integer":
      return { type: Type.INTEGER, value: value.integer!.toString() };
    case "float":
      return { type: Type.FLOAT, value: value.float!.toString() };
    case "boolean":
      return { type: Type.BOOLEAN, value: value.boolean!.toString() };
    case "long":
      return { type: Type.LONG, value: value.long!.toString() };
  }
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

export function createFile(filename: string): File {
  const type = filename.endsWith(".xml")
    ? FileType.KEY_VALUE
    : filename.endsWith(".preferences_pb")
    ? FileType.DATA_STORE
    : undefined;

  if (!type) throw new Error("Unknown file type");

  return { name: filename, type };
}
