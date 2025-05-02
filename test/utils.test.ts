import { Connection } from "../src";
import client from "../src/adb/client";
import { assertType, filenameWithExtension } from "./../src/utils/utils";

jest.mock("../src/adb/client");

describe("Utils", () => {
  it("should determine datastore filename with extension", async () => {
    const mock = client.shell as jest.Mock;
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
    const mock = client.shell as jest.Mock;
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
    const mock = client.shell as jest.Mock;
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
    const mock = client.shell as jest.Mock;
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
  });
});
