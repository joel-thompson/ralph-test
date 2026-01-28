import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadConfig } from "./config.js";
import { CommandError } from "./errors.js";
import { readFile } from "fs/promises";

// Mock fs/promises
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}));

describe("loadConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default config when ral.json doesn't exist", async () => {
    const error: any = new Error("File not found");
    error.code = "ENOENT";
    vi.mocked(readFile).mockRejectedValue(error);

    const config = await loadConfig("/test/dir");

    expect(config).toEqual({
      runner: "claude",
    });
  });

  it("should load valid config with claude runner", async () => {
    const configContent = JSON.stringify({
      runner: "claude",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    const config = await loadConfig("/test/dir");

    expect(config).toEqual({
      runner: "claude",
    });
    expect(vi.mocked(readFile)).toHaveBeenCalledWith("/test/dir/ral.json", "utf-8");
  });

  it("should load valid config with cursor runner and model", async () => {
    const configContent = JSON.stringify({
      runner: "cursor",
      model: "composer-1",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    const config = await loadConfig("/test/dir");

    expect(config).toEqual({
      runner: "cursor",
      model: "composer-1",
    });
  });

  it("should use default runner if not specified", async () => {
    const configContent = JSON.stringify({
      model: "composer-1",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    const config = await loadConfig("/test/dir");

    expect(config).toEqual({
      runner: "claude",
      model: "composer-1",
    });
  });

  it("should throw CommandError for invalid runner value", async () => {
    const configContent = JSON.stringify({
      runner: "invalid",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
    await expect(loadConfig("/test/dir")).rejects.toThrow(
      'Invalid ral.json: runner must be "claude" or "cursor", got "invalid"'
    );
  });

  it("should throw CommandError for non-object config", async () => {
    const configContent = JSON.stringify("not an object");
    vi.mocked(readFile).mockResolvedValue(configContent);

    await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
    await expect(loadConfig("/test/dir")).rejects.toThrow(
      "Invalid ral.json: config must be an object"
    );
  });

  it("should throw CommandError for invalid model type", async () => {
    const configContent = JSON.stringify({
      runner: "cursor",
      model: 123,
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
    await expect(loadConfig("/test/dir")).rejects.toThrow(
      "Invalid ral.json: model must be a string"
    );
  });

  it("should throw CommandError for invalid JSON", async () => {
    vi.mocked(readFile).mockResolvedValue("{ invalid json }");

    await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
    await expect(loadConfig("/test/dir")).rejects.toThrow(/Invalid ral.json:/);
  });

  it("should handle empty config object with defaults", async () => {
    const configContent = JSON.stringify({});
    vi.mocked(readFile).mockResolvedValue(configContent);

    const config = await loadConfig("/test/dir");

    expect(config).toEqual({
      runner: "claude",
    });
  });
});
