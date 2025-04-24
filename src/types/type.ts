export enum Type {
  STRING = "string",
  INTEGER = "integer",
  FLOAT = "float",
  BOOLEAN = "boolean",
  LONG = "long",
}

export type Devices = Array<Device>;

export interface Device {
  serial: string;
  type: "emulator" | "device" | "offline" | "unauthorized" | "unknown";
}

export type Apps = Array<App>;

export interface App {
  packageName: string;
}

export enum FileType {
  KEY_VALUE = "key_value",
  DATA_STORE = "data_store",
}

export interface File {
  name: string;
  type: FileType;
}

export interface Preference {
  key: string;
  value: string;
  type: Type;
}

export type Preferences = Array<Preference>;
