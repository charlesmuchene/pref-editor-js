import { Preferences, TypeTag } from "../types/type";
import { IValue, PreferenceMap, Value } from "../protos/message";

export const STRINGSET_SEPARATOR = "|";

function extractTypeValue(value: IValue): {
  value: string;
  tag: TypeTag;
} {
  if (!(value instanceof Value) || !value.value)
    throw new Error(`Unknown value: ${value}`);

  const tag = TypeTag[value.value.toUpperCase() as keyof typeof TypeTag];
  let result: string;
  switch (value.value) {
    case "stringSet":
      result = value.stringSet!.strings!.join(STRINGSET_SEPARATOR);
      break;
    case "bytesArray":
      result = Array.from(value.bytesArray!)
        .map((byte) => String.fromCharCode(byte))
        .join("");
      break;
    default:
      result = value.value.toString();
  }

  return {
    tag,
    value: result,
  };
}

export const parseDatastore = (buffer: Buffer<ArrayBufferLike>): Preferences =>
  Object.entries(PreferenceMap.decode(buffer).preferences).map(
    ([key, value]) => {
      return {
        key,
        ...extractTypeValue(value),
      };
    }
  );
