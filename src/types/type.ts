export enum TypeTag {
  LONG = "long",
  FLOAT = "float",
  DOUBLE = "double",
  STRING = "string",
  BOOLEAN = "boolean",
  INTEGER = "integer",
  STRINGSET = "stringSet",
  BYTESARRAY = "bytesArray",
}

export type Devices = Array<Device>;

export type DeviceState =
  | "emulator"
  | "device"
  | "offline"
  | "unauthorized"
  | "unknown";

export interface Device {
  serial: string;
  state: DeviceState;
}

export type Apps = Array<App>;

export interface App {
  packageName: string;
}

export enum FileType {
  KEY_VALUE = "key_value",
  DATA_STORE = "data_store",
}

export type Files = Array<File>;

export interface File {
  name: string;
  type: FileType;
}

export type Preferences = Array<Preference>;

export interface PreferenceKey {
  key: string;
}

export interface PartialPreference extends PreferenceKey {
  value: string;
}

export interface Preference extends PartialPreference {
  tag: TypeTag;
}

export interface Connection {
  deviceId: string;
  appId?: string;
  filename?: string;
}
