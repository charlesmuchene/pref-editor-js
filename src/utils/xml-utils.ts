import { Preference, Preferences, TypeTag } from "../types/type";
import { XMLParser } from "fast-xml-parser";
import { STRINGSET_SEPARATOR } from "./utils";

const createTag = (key: string) => {
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
  const map = parser.parse(buffer).map;
  return Object.keys(map).flatMap((type) => {
    const entry: Entry = map[type];
    return (Array.isArray(entry) ? entry : [entry]).map((item) => ({
      key: item.name,
      value: getValue(type, item),
      tag: createTag(type),
    }));
  });
};

export const encodeKeyValuePreference = (preference: Preference): string => {
  switch (preference.tag) {
    case TypeTag.INTEGER:
      return `<int name="${preference.key}" value="${preference.value}" />`;
    case TypeTag.STRING:
      return `<string name="${preference.key}">${preference.value}</string>`;
    case TypeTag.STRINGSET: {
      const entries = preference.value
        .split(STRINGSET_SEPARATOR)
        .map((entry) => `<string>${entry}</string>`)
        .join("\n");
      return `<set name="${preference.key}">\n${entries}\n</set>`;
    }
    default: {
      return `<${preference.tag.toLowerCase()} name="${
        preference.key
      }" value="${preference.value}" />`;
    }
  }
};
