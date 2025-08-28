import { describe, it, expect, vi, type Mock } from "vitest";
import { Connection, FileType } from "../src";
import client from "../src/adb/client";
import {
  assertType,
  filenameWithExtension,
  fileTypeFromName,
  createFile,
  filePath,
  validUrl,
} from "./../src/utils/utils";

vi.mock("../src/adb/client");

describe("Utils", () => {
  it("should determine datastore filename with extension", async () => {
    const mock = client.shell as Mock;
    mock
      .mockImplementationOnce(() =>
        Promise.resolve("legacy-prefs.xml\napp.xml\n")
      )
      .mockImplementationOnce(() =>
        Promise.resolve("modern.preferences_pb\nsettings.preferences_pb\n")
      );

    expect(
      await filenameWithExtension({
        deviceId: "12354",
        appId: "com.app.id",
        filename: "settings",
      })
    ).toBe("settings.preferences_pb");
  });

  it("should determine key-value filename with extension", async () => {
    const mock = client.shell as Mock;
    mock
      .mockImplementationOnce(() =>
        Promise.resolve("legacy-prefs.xml\napp.xml\n")
      )
      .mockImplementationOnce(() =>
        Promise.resolve("modern.preferences_pb\nsettings.preferences_pb\n")
      );

    expect(
      await filenameWithExtension({
        deviceId: "12354",
        appId: "com.app.id",
        filename: "legacy-prefs",
      })
    ).toBe("legacy-prefs.xml");
  });

  it("should throw if filename is ambiguous", async () => {
    const connection: Connection = {
      deviceId: "12354",
      appId: "com.app.id",
      filename: "settings",
    };
    const mock = client.shell as Mock;
    mock
      .mockImplementationOnce(() =>
        Promise.resolve("legacy-prefs.xml\nsettings.xml\n")
      )
      .mockImplementationOnce(() =>
        Promise.resolve("modern.preferences_pb\nsettings.preferences_pb\n")
      );

    await expect(filenameWithExtension(connection)).rejects.toThrow(
      `Ambiguous file name ('${connection.filename}'): provide the filename with extension`
    );
  });

  it("should throw if filename is not found", async () => {
    const connection: Connection = {
      deviceId: "12354",
      appId: "com.app.id",
      filename: "app",
    };
    const mock = client.shell as Mock;
    mock
      .mockImplementationOnce(() =>
        Promise.resolve("legacy-prefs.xml\nsettings.xml\n")
      )
      .mockImplementationOnce(() =>
        Promise.resolve("modern.preferences_pb\nsettings.preferences_pb\n")
      );

    await expect(filenameWithExtension(connection)).rejects.toThrow(
      `Cannot determine file: '${connection.filename}'. Ensure the file exists and provide the filename with extension`
    );
  });

  it("should validate value types", () => {
    expect(() => assertType("string", "string")).not.toThrow();

    expect(() => assertType("1234", "boolean")).toThrow();
    expect(() => assertType("abcd", "number")).toThrow();
    expect(() => assertType("123abcd", "number")).toThrow();
    expect(() => assertType("abcd123", "number")).toThrow();
    expect(() => assertType("1234", "number")).not.toThrow();
    expect(() => assertType("1234", "integer")).not.toThrow();
    expect(() => assertType("1234", "float")).not.toThrow();
    expect(() => assertType("1234", "double")).not.toThrow();
    expect(() => assertType("1234.123", "float")).not.toThrow();
    expect(() => assertType("1234.123", "double")).not.toThrow();
    expect(() => assertType("1234", "double")).not.toThrow();
    expect(() => assertType("1234", "long")).not.toThrow();
    expect(() => assertType("false", "boolean")).not.toThrow();
    expect(() => assertType("true", "boolean")).not.toThrow();
    expect(() => assertType("truthy", "boolean")).toThrow();
    expect(() => assertType("true", "bool")).toThrow();

    // Test bigint validation (lines 32-33)
    expect(() =>
      assertType("123456789012345678901234567890", "bigint")
    ).not.toThrow();
    expect(() => assertType("invalid_bigint", "bigint")).toThrow();
  });

  it("should throw error for unknown file type", () => {
    // Test line 10: Unknown file type error
    expect(() => fileTypeFromName("unknown.txt")).toThrow("Unknown file type");
    expect(() => fileTypeFromName("file")).toThrow("Unknown file type");
    expect(() => fileTypeFromName("file.json")).toThrow("Unknown file type");
  });

  it("should determine file type from name", () => {
    expect(fileTypeFromName("prefs.xml")).toBe(FileType.KEY_VALUE);
    expect(fileTypeFromName("settings.preferences_pb")).toBe(
      FileType.DATA_STORE
    );
  });

  it("should create file with correct type", () => {
    const xmlFile = createFile("prefs.xml");
    expect(xmlFile).toEqual({ name: "prefs.xml", type: FileType.KEY_VALUE });

    const pbFile = createFile("settings.preferences_pb");
    expect(pbFile).toEqual({
      name: "settings.preferences_pb",
      type: FileType.DATA_STORE,
    });
  });

  it("should generate correct file paths", () => {
    const keyValueFile = { name: "prefs.xml", type: FileType.KEY_VALUE };
    const dataStoreFile = {
      name: "settings.preferences_pb",
      type: FileType.DATA_STORE,
    };

    expect(filePath(keyValueFile)).toBe("shared_prefs/prefs.xml");
    expect(filePath(dataStoreFile)).toBe(
      "files/datastore/settings.preferences_pb"
    );
  });

  it("should throw error for unknown file type in filePath", () => {
    // Test lines 28-29: Unknown file type error in filePath function
    const invalidFile = {
      name: "test.txt",
      type: "invalid_type" as any, // Force invalid type to test error path
    };

    expect(() => filePath(invalidFile)).toThrow("Unknown file type");
  });

  it("should validate URLs", () => {
    const validPrefUrl = new URL("pref-editor://test");
    const validPrefUrlSecure = new URL("pref-editor-secure://test");
    const invalidUrl = new URL("https://example.com");

    expect(validUrl(validPrefUrl)).toBe(true);
    expect(validUrl(validPrefUrlSecure)).toBe(true);
    expect(validUrl(invalidUrl)).toBe(false);
  });

  it("should throw error for missing filename", async () => {
    const connection: Connection = {
      deviceId: "12354",
      appId: "com.app.id",
      filename: undefined,
    };

    await expect(filenameWithExtension(connection)).rejects.toThrow(
      "Missing filename"
    );
  });

  it("should return filename if it already has extension", async () => {
    const connection: Connection = {
      deviceId: "12354",
      appId: "com.app.id",
      filename: "prefs.xml",
    };

    expect(await filenameWithExtension(connection)).toBe("prefs.xml");

    connection.filename = "settings.preferences_pb";
    expect(await filenameWithExtension(connection)).toBe(
      "settings.preferences_pb"
    );
  });
});
