import { describe, it, expect, afterEach, vi, type Mock } from "vitest";
import {
  Connection,
  PartialPreference,
  PreferenceKey,
} from "../src/types/type";
import { changePreference, deletePreference } from "./../src/adb/operations";
import client from "../src/adb/client";

vi.mock("../src/adb/client");

const keyValuePrefs = `
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="boolean.key" value="true" />
    <string name="string.key">fourteen</string>
    <long name="long.key" value="1234" />
</map>`;

const encodedProtobufPrefs =
  "Cg8KCWlzVmlzaXRlZBICCAAKEAoKc29tZS1jb3VudBICGA4KFQoJdGVtcC1uYW1lEggqBmNoYXJsbwoUCgdhdmVyYWdlEgk5mpmZmZmZFUA=";

describe("Operations", () => {
  const mock = client.shell as Mock;

  afterEach(() => vi.clearAllMocks());

  it("should fail a change due to missing preference key", async () => {
    const pref: PartialPreference = {
      key: "missing.key",
      value: "some value",
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    await expect(changePreference(pref, connection)).rejects.toThrow(
      `Preference not found: ${pref.key}`
    );
  });

  it("should fail a change due to invalid value", async () => {
    const pref: PartialPreference = {
      key: "long.key",
      value: "supposed long value",
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    await expect(changePreference(pref, connection)).rejects.toThrow(
      `'${pref.value}' cannot be cast to 'long'`
    );
  });

  it("should change a key-value preference given a valid key", async () => {
    const pref: PartialPreference = {
      key: "boolean.key",
      value: "false",
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    await expect(changePreference(pref, connection)).resolves.toBe(undefined);

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sed -Ei -e 's/<boolean name="${pref.key}" value="true".*$/<boolean name="${pref.key}" value="${pref.value}" \\/>/' shared_prefs/${connection.filename}`
    );
  });

  it("should change a datastore preference given a valid key", async () => {
    const pref: PartialPreference = {
      key: "average",
      value: "6.7",
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "settings.preferences_pb",
    };

    mock.mockImplementation(() => Buffer.from(encodedProtobufPrefs, "base64"));

    await expect(changePreference(pref, connection)).resolves.toBe(undefined);

    const content =
      "Cg8KCWlzVmlzaXRlZBICCAAKEAoKc29tZS1jb3VudBICGA4KFQoJdGVtcC1uYW1lEggqBmNoYXJsbwoUCgdhdmVyYWdlEgk5zczMzMzMGkA=";
    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sh -c 'echo ${content} | base64 -d | dd of=files/datastore/${connection.filename} status=none'`
    );
  });

  it("should fail a delete due to missing preference key", async () => {
    const pref: PreferenceKey = {
      key: "missing.key",
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    await expect(deletePreference(pref, connection)).rejects.toThrow(
      `Preference not found: ${pref.key}`
    );
  });

  it("should delete the preference given a valid key", async () => {
    const pref: PreferenceKey = {
      key: "boolean.key",
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    await deletePreference(pref, connection);

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sed -Ei -e '/<boolean name="${pref.key}" value="true".*$/d' shared_prefs/${connection.filename}`
    );
  });
});
