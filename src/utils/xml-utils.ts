import { Preference, Preferences, TypeTag } from "../types/type";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { STRINGSET_SEPARATOR } from "./utils";

const INDENTATION = " ".repeat(4);

const createTypeTag = (key: string) => {
  switch (key) {
    case "int":
      return TypeTag.INTEGER;
    case "set":
      return TypeTag.STRINGSET;
    default:
      return TypeTag[key.toUpperCase() as keyof typeof TypeTag];
  }
};

interface Entry {
  "#text"?: string;
  string?: string[];
  value?: string;
  name: string;
}

const getValue = (type: string, entry: Entry): string => {
  switch (type) {
    case "string":
      return entry["#text"]!;
    case "set":
      return entry["string"]!.join(STRINGSET_SEPARATOR)!;
    default:
      return entry["value"]!;
  }
};

export const parseKeyValue = (buffer: Buffer<ArrayBufferLike>): Preferences => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  try {
    const map = parser.parse(buffer).map;
    return Object.keys(map).flatMap((type) => {
      const entry: Entry = map[type];
      return (Array.isArray(entry) ? entry : [entry]).map((item) => ({
        key: item.name,
        value: getValue(type, item),
        type: createTypeTag(type),
      }));
    });
  } catch {
    throw new Error("Malformed key-value preferences");
  }
};

export const encodeKeyValuePreference = (preference: Preference): string => {
  const builder = new XMLBuilder({
    format: true,
    indentBy: INDENTATION,
    ignoreAttributes: false,
    suppressEmptyNode: true,
    suppressBooleanAttributes: false,
  });
  let line: string;
  switch (preference.type) {
    case TypeTag.INTEGER:
      line = builder.build({
        int: { "@_name": preference.key, "@_value": preference.value },
      });
      break;
    case TypeTag.STRING:
      line = builder.build({
        string: { "@_name": preference.key, "#text": preference.value },
      });
      break;
    case TypeTag.STRINGSET:
      line = builder.build({
        set: {
          "@_name": preference.key,
          string: preference.value
            .split(STRINGSET_SEPARATOR)
            .map((entry) => ({ "#text": entry })),
        },
      });
      break;
    default:
      line = builder.build({
        [`${preference.type.toLowerCase()}`]: {
          "@_name": preference.key,
          "@_value": preference.value,
        },
      });
  }
  line = line.trimEnd();
  return line.endsWith("/>") ? `${line.slice(0, line.length - 2)} />` : line;
};
