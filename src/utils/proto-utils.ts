import { Preferences, TypeTag } from "../types/type";
import { IValue, PreferenceMap, StringSet, Value } from "../protos/message";

export const STRINGSET_SEPARATOR = "|";

function extractTypeValue(value: IValue): {
  value: string;
  tag: TypeTag;
} {
  if (!(value instanceof Value) || !value.value)
    throw new Error(`Unknown value: ${value}`);
  const type = value.value;

  const tag = TypeTag[type.toUpperCase() as keyof typeof TypeTag];
  let result: string;
  switch (type) {
    case TypeTag.STRINGSET:
      result = value.stringSet!.strings!.join(STRINGSET_SEPARATOR);
      break;
    case TypeTag.BYTESARRAY:
      result = Array.from(value.bytesArray!)
        .map((byte) => String.fromCharCode(byte))
        .join("");
      break;
    default:
      result = value[type]!.toString();
  }

  return {
    tag,
    value: result,
  };
}

export const decodeDatastorePrefs = (
  buffer: Buffer<ArrayBufferLike>
): Preferences =>
  Object.entries(PreferenceMap.decode(buffer).preferences).map(
    ([key, value]) => {
      return {
        key,
        ...extractTypeValue(value),
      };
    }
  );

export const encodeDatastorePrefs = (preferences: Preferences): Uint8Array => {
  const entries = new Map(
    preferences.map((pref) => {
      let value: StringSet | Uint8Array | string | boolean;
      switch (pref.tag) {
        case TypeTag.STRINGSET:
          value = StringSet.fromObject({
            strings: pref.value.split(STRINGSET_SEPARATOR),
          });
          break;
        case TypeTag.BYTESARRAY:
          value = new Uint8Array(
            Array.from(pref.value).map((char) => char.charCodeAt(0))
          );
          break;
        case TypeTag.BOOLEAN:
          value = pref.value === "true" ? true : false;
          break;
        default:
          value = pref.value;
      }

      return [
        `${pref.key}`,
        Value.fromObject({
          [`${pref.tag.toString()}`]: value,
        }),
      ];
    })
  );
  return PreferenceMap.encode({
    preferences: Object.fromEntries(entries),
  }).finish();
};
