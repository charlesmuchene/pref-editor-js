import { Connection, File, FileType } from "../types/type";
import assert from "assert";

export function createFile(filename: string): File {
  const type = filename.endsWith(".xml")
    ? FileType.KEY_VALUE
    : filename.endsWith(".preferences_pb")
    ? FileType.DATA_STORE
    : undefined;

  if (!type) throw new Error("Unknown file type");

  return { name: filename, type };
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

const extractSegments = (url: URL) =>
  url.pathname
    ? url.pathname.split("/").filter((segment) => segment !== "")
    : [];

export const createConnection = (url: URL): Connection => {
  assert(url.hostname, "Device serial not found in URL");
  const segments = extractSegments(url);
  return {
    device: url.hostname,
    app: segments[0],
    file: segments[1],
  };
};
