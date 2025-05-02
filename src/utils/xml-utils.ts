import { Preference, Preferences, TypeTag } from "../types/type";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { STRINGSET_SEPARATOR } from "./utils";

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
    indentBy: " ".repeat(4),
    ignoreAttributes: false,
    suppressEmptyNode: true,
    suppressBooleanAttributes: false,
  });
  switch (preference.type) {
    case TypeTag.INTEGER:
      return builder.build({
        int: { "@_name": preference.key, "@_value": preference.value },
      });
    case TypeTag.STRING:
      return builder.build({
        string: { "@_name": preference.key, "#text": preference.value },
      });
    case TypeTag.STRINGSET: {
      return builder.build({
        set: {
          "@_name": preference.key,
          string: preference.value
            .split(STRINGSET_SEPARATOR)
            .map((entry) => ({ "#text": entry })),
        },
      });
    }
    default: {
      return builder.build({
        [`${preference.type.toLowerCase()}`]: {
          "@_name": preference.key,
          "@_value": preference.value,
        },
      });
    }
  }
};
