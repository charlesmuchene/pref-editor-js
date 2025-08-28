import {
  describe,
  it,
  expect,
  afterEach,
  vi,
  type Mock,
  beforeEach,
} from "vitest";
import {
  Connection,
  PartialPreference,
  PreferenceKey,
  Preference,
  TypeTag,
  FileType,
} from "../src/types/type";
import {
  changePreference,
  deletePreference,
  addPreference,
  watchPreference,
} from "./../src/adb/operations";
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

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.PREF_EDITOR_WATCHER_INTERVAL_MS;
  });

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

  it("should delete a datastore preference", async () => {
    const pref: PreferenceKey = {
      key: "average",
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "settings.preferences_pb",
    };

    mock.mockImplementation(() => Buffer.from(encodedProtobufPrefs, "base64"));

    await deletePreference(pref, connection);

    // Should write back the datastore without the deleted preference
    const expectedContent =
      "Cg8KCWlzVmlzaXRlZBICCAAKEAoKc29tZS1jb3VudBICGA4KFQoJdGVtcC1uYW1lEggqBmNoYXJsbw==";
    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sh -c 'echo ${expectedContent} | base64 -d | dd of=files/datastore/${connection.filename} status=none'`
    );
  });
});

describe("addPreference", () => {
  const mock = client.shell as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => vi.clearAllMocks());

  it("should add a new key-value preference", async () => {
    const preference: Preference = {
      key: "new.boolean.key",
      value: "true",
      type: TypeTag.BOOLEAN,
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    await addPreference(preference, connection);

    expect(mock).toHaveBeenCalledWith(
      connection.deviceId,
      `run-as ${connection.appId} sed -Ei -e '/<\\/map>/i<boolean name="new.boolean.key" value="true" \\/>' shared_prefs/${connection.filename}`
    );
  });

  it("should add a new datastore preference", async () => {
    const preference: Preference = {
      key: "new.string.key",
      value: "test value",
      type: TypeTag.STRING,
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "settings.preferences_pb",
    };

    mock.mockImplementation(() => Buffer.from(encodedProtobufPrefs, "base64"));

    await addPreference(preference, connection);

    // Should write back the datastore with the new preference added
    // The exact encoded content will depend on the protobuf encoding, so let's just check the call pattern
    expect(mock).toHaveBeenCalledTimes(2); // First call to read, second to write
    expect(mock).toHaveBeenNthCalledWith(
      1,
      connection.deviceId,
      `run-as ${connection.appId} cat files/datastore/${connection.filename}`
    );
    expect(mock).toHaveBeenNthCalledWith(
      2,
      connection.deviceId,
      expect.stringMatching(
        new RegExp(
          `run-as ${connection.appId} sh -c 'echo .+ \\| base64 -d \\| dd of=files/datastore/${connection.filename} status=none'`
        )
      )
    );
  });

  it("should fail to add preference with invalid type", async () => {
    const preference: Preference = {
      key: "new.key",
      value: "not a number",
      type: TypeTag.LONG,
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    await expect(addPreference(preference, connection)).rejects.toThrow(
      "'not a number' cannot be cast to 'long'"
    );
  });

  it("should fail to add preference that already exists", async () => {
    const preference: Preference = {
      key: "boolean.key", // This key already exists in keyValuePrefs
      value: "false",
      type: TypeTag.BOOLEAN,
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    await expect(addPreference(preference, connection)).rejects.toThrow(
      "Preference already exists: boolean.key"
    );
  });

  it("should handle connection with filename extension resolution", async () => {
    const preference: Preference = {
      key: "new.key",
      value: "test",
      type: TypeTag.STRING,
    };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs", // Without extension
    };

    // Mock the file listing calls to resolve extension, then read preferences
    mock
      .mockImplementationOnce(() => Promise.resolve("legacy-prefs.xml\n"))
      .mockImplementationOnce(() => Promise.resolve(""))
      .mockImplementationOnce(() => Buffer.from(keyValuePrefs));

    await addPreference(preference, connection);

    // Should determine filename extension and then add preference
    expect(mock).toHaveBeenCalledTimes(4); // File listing (2 calls) + read prefs + write prefs
    expect(mock).toHaveBeenNthCalledWith(
      4,
      connection.deviceId,
      expect.stringMatching(
        /run-as com\.charlesmuchene\.datastore sed -Ei -e '\/\<\\\/map\>\/i<string name="new\.key">test<\\\/string>' shared_prefs\/legacy-prefs\.xml/
      )
    );
  });
});

describe("watchPreference", () => {
  const mock = client.shell as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.PREF_EDITOR_WATCHER_INTERVAL_MS;
  });

  afterEach(() => vi.clearAllMocks());

  it("should fail when preference key is not found", async () => {
    const key: PreferenceKey = { key: "nonexistent.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    await expect(watchPreference(key, connection)).rejects.toThrow(
      "Preference not found: nonexistent.key"
    );
  });

  it("should create a watch for existing preference", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    expect(watch).toHaveProperty("stream");
    expect(watch).toHaveProperty("close");
    expect(typeof watch.close).toBe("function");

    // Clean up
    watch.close();
  });

  it("should handle connection with filename extension resolution in watch", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs", // Without extension
    };

    // Mock the file listing calls and then the preference reading
    mock
      .mockImplementationOnce(() => Promise.resolve("legacy-prefs.xml\n"))
      .mockImplementationOnce(() => Promise.resolve(""))
      .mockImplementationOnce(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    expect(watch).toHaveProperty("stream");
    expect(watch).toHaveProperty("close");

    // Clean up
    watch.close();
  });

  it("should fail when PREF_EDITOR_WATCHER_INTERVAL_MS is invalid", async () => {
    // Test line 142: invalid interval (NaN)
    // We need to reload the module to test this since watchIntervalMs is calculated at load time
    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "invalid";

    // Clear the module cache and reimport to test the validation
    vi.resetModules();
    const { watchPreference: watchPrefReloaded } = await import(
      "../src/adb/operations"
    );

    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    await expect(watchPrefReloaded(key, connection)).rejects.toThrow(
      "PREF_EDITOR_WATCHER_INTERVAL_MS should be a number > 0"
    );
  });

  it("should fail when PREF_EDITOR_WATCHER_INTERVAL_MS is zero or negative", async () => {
    // Test line 142: invalid interval (<= 0)
    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "0";

    // Clear the module cache and reimport to test the validation
    vi.resetModules();
    const { watchPreference: watchPrefReloaded } = await import(
      "../src/adb/operations"
    );

    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    await expect(watchPrefReloaded(key, connection)).rejects.toThrow(
      "PREF_EDITOR_WATCHER_INTERVAL_MS should be a number > 0"
    );
  });

  it("should cover generator function console.log statement", async () => {
    // Test line 170: console.log statement in generator function
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    // Mock console.log to verify it's called (line 170)
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    // Wait for the generator to start by listening for the first data or error event
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Even if no data/error, the console.log should have been called when generator started
        try {
          expect(consoleSpy).toHaveBeenCalledWith("Starting in generator func");
          watch.close();
          consoleSpy.mockRestore();
          resolve(undefined);
        } catch (error) {
          watch.close();
          consoleSpy.mockRestore();
          reject(error);
        }
      }, 200);

      watch.stream.on("data", () => {
        clearTimeout(timeout);
        try {
          expect(consoleSpy).toHaveBeenCalledWith("Starting in generator func");
          watch.close();
          consoleSpy.mockRestore();
          resolve(undefined);
        } catch (error) {
          reject(error);
        }
      });

      watch.stream.on("error", () => {
        clearTimeout(timeout);
        try {
          expect(consoleSpy).toHaveBeenCalledWith("Starting in generator func");
          watch.close();
          consoleSpy.mockRestore();
          resolve(undefined);
        } catch (error) {
          reject(error);
        }
      });
    });
  });

  it("should cover generator function basic execution", async () => {
    // Test lines 172-188: basic generator function execution
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    // Set a very short interval for testing
    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "10";

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    // Just let the generator run briefly to cover the lines
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clean up
    watch.close();
  });

  it("should handle shouldStopRead break condition", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "100";

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    // Close immediately to test shouldStopRead condition
    watch.close();

    // The stream should be destroyed/closed
    expect(watch.stream.destroyed).toBe(true);
  });
});
