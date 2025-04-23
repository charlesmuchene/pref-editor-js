import { IValue, PreferenceMap, Value } from "../protos/message.js";
require("@dotenvx/dotenvx").config();
import Adb from "@devicefarmer/adbkit";
const path = require("path");

enum Type {
  STRING = "string",
  INTEGER = "integer",
  FLOAT = "float",
  BOOLEAN = "boolean",
  LONG = "long",
}

interface Preference {
  key: string;
  value: string;
  type: Type;
}

type Preferences = Array<Preference>;

function extractTypeValue(
  value: IValue
): { type: Type; value: string } | undefined {
  if (!(value instanceof Value)) throw new Error("Unknown value");

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

async function main() {
  const client = Adb.createClient();
  const adbDevice = client.getDevice(process.env.SERIAL!);
  const app = process.env.APP!;
  const filename = path.join("files", "datastore", process.env.PREF_FILE!);
  const command = `run-as ${app} cat ${filename}`;
  const stream = await adbDevice.shell(command);
  const output = await Adb.util.readAll(stream);
  const map = PreferenceMap.decode(output);
  const entries = Object.entries(map.preferences);
  const mapped = entries
    .filter(([_, value]) => extractTypeValue(value) !== undefined)
    .map(([key, value]) => {
      return {
        key,
        ...extractTypeValue(value)!,
      };
    });
  console.log(mapped);
}

main().catch(console.error);
