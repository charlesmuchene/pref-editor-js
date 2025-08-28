import { describe, it, expect, vi, type Mock } from "vitest";
import { readPreferences } from "../src/adb/bridge";
import client from "../src/adb/client";

// Mock the client
vi.mock("../src/adb/client");

// Mock the utils module to control file type behavior
vi.mock("../src/utils/utils", () => ({
  filenameWithExtension: vi.fn(),
  createFile: vi.fn(),
  filePath: vi.fn(),
}));

describe("Bridge edge cases - Unknown file type", () => {
  const mock = client.shell as Mock;

  it("should throw error for unknown file type", async () => {
    const { createFile, filenameWithExtension, filePath } = await import(
      "../src/utils/utils"
    );

    // Mock the utility functions to return an unknown file type
    vi.mocked(filenameWithExtension).mockResolvedValue("unknown.txt");
    vi.mocked(createFile).mockReturnValue({
      name: "unknown.txt",
      type: "unknown" as any,
    });
    vi.mocked(filePath).mockReturnValue("unknown/unknown.txt");

    const connection = {
      deviceId: "12345",
      appId: "app.id",
      filename: "unknown.txt",
    };

    mock.mockImplementation(() => Promise.resolve(Buffer.from("some content")));

    await expect(readPreferences(connection)).rejects.toThrow(
      "Unknown file type"
    );
  });
});
