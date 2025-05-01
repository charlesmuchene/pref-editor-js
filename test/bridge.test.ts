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

const encodedProtobuf =
  "Cg8KCWlzVmlzaXRlZBICCAAKEAoKc29tZS1jb3VudBICGA4KFQoJdGVtcC1uYW1lEggqBmNoYXJsbwoUCgdhdmVyYWdlEgk5mpmZmZmZFUA=";

describe("Bridge", () => {
  it("should list devices", async () => {
    const dev = [{ serial: "12345", state: "device" }];

    const mock = client.listDevices as jest.Mock;
    mock.mockImplementation(() => Promise.resolve(dev));

    const devices = await listDevices();

    expect(devices).toEqual(devices);
  });

  it("should list apps", async () => {
    const output = " com.charlesmuchene.app\ncom.example.app\n";
    const mock = client.shell as jest.Mock;
    mock.mockImplementation(() => Promise.resolve(output));

    const apps = await listApps({ deviceId: "12345" });

    expect(apps).toEqual([
      { packageName: "com.charlesmuchene.app" },
      { packageName: "com.example.app" },
    ]);
  });

  it("should list files", async () => {
    (client.shell as jest.Mock)
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
    const output = Buffer.from(encodedProtobuf, "base64");
    const mock = client.shell as jest.Mock;
    mock.mockImplementation(() => Promise.resolve(output));

    const preferences = await readPreferences({
      deviceId: "12345",
      appId: "app.id",
      filename: "settings.preferences_pb",
    });

    expect(preferences).toEqual(preferences);
  });

  it("should write to datastore", async () => {
    const buffer = Buffer.from(encodedProtobuf, "base64");
    const connection = {
      deviceId: "12345",
      appId: "app.id",
      filename: "settings.preferences_pb",
    };
    await writeToDatastore(connection, buffer);

    const mock = client.shell as jest.Mock;
    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sh -c 'echo ${encodedProtobuf} | base64 -d | dd of=files/datastore/${connection.filename} status=none'`
    );
  });

  it("should write to key-value store", async () => {
    const connection = {
      deviceId: "12345",
      appId: "app.id",
      filename: "prefs.xml",
    };
    const matcher = '<boolean name="isVisited" value="true" />';
    const content = '<boolean name="isVisited" value="false" />';
    writeToKeyValue(connection, Op.CHANGE, matcher, content);

    const mock = client.shell as jest.Mock;
    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sed -Ei -e 's/${matcher}/${content}/' shared_prefs/${connection.filename}`
    );
  });
});
