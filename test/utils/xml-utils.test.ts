import { describe, it, expect } from "vitest";
import {
  parseKeyValue,
  encodeKeyValuePreference,
} from "../../src/utils/xml-utils";
import { TypeTag, Preference } from "../../src/types/type";

describe("XML Utils", () => {
  it("should parse key-value preferences with string type", () => {
    // Test lines 30: string case in getValue
    const xmlContent = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="test_string">Hello World</string>
</map>`;

    const buffer = Buffer.from(xmlContent);
    const result = parseKeyValue(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      key: "test_string",
      value: "Hello World",
      type: TypeTag.STRING,
    });
  });

  it("should parse key-value preferences with set type", () => {
    // Test set case in getValue
    const xmlContent = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <set name="test_set">
        <string>item1</string>
        <string>item2</string>
        <string>item3</string>
    </set>
</map>`;

    const buffer = Buffer.from(xmlContent);
    const result = parseKeyValue(buffer);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      key: "test_set",
      value: "item1|item2|item3",
      type: TypeTag.STRINGSET,
    });
  });

  it("should parse key-value preferences with default types", () => {
    // Test default case in getValue
    const xmlContent = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="test_bool" value="true" />
    <int name="test_int" value="42" />
    <long name="test_long" value="123456789" />
    <float name="test_float" value="3.14" />
</map>`;

    const buffer = Buffer.from(xmlContent);
    const result = parseKeyValue(buffer);

    expect(result).toHaveLength(4);
    expect(result.find((p) => p.key === "test_bool")).toEqual({
      key: "test_bool",
      value: "true",
      type: TypeTag.BOOLEAN,
    });
    expect(result.find((p) => p.key === "test_int")).toEqual({
      key: "test_int",
      value: "42",
      type: TypeTag.INTEGER,
    });
    expect(result.find((p) => p.key === "test_long")).toEqual({
      key: "test_long",
      value: "123456789",
      type: TypeTag.LONG,
    });
    expect(result.find((p) => p.key === "test_float")).toEqual({
      key: "test_float",
      value: "3.14",
      type: TypeTag.FLOAT,
    });
  });

  it("should handle createTypeTag function for int type", () => {
    // Test line 10: createTypeTag function for "int" case
    const xmlContent = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <int name="test_int" value="42" />
</map>`;

    const buffer = Buffer.from(xmlContent);
    const result = parseKeyValue(buffer);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(TypeTag.INTEGER);
    expect(result[0].key).toBe("test_int");
    expect(result[0].value).toBe("42");
  });

  it("should handle createTypeTag function for set type", () => {
    // Test line 12: createTypeTag function for "set" case
    const xmlContent = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <set name="test_set">
        <string>item1</string>
        <string>item2</string>
    </set>
</map>`;

    const buffer = Buffer.from(xmlContent);
    const result = parseKeyValue(buffer);

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(TypeTag.STRINGSET);
    expect(result[0].key).toBe("test_set");
    expect(result[0].value).toBe("item1|item2");
  });

  it("should throw error for malformed key-value preferences", () => {
    const invalidXml = "invalid xml content";
    const buffer = Buffer.from(invalidXml);

    expect(() => parseKeyValue(buffer)).toThrow(
      "Malformed key-value preferences"
    );
  });

  it("should encode INTEGER preference", () => {
    // Test lines 67-70: INTEGER case in encodeKeyValuePreference
    const preference: Preference = {
      key: "test_int",
      value: "42",
      type: TypeTag.INTEGER,
    };

    const result = encodeKeyValuePreference(preference);
    expect(result).toContain('<int name="test_int" value="42" />');
  });

  it("should encode STRING preference", () => {
    const preference: Preference = {
      key: "test_string",
      value: "Hello World",
      type: TypeTag.STRING,
    };

    const result = encodeKeyValuePreference(preference);
    expect(result).toContain('<string name="test_string">Hello World</string>');
  });

  it("should encode STRINGSET preference", () => {
    const preference: Preference = {
      key: "test_set",
      value: "item1|item2|item3",
      type: TypeTag.STRINGSET,
    };

    const result = encodeKeyValuePreference(preference);
    expect(result).toContain('<set name="test_set">');
    expect(result).toContain("<string>item1</string>");
    expect(result).toContain("<string>item2</string>");
    expect(result).toContain("<string>item3</string>");
  });

  it("should encode default type preferences", () => {
    // Test lines 77-85: default case in encodeKeyValuePreference
    const boolPreference: Preference = {
      key: "test_bool",
      value: "true",
      type: TypeTag.BOOLEAN,
    };

    const longPreference: Preference = {
      key: "test_long",
      value: "123456789",
      type: TypeTag.LONG,
    };

    const floatPreference: Preference = {
      key: "test_float",
      value: "3.14",
      type: TypeTag.FLOAT,
    };

    const boolResult = encodeKeyValuePreference(boolPreference);
    const longResult = encodeKeyValuePreference(longPreference);
    const floatResult = encodeKeyValuePreference(floatPreference);

    expect(boolResult).toContain('<boolean name="test_bool" value="true" />');
    expect(longResult).toContain('<long name="test_long" value="123456789" />');
    expect(floatResult).toContain('<float name="test_float" value="3.14" />');
  });

  it("should handle self-closing tag formatting", () => {
    const preference: Preference = {
      key: "test_bool",
      value: "false",
      type: TypeTag.BOOLEAN,
    };

    const result = encodeKeyValuePreference(preference);
    // Should format self-closing tags properly with space before />
    expect(result).toContain(" />");
    // The function ensures proper spacing, so this test verifies the formatting logic
    expect(result).toMatch(/<boolean name="test_bool" value="false" \/>/);
  });

  it("should handle round-trip parsing and encoding", () => {
    const xmlContent = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="string_pref">test_value</string>
    <boolean name="bool_pref" value="true" />
    <int name="int_pref" value="123" />
    <set name="set_pref">
        <string>a</string>
        <string>b</string>
        <string>c</string>
    </set>
</map>`;

    const buffer = Buffer.from(xmlContent);
    const parsed = parseKeyValue(buffer);

    expect(parsed).toHaveLength(4);

    // Test that we can encode each preference back
    parsed.forEach((pref) => {
      const encoded = encodeKeyValuePreference(pref);
      expect(encoded).toBeTruthy();
      expect(encoded.length).toBeGreaterThan(0);
    });
  });

  it("should handle array of entries for same type", () => {
    const xmlContent = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="string1">value1</string>
    <string name="string2">value2</string>
    <boolean name="bool1" value="true" />
    <boolean name="bool2" value="false" />
</map>`;

    const buffer = Buffer.from(xmlContent);
    const result = parseKeyValue(buffer);

    expect(result).toHaveLength(4);
    expect(result.filter((p) => p.type === TypeTag.STRING)).toHaveLength(2);
    expect(result.filter((p) => p.type === TypeTag.BOOLEAN)).toHaveLength(2);
  });
});
