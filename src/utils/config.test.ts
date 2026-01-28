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

    const result = await loadConfig("/test/dir");

    expect(result).toEqual({
      config: {
        runner: "claude",
      },
      source: "default",
    });
  });

  it("should load valid config with claude runner", async () => {
    const configContent = JSON.stringify({
      runner: "claude",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    const result = await loadConfig("/test/dir");

    expect(result).toEqual({
      config: {
        runner: "claude",
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });
    expect(vi.mocked(readFile)).toHaveBeenCalledWith("/test/dir/ral.json", "utf-8");
  });

  it("should load valid config with cursor runner and model", async () => {
    const configContent = JSON.stringify({
      runner: "cursor",
      model: "composer-1",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    const result = await loadConfig("/test/dir");

    expect(result).toEqual({
      config: {
        runner: "cursor",
        model: "composer-1",
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });
  });

  it("should use default runner if not specified", async () => {
    const configContent = JSON.stringify({
      model: "composer-1",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    const result = await loadConfig("/test/dir");

    expect(result).toEqual({
      config: {
        runner: "claude",
        model: "composer-1",
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
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

    const result = await loadConfig("/test/dir");

    expect(result).toEqual({
      config: {
        runner: "claude",
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });
  });

  it("should use working directory config when both working and root configs exist", async () => {
    const workingConfigContent = JSON.stringify({
      runner: "cursor",
      model: "composer-1",
    });
    const rootConfigContent = JSON.stringify({
      runner: "claude",
    });

    vi.mocked(readFile).mockResolvedValue(workingConfigContent);

    const result = await loadConfig("/test/working", "/test/root");

    expect(result).toEqual({
      config: {
        runner: "cursor",
        model: "composer-1",
      },
      source: "working-directory",
      path: "/test/working/ral.json",
    });
    expect(vi.mocked(readFile)).toHaveBeenCalledWith("/test/working/ral.json", "utf-8");
    expect(vi.mocked(readFile)).toHaveBeenCalledTimes(1);
  });

  it("should use root directory config when working directory has no ral.json", async () => {
    const workingError: any = new Error("File not found");
    workingError.code = "ENOENT";

    const rootConfigContent = JSON.stringify({
      runner: "cursor",
      model: "composer-2",
    });

    vi.mocked(readFile)
      .mockRejectedValueOnce(workingError)
      .mockResolvedValueOnce(rootConfigContent);

    const result = await loadConfig("/test/working", "/test/root");

    expect(result).toEqual({
      config: {
        runner: "cursor",
        model: "composer-2",
      },
      source: "root-directory",
      path: "/test/root/ral.json",
    });
    expect(vi.mocked(readFile)).toHaveBeenCalledWith("/test/working/ral.json", "utf-8");
    expect(vi.mocked(readFile)).toHaveBeenCalledWith("/test/root/ral.json", "utf-8");
    expect(vi.mocked(readFile)).toHaveBeenCalledTimes(2);
  });

  it("should return default config when neither directory has ral.json", async () => {
    const error: any = new Error("File not found");
    error.code = "ENOENT";

    vi.mocked(readFile).mockRejectedValue(error);

    const result = await loadConfig("/test/working", "/test/root");

    expect(result).toEqual({
      config: {
        runner: "claude",
      },
      source: "default",
    });
    expect(vi.mocked(readFile)).toHaveBeenCalledWith("/test/working/ral.json", "utf-8");
    expect(vi.mocked(readFile)).toHaveBeenCalledWith("/test/root/ral.json", "utf-8");
    expect(vi.mocked(readFile)).toHaveBeenCalledTimes(2);
  });
});
