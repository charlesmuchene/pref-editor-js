import {
  listDevices,
  listApps,
  listFiles,
  readPreferences,
  writeToDatastore,
  writeToKeyValue,
} from "../src/adb/bridge";
import { Op } from "../src/adb/operations";
import client from "../src/adb/client";
import { FileType } from "../src";

jest.mock("../src/adb/client");

const encodedProtobufPrefs =
  "Cg8KCWlzVmlzaXRlZBICCAAKEAoKc29tZS1jb3VudBICGA4KFQoJdGVtcC1uYW1lEggqBmNoYXJsbwoUCgdhdmVyYWdlEgk5mpmZmZmZFUA=";

const keyValuePrefs = `
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="boolean" value="true" />
    <string name="string">fourteen</string>
</map>`;

describe("Bridge", () => {
  const mock = client.shell as jest.Mock;

  afterEach(() => jest.clearAllMocks);

  it("should list devices", async () => {
    const dev = [{ serial: "12345", state: "device" }];

    const mock = client.listDevices as jest.Mock;
    mock.mockImplementation(() => Promise.resolve(dev));

    const devices = await listDevices();

    expect(devices).toEqual(devices);
  });

  it("should list apps", async () => {
    const output = " com.charlesmuchene.app\ncom.example.app\n";
    mock.mockImplementation(() => Promise.resolve(output));

    const apps = await listApps({ deviceId: "12345" });

    expect(apps).toEqual([
      { packageName: "com.charlesmuchene.app" },
      { packageName: "com.example.app" },
    ]);
  });

  it("should list files", async () => {
    mock
      .mockImplementationOnce(() =>
        Promise.resolve("legacy-prefs.xml\napp.xml\n")
      )
      .mockImplementationOnce(() =>
        Promise.resolve("modern.preferences_pb\napp.preferences_pb\n")
      );

    const files = await listFiles({ deviceId: "12345", appId: "app.id" });

    expect(files).toEqual([
      { name: "legacy-prefs.xml", type: FileType.KEY_VALUE },
      { name: "app.xml", type: FileType.KEY_VALUE },
      { name: "modern.preferences_pb", type: FileType.DATA_STORE },
      { name: "app.preferences_pb", type: FileType.DATA_STORE },
    ]);
  });

  it("should read preferences", async () => {
    const output = Buffer.from(encodedProtobufPrefs, "base64");
    mock.mockImplementation(() => Promise.resolve(output));

    const preferences = await readPreferences({
      deviceId: "12345",
      appId: "app.id",
      filename: "settings.preferences_pb",
    });

    expect(preferences).toEqual(preferences);
  });
});

describe("Malformed input", () => {
  const mock = client.shell as jest.Mock;

  afterEach(() => jest.clearAllMocks);

  it("should fail for invalid app id", async () => {
    mock.mockImplementation(() =>
      Promise.reject(new Error("Unknown device id"))
    );

    await expect(listApps({ deviceId: "12345" })).rejects.toThrow();

    mock.mockImplementation(() =>
      Promise.resolve(
        Buffer.from(`run-as: unknown package: app.does.not.exist`)
      )
    );

    await expect(listFiles({ deviceId: "12345" })).rejects.toThrow(
      "Missing app id"
    );

    await expect(
      listFiles({ deviceId: "12345", appId: "non.existing.app.id" })
    ).rejects.toThrow(`Unknown app: non.existing.app.id`);
  });

  it("should fail for invalid filename", async () => {
    mock.mockImplementation(() =>
      Promise.resolve(
        Buffer.from(`run-as: unknown package: app.does.not.exist`)
      )
    );

    await expect(readPreferences({ deviceId: "12345" })).rejects.toThrow(
      "Missing app id"
    );

    await expect(
      readPreferences({ deviceId: "12345", filename: "legacy.xml" })
    ).rejects.toThrow("Missing app id");

    await expect(
      readPreferences({ deviceId: "12345", appId: "app.does.exist" })
    ).rejects.toThrow("Missing filename");

    await expect(
      readPreferences({
        deviceId: "12345",
        appId: "app.does.exist",
        filename: "legacy.xml",
      })
    ).rejects.toThrow(`Unknown app: app.does.exist`);
  });

  it("should fail for malformed datastore content", async () => {
    const output = Buffer.from(encodedProtobufPrefs.slice(10), "base64");
    mock.mockImplementation(() => Promise.resolve(output));

    await expect(
      readPreferences({
        deviceId: "12345",
        appId: "app.does.exist",
        filename: "settings.preferences_pb",
      })
    ).rejects.toThrow(`Malformed datastore preferences`);
  });

  it("should fail for malformed key-value content", async () => {
    const output = Buffer.from(keyValuePrefs.slice(60), "utf-8");
    mock.mockImplementation(() => Promise.resolve(output));

    await expect(
      readPreferences({
        deviceId: "12345",
        appId: "app.does.exist",
        filename: "settings.xml",
      })
    ).rejects.toThrow(`Malformed key-value preferences`);
  });
});

describe("Bridge shell", () => {
  const mock = client.shell as jest.Mock;

  afterEach(() => jest.clearAllMocks);

  it("should invoke command to write datastore preferences", async () => {
    const buffer = Buffer.from(encodedProtobufPrefs, "base64");
    const connection = {
      deviceId: "12345",
      appId: "app.id",
      filename: "settings.preferences_pb",
    };
    await writeToDatastore(connection, buffer);

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sh -c 'echo ${encodedProtobufPrefs} | base64 -d | dd of=files/datastore/${connection.filename} status=none'`
    );
  });

  it("should invoke command to write key-value preferences", async () => {
    const connection = {
      deviceId: "12345",
      appId: "app.id",
      filename: "prefs.xml",
    };
    const matcher = '<boolean name="isVisited" value="true" />';
    const content = '<boolean name="isVisited" value="false" />';
    await writeToKeyValue(connection, Op.CHANGE, matcher, content);

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sed -Ei -e 's/${matcher}/${content}/' shared_prefs/${connection.filename}`
    );
  });

  it("should invoke listing apps command", async () => {
    const connection = {
      deviceId: "12345",
    };
    const output = " com.charlesmuchene.app\ncom.example.app\n";
    mock.mockImplementation(() => Promise.resolve(output));

    await listApps(connection);

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      "pm list packages -3 --user 0 | sed 's/^package://g' | sort"
    );
  });

  it("should invoke command to list files", async () => {
    const connection = {
      deviceId: "12345",
      appId: "app.id",
    };
    mock
      .mockImplementationOnce(() =>
        Promise.resolve("legacy-prefs.xml\napp.xml\n")
      )
      .mockImplementationOnce(() =>
        Promise.resolve("modern.preferences_pb\napp.preferences_pb\n")
      );

    await listFiles(connection);

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      'run-as app.id ls shared_prefs | grep "xml$"'
    );
    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      'run-as app.id ls files/datastore | grep "_pb$"'
    );
  });

  it("should invoke command for reading preferences", async () => {
    const connection = {
      deviceId: "12345",
      appId: "app.id",
    };
    mock.mockImplementation(() =>
      Promise.resolve(Buffer.from(encodedProtobufPrefs, "base64"))
    );

    await readPreferences({
      ...connection,
      filename: "settings.preferences_pb",
    });

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} cat files/datastore/settings.preferences_pb`
    );

    mock.mockImplementation(() =>
      Promise.resolve(Buffer.from(keyValuePrefs, "utf-8"))
    );

    await readPreferences({
      ...connection,
      filename: "settings.xml",
    });

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} cat shared_prefs/settings.xml`
    );
  });
});
