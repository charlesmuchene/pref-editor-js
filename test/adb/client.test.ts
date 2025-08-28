import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock the @devicefarmer/adbkit module before importing anything
const mockClient = {
  listDevices: vi.fn(),
  getDevice: vi.fn(),
};

const mockDevice = {
  shell: vi.fn(),
};

const mockAdb = {
  createClient: vi.fn(() => mockClient),
  util: {
    readAll: vi.fn(),
  },
};

vi.mock("@devicefarmer/adbkit", () => ({
  default: mockAdb,
}));

describe("ADB Client", () => {
  let client: unknown;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockClient.getDevice.mockReturnValue(mockDevice);
    mockAdb.util.readAll.mockResolvedValue(Buffer.from("test output"));

    // Import client after mocks are set up
    const clientModule = await import("../../src/adb/client");
    client = clientModule.default;
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.PREF_EDITOR_ADB_HOST;
    delete process.env.PREF_EDITOR_ADB_PORT;
  });

  describe("Client initialization", () => {
    it("should reject invalid IP address", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "999.999.999.999";
      process.env.PREF_EDITOR_ADB_PORT = "5037";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: undefined,
        port: 5037,
      });
    });

    it("should accept 127.0.0.1 as valid host", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "127.0.0.1";
      process.env.PREF_EDITOR_ADB_PORT = "5037";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "127.0.0.1",
        port: 5037,
      });
    });

    it("should create client with default port when no environment variables are set", async () => {
      // Clear environment variables
      delete process.env.PREF_EDITOR_ADB_HOST;
      delete process.env.PREF_EDITOR_ADB_PORT;

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: undefined,
        port: 5037,
      });
    });

    it("should validate and use valid IP address host", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "192.168.1.100";
      process.env.PREF_EDITOR_ADB_PORT = "5037";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "192.168.1.100",
        port: 5037,
      });
    });

    it("should validate and use localhost", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "localhost";
      process.env.PREF_EDITOR_ADB_PORT = "5037";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "localhost",
        port: 5037,
      });
    });

    it("should validate and use domain name", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "adb.example.com";
      process.env.PREF_EDITOR_ADB_PORT = "5037";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "adb.example.com",
        port: 5037,
      });
    });

    it("should trim whitespace from host", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "  localhost  ";
      process.env.PREF_EDITOR_ADB_PORT = "5037";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "localhost",
        port: 5037,
      });
    });

    it("should reject invalid host and use undefined", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "invalid host with spaces";
      process.env.PREF_EDITOR_ADB_PORT = "5037";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: undefined,
        port: 5037,
      });
    });

    it("should reject empty host after trimming", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "   ";
      process.env.PREF_EDITOR_ADB_PORT = "5037";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: undefined,
        port: 5037,
      });
    });

    it("should create client with custom host and port from environment variables", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "custom-host";
      process.env.PREF_EDITOR_ADB_PORT = "9999";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "custom-host",
        port: 9999,
      });
    });

    it("should use default port when PREF_EDITOR_ADB_PORT is not a valid number", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "test-host";
      process.env.PREF_EDITOR_ADB_PORT = "invalid";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "test-host",
        port: 5037,
      });
    });

    it("should use default port when PREF_EDITOR_ADB_PORT is not set", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "test-host";
      delete process.env.PREF_EDITOR_ADB_PORT;

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "test-host",
        port: 5037,
      });
    });

    it("should use default port when PREF_EDITOR_ADB_PORT is zero", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "test-host";
      process.env.PREF_EDITOR_ADB_PORT = "0";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "test-host",
        port: 5037,
      });
    });

    it("should use default port when PREF_EDITOR_ADB_PORT is negative", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "test-host";
      process.env.PREF_EDITOR_ADB_PORT = "-1";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "test-host",
        port: 5037,
      });
    });

    it("should use valid port when PREF_EDITOR_ADB_PORT is a valid positive number", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "test-host";
      process.env.PREF_EDITOR_ADB_PORT = "8080";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "test-host",
        port: 8080,
      });
    });

    it("should handle edge case with very large port number", async () => {
      process.env.PREF_EDITOR_ADB_HOST = "test-host";
      process.env.PREF_EDITOR_ADB_PORT = "65535";

      vi.resetModules();
      await import("../../src/adb/client");

      expect(mockAdb.createClient).toHaveBeenCalledWith({
        host: "test-host",
        port: 65535,
      });
    });
  });

  describe("listDevices", () => {
    it("should list devices and transform them correctly", async () => {
      const mockDevices = [
        { id: "device1", type: "device" },
        { id: "device2", type: "offline" },
        { id: "emulator-5554", type: "device" },
      ];

      mockClient.listDevices.mockResolvedValue(mockDevices);

      const result = await client.listDevices();

      expect(result).toEqual([
        { serial: "device1", state: "device" },
        { serial: "device2", state: "offline" },
        { serial: "emulator-5554", state: "device" },
      ]);
      expect(mockClient.listDevices).toHaveBeenCalledOnce();
    });

    it("should handle empty device list", async () => {
      mockClient.listDevices.mockResolvedValue([]);

      const result = await client.listDevices();

      expect(result).toEqual([]);
      expect(mockClient.listDevices).toHaveBeenCalledOnce();
    });

    it("should propagate errors from adb client", async () => {
      const error = new Error("ADB connection failed");
      mockClient.listDevices.mockRejectedValue(error);

      await expect(client.listDevices()).rejects.toThrow(
        "ADB connection failed"
      );
    });
  });

  describe("shell", () => {
    beforeEach(() => {
      mockClient.getDevice.mockReturnValue(mockDevice);
      mockDevice.shell.mockResolvedValue("mockStream");
    });

    it("should execute shell command successfully", async () => {
      const expectedOutput = Buffer.from("command output");
      mockAdb.util.readAll.mockResolvedValue(expectedOutput);

      const result = await client.shell("device123", "ls -la");

      expect(mockClient.getDevice).toHaveBeenCalledWith("device123");
      expect(mockDevice.shell).toHaveBeenCalledWith("ls -la");
      expect(mockAdb.util.readAll).toHaveBeenCalledWith("mockStream");
      expect(result).toBe(expectedOutput);
    });

    it("should handle shell command with different serial and command", async () => {
      const expectedOutput = Buffer.from("different output");
      mockAdb.util.readAll.mockResolvedValue(expectedOutput);

      const result = await client.shell("emulator-5554", "pm list packages");

      expect(mockClient.getDevice).toHaveBeenCalledWith("emulator-5554");
      expect(mockDevice.shell).toHaveBeenCalledWith("pm list packages");
      expect(result).toBe(expectedOutput);
    });

    it("should handle errors from getDevice", async () => {
      const error = new Error("Device not found");
      mockClient.getDevice.mockImplementation(() => {
        throw error;
      });

      await expect(client.shell("invalid-device", "test")).rejects.toThrow(
        "Device not found"
      );
    });

    it("should handle errors from device.shell", async () => {
      const error = new Error("Shell command failed");
      mockDevice.shell.mockRejectedValue(error);

      await expect(
        client.shell("device123", "invalid-command")
      ).rejects.toThrow("Shell command failed");
    });

    it("should handle errors from readAll", async () => {
      const error = new Error("Stream read failed");
      mockAdb.util.readAll.mockRejectedValue(error);

      await expect(client.shell("device123", "test")).rejects.toThrow(
        "Stream read failed"
      );
    });

    it("should handle synchronous errors in try block", async () => {
      const error = new Error("Synchronous error");
      mockClient.getDevice.mockImplementation(() => {
        throw error;
      });

      await expect(client.shell("device123", "test")).rejects.toThrow(
        "Synchronous error"
      );
    });
  });
});
