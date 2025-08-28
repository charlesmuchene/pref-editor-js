import { describe, it, expect } from "vitest";
import {
  decodeDatastorePrefs,
  encodeDatastorePrefs,
} from "../src/utils/proto-utils";
import { TypeTag, Preferences } from "../src/types/type";
import { PreferenceMap, Value, StringSet } from "../src/protos/message";

describe("Proto Utils", () => {
  it("should decode datastore preferences with STRINGSET type", () => {
    // Test lines 17-18: STRINGSET case in extractTypeValue
    const stringSetValue = Value.fromObject({
      stringSet: StringSet.fromObject({
        strings: ["item1", "item2", "item3"],
      }),
    });

    const prefMap = PreferenceMap.fromObject({
      preferences: {
        test_stringset: stringSetValue,
      },
    });

    const buffer = Buffer.from(PreferenceMap.encode(prefMap).finish());
    const result = decodeDatastorePrefs(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      key: "test_stringset",
      value: "item1|item2|item3",
      type: TypeTag.STRINGSET,
    });
  });

  it("should decode datastore preferences with BYTESARRAY type", () => {
    // Test lines 20-23: BYTESARRAY case in extractTypeValue
    const bytesValue = Value.fromObject({
      bytesArray: new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
    });

    const prefMap = PreferenceMap.fromObject({
      preferences: {
        test_bytes: bytesValue,
      },
    });

    const buffer = Buffer.from(PreferenceMap.encode(prefMap).finish());
    const result = decodeDatastorePrefs(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      key: "test_bytes",
      value: "Hello",
      type: TypeTag.BYTESARRAY,
    });
  });

  it("should decode datastore preferences with other types (default case)", () => {
    // Test default case in extractTypeValue
    const stringValue = Value.fromObject({
      string: "test_string_value",
    });

    const intValue = Value.fromObject({
      integer: 42,
    });

    const boolValue = Value.fromObject({
      boolean: true,
    });

    const prefMap = PreferenceMap.fromObject({
      preferences: {
        test_string: stringValue,
        test_int: intValue,
        test_bool: boolValue,
      },
    });

    const buffer = Buffer.from(PreferenceMap.encode(prefMap).finish());
    const result = decodeDatastorePrefs(buffer);

    expect(result).toHaveLength(3);
    expect(result.find((p) => p.key === "test_string")).toEqual({
      key: "test_string",
      value: "test_string_value",
      type: TypeTag.STRING,
    });
    expect(result.find((p) => p.key === "test_int")).toEqual({
      key: "test_int",
      value: "42",
      type: TypeTag.INTEGER,
    });
    expect(result.find((p) => p.key === "test_bool")).toEqual({
      key: "test_bool",
      value: "true",
      type: TypeTag.BOOLEAN,
    });
  });

  it("should throw error for malformed datastore preferences", () => {
    // Test catch block in decodeDatastorePrefs
    const invalidBuffer = Buffer.from("invalid protobuf data");

    expect(() => decodeDatastorePrefs(invalidBuffer)).toThrow(
      "Malformed datastore preferences"
    );
  });

  it("should throw error for invalid value in extractTypeValue", () => {
    // Test line 10: Unknown value error in extractTypeValue
    // Create an invalid Value object (without proper value property) to trigger
    // the error condition in extractTypeValue. The error will be caught by the
    // outer try-catch in decodeDatastorePrefs and re-thrown as "Malformed datastore preferences"
    const invalidValue = new Value();
    const prefMap = PreferenceMap.fromObject({
      preferences: {
        test_invalid: invalidValue,
      },
    });

    const buffer = Buffer.from(PreferenceMap.encode(prefMap).finish());

    // This triggers line 10 in extractTypeValue, which throws "Unknown value:" error
    // that gets caught and re-thrown as "Malformed datastore preferences"
    expect(() => decodeDatastorePrefs(buffer)).toThrow(
      "Malformed datastore preferences"
    );
  });

  it("should encode datastore preferences with STRINGSET type", () => {
    // Test lines 57-60: STRINGSET case in encodeDatastorePrefs
    const preferences: Preferences = [
      {
        key: "test_stringset",
        value: "item1|item2|item3",
        type: TypeTag.STRINGSET,
      },
    ];

    const encoded = encodeDatastorePrefs(preferences);
    const decoded = decodeDatastorePrefs(Buffer.from(encoded));

    expect(decoded).toHaveLength(1);
    expect(decoded[0]).toEqual(preferences[0]);
  });

  it("should encode datastore preferences with BYTESARRAY type", () => {
    // Test lines 62-65: BYTESARRAY case in encodeDatastorePrefs
    const preferences: Preferences = [
      {
        key: "test_bytes",
        value: "Hello",
        type: TypeTag.BYTESARRAY,
      },
    ];

    const encoded = encodeDatastorePrefs(preferences);
    const decoded = decodeDatastorePrefs(Buffer.from(encoded));

    expect(decoded).toHaveLength(1);
    expect(decoded[0]).toEqual(preferences[0]);
  });

  it("should encode datastore preferences with BOOLEAN type", () => {
    const preferences: Preferences = [
      {
        key: "test_bool_true",
        value: "true",
        type: TypeTag.BOOLEAN,
      },
      {
        key: "test_bool_false",
        value: "false",
        type: TypeTag.BOOLEAN,
      },
    ];

    const encoded = encodeDatastorePrefs(preferences);
    const decoded = decodeDatastorePrefs(Buffer.from(encoded));

    expect(decoded).toHaveLength(2);
    expect(decoded.find((p) => p.key === "test_bool_true")).toEqual(
      preferences[0]
    );
    expect(decoded.find((p) => p.key === "test_bool_false")).toEqual(
      preferences[1]
    );
  });

  it("should encode datastore preferences with default types", () => {
    // Test default case in encodeDatastorePrefs
    const preferences: Preferences = [
      {
        key: "test_string",
        value: "test_value",
        type: TypeTag.STRING,
      },
      {
        key: "test_int",
        value: "42",
        type: TypeTag.INTEGER,
      },
      {
        key: "test_float",
        value: "3.14",
        type: TypeTag.FLOAT,
      },
    ];

    const encoded = encodeDatastorePrefs(preferences);
    const decoded = decodeDatastorePrefs(Buffer.from(encoded));

    expect(decoded).toHaveLength(3);
    expect(decoded.find((p) => p.key === "test_string")).toEqual(
      preferences[0]
    );
    expect(decoded.find((p) => p.key === "test_int")).toEqual(preferences[1]);

    // Float precision may vary, so check key and type separately
    const floatResult = decoded.find((p) => p.key === "test_float");
    expect(floatResult?.key).toBe("test_float");
    expect(floatResult?.type).toBe(TypeTag.FLOAT);
    expect(parseFloat(floatResult?.value || "0")).toBeCloseTo(3.14, 2);
  });

  it("should handle round-trip encoding and decoding", () => {
    const preferences: Preferences = [
      {
        key: "string_pref",
        value: "test_string",
        type: TypeTag.STRING,
      },
      {
        key: "int_pref",
        value: "123",
        type: TypeTag.INTEGER,
      },
      {
        key: "bool_pref",
        value: "true",
        type: TypeTag.BOOLEAN,
      },
      {
        key: "stringset_pref",
        value: "a|b|c",
        type: TypeTag.STRINGSET,
      },
      {
        key: "bytes_pref",
        value: "bytes",
        type: TypeTag.BYTESARRAY,
      },
    ];

    const encoded = encodeDatastorePrefs(preferences);
    const decoded = decodeDatastorePrefs(Buffer.from(encoded));

    expect(decoded).toHaveLength(preferences.length);
    preferences.forEach((pref) => {
      expect(decoded.find((p) => p.key === pref.key)).toEqual(pref);
    });
  });
});
