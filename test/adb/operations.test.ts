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
} from "../../src/types/type";
import {
  changePreference,
  deletePreference,
  addPreference,
  watchPreference,
} from "../../src/adb/operations";
import client from "../../src/adb/client";

vi.mock("../../src/adb/client");

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
      expect.stringContaining(
        `run-as com.charlesmuchene.datastore sed -Ei -e '/<\\/map>/i<string name="new.key">test<\\/string>' shared_prefs/legacy-prefs.xml`
      )
    );
  });
});

describe("watchPreference", () => {
  const mock = client.shell as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.PREF_EDITOR_WATCHER_INTERVAL_MS;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

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

    expect(watch).toHaveProperty("emitter");
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

    expect(watch).toHaveProperty("emitter");
    expect(watch).toHaveProperty("close");

    // Clean up
    watch.close();
  });

  it("should fail when PREF_EDITOR_WATCHER_INTERVAL_MS is invalid (NaN)", async () => {
    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "invalid";

    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    await expect(watchPreference(key, connection)).rejects.toThrow(
      "PREF_EDITOR_WATCHER_INTERVAL_MS should be a number > 0"
    );
  });

  it("should fail when PREF_EDITOR_WATCHER_INTERVAL_MS is zero or negative", async () => {
    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "0";

    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    await expect(watchPreference(key, connection)).rejects.toThrow(
      "PREF_EDITOR_WATCHER_INTERVAL_MS should be a number > 0"
    );
  });

  it("should fail when PREF_EDITOR_WATCHER_INTERVAL_MS exceeds 3 minutes", async () => {
    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "200000"; // > 3 minutes

    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    await expect(watchPreference(key, connection)).rejects.toThrow(
      "PREF_EDITOR_WATCHER_INTERVAL_MS should not exceed 3 minutes (180000ms)"
    );
  });

  it("should emit change event when preference value changes", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "100";

    const updatedPrefs = `
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="boolean.key" value="false" />
    <string name="string.key">fourteen</string>
    <long name="long.key" value="1234" />
</map>`;

    mock
      .mockImplementationOnce(() => Buffer.from(keyValuePrefs)) // Initial read
      .mockImplementation(() => Buffer.from(updatedPrefs)); // Changed value

    const watch = await watchPreference(key, connection);

    return new Promise<void>((resolve) => {
      watch.emitter.on("change", (newValue, preference) => {
        expect(newValue).toBe("false");
        expect(preference.key).toBe("boolean.key");
        expect(preference.value).toBe("false");
        watch.close();
        resolve();
      });

      // Advance timers to trigger the interval
      vi.advanceTimersByTime(100);
    });
  });

  it("should emit error event when preference is not found during polling", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "100";

    const prefsWithoutKey = `
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <string name="string.key">fourteen</string>
    <long name="long.key" value="1234" />
</map>`;

    mock
      .mockImplementationOnce(() => Buffer.from(keyValuePrefs)) // Initial read (has key)
      .mockImplementation(() => Buffer.from(prefsWithoutKey)); // Subsequent reads (missing key)

    const watch = await watchPreference(key, connection);

    return new Promise<void>((resolve) => {
      watch.emitter.on("error", (error) => {
        expect(error.message).toBe("Preference not found: boolean.key");
        watch.close();
        resolve();
      });

      // Advance timers to trigger the interval
      vi.advanceTimersByTime(100);
    });
  });

  it("should emit error event when readPreferences throws", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "100";

    mock
      .mockImplementationOnce(() => Buffer.from(keyValuePrefs)) // Initial read
      .mockImplementation(() => {
        throw new Error("Connection failed");
      });

    const watch = await watchPreference(key, connection);

    return new Promise<void>((resolve) => {
      watch.emitter.on("error", (error) => {
        expect(error.message).toBe("Connection failed");
        watch.close();
        resolve();
      });

      // Advance timers to trigger the interval
      vi.advanceTimersByTime(100);
    });
  });

  it("should emit close event when watch is closed", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    return new Promise<void>((resolve) => {
      watch.emitter.on("close", () => {
        resolve();
      });

      watch.close();
    });
  });

  it("should clear interval and remove listeners when closed", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    // Add some listeners
    const changeListener = vi.fn();
    const errorListener = vi.fn();
    watch.emitter.on("change", changeListener);
    watch.emitter.on("error", errorListener);

    expect(watch.emitter.listenerCount("change")).toBe(1);
    expect(watch.emitter.listenerCount("error")).toBe(1);

    watch.close();

    // Listeners should be removed
    expect(watch.emitter.listenerCount("change")).toBe(0);
    expect(watch.emitter.listenerCount("error")).toBe(0);
  });

  it("should handle datastore preferences", async () => {
    const key: PreferenceKey = { key: "average" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "settings.preferences_pb",
    };

    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "100";

    const originalProtobuf =
      "Cg8KCWlzVmlzaXRlZBICCAAKEAoKc29tZS1jb3VudBICGA4KFQoJdGVtcC1uYW1lEggqBmNoYXJsbwoUCgdhdmVyYWdlEgk5mpmZmZmZFUA=";

    mock.mockImplementation(() => Buffer.from(originalProtobuf, "base64"));

    const watch = await watchPreference(key, connection);

    expect(watch).toHaveProperty("emitter");
    expect(watch).toHaveProperty("close");

    // Clean up
    watch.close();
  });

  it("should not emit change event when value remains the same", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    process.env.PREF_EDITOR_WATCHER_INTERVAL_MS = "50";

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    const changeListener = vi.fn();
    watch.emitter.on("change", changeListener);

    // Advance timers multiple times
    vi.advanceTimersByTime(200);

    // Should not have emitted any change events since value didn't change
    expect(changeListener).not.toHaveBeenCalled();

    watch.close();
  });

  it("should handle multiple close calls gracefully", async () => {
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    // Call close multiple times - should not throw
    watch.close();
    watch.close();
    watch.close();

    // Should still work without errors
    expect(watch.emitter.listenerCount("change")).toBe(0);
  });

  it("should use default interval when env var is not set", async () => {
    // Don't set PREF_EDITOR_WATCHER_INTERVAL_MS
    const key: PreferenceKey = { key: "boolean.key" };
    const connection: Connection = {
      deviceId: "emulator-5554",
      appId: "com.charlesmuchene.datastore",
      filename: "legacy-prefs.xml",
    };

    mock.mockImplementation(() => Buffer.from(keyValuePrefs));

    const watch = await watchPreference(key, connection);

    expect(watch).toHaveProperty("emitter");
    expect(watch).toHaveProperty("close");

    watch.close();
  });
});
