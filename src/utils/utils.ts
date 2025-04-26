import { File, FileType } from "../types/type";

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
