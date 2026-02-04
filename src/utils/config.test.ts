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
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should return default config when ral.json doesn't exist", async () => {
    const error: any = new Error("File not found");
    error.code = "ENOENT";
    vi.mocked(readFile).mockRejectedValue(error);

    const result = await loadConfig("/test/dir");

    expect(result).toEqual({
      config: {
        runner: "claude",
        taskSelection: "first-incomplete",
      },
      source: "default",
    });
    expect(console.log).toHaveBeenCalledWith(
      "No ral.json found, using default config (runner: claude)"
    );
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
        taskSelection: "first-incomplete",
      },
      source: "root-directory",
      path: "/test/dir/ral.json",
    });
    expect(vi.mocked(readFile)).toHaveBeenCalledWith(
      "/test/dir/ral.json",
      "utf-8"
    );
    expect(console.log).toHaveBeenCalledWith(
      "Using config from /test/dir/ral.json"
    );
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
        taskSelection: "first-incomplete",
      },
      source: "root-directory",
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
        taskSelection: "first-incomplete",
      },
      source: "root-directory",
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
        taskSelection: "first-incomplete",
      },
      source: "root-directory",
      path: "/test/dir/ral.json",
    });
  });

  it("should return default config when no rootDirectory provided", async () => {
    const result = await loadConfig();

    expect(result).toEqual({
      config: {
        runner: "claude",
        taskSelection: "first-incomplete",
      },
      source: "default",
    });
    expect(console.log).toHaveBeenCalledWith(
      "No ral.json found, using default config (runner: claude)"
    );
  });

  it("should load valid config with taskSelection set to first-incomplete", async () => {
    const configContent = JSON.stringify({
      runner: "claude",
      taskSelection: "first-incomplete",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    const result = await loadConfig("/test/dir");

    expect(result).toEqual({
      config: {
        runner: "claude",
        taskSelection: "first-incomplete",
      },
      source: "root-directory",
      path: "/test/dir/ral.json",
    });
  });

  it("should load valid config with taskSelection set to smart", async () => {
    const configContent = JSON.stringify({
      runner: "claude",
      taskSelection: "smart",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    const result = await loadConfig("/test/dir");

    expect(result).toEqual({
      config: {
        runner: "claude",
        taskSelection: "smart",
      },
      source: "root-directory",
      path: "/test/dir/ral.json",
    });
  });

  it("should throw CommandError for invalid taskSelection value", async () => {
    const configContent = JSON.stringify({
      runner: "claude",
      taskSelection: "invalid",
    });
    vi.mocked(readFile).mockResolvedValue(configContent);

    await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
    await expect(loadConfig("/test/dir")).rejects.toThrow(
      'Invalid ral.json: taskSelection must be "first-incomplete" or "smart", got "invalid"'
    );
  });

  it("should use default taskSelection when not specified", async () => {
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
        taskSelection: "first-incomplete",
      },
      source: "root-directory",
      path: "/test/dir/ral.json",
    });
  });

  describe("services configuration", () => {
    it("should load valid services config", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "/test/project",
            composeFile: "docker-compose.yml",
            service: "web",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      const result = await loadConfig("/test/dir");

      expect(result).toEqual({
        config: {
          runner: "claude",
          taskSelection: "first-incomplete",
          services: {
            web: {
              type: "docker-compose",
              cwd: "/test/project",
              composeFile: "docker-compose.yml",
              service: "web",
              healthcheckUrl: "http://localhost:5173",
            },
          },
        },
        source: "root-directory",
        path: "/test/dir/ral.json",
      });
    });

    it("should load multiple services", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "/test/project",
            composeFile: "docker-compose.yml",
            service: "web",
            healthcheckUrl: "http://localhost:5173",
          },
          api: {
            type: "docker-compose",
            cwd: "/test/project",
            composeFile: "docker-compose.yml",
            service: "api",
            healthcheckUrl: "http://localhost:3000",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      const result = await loadConfig("/test/dir");

      expect(result.config.services).toHaveProperty("web");
      expect(result.config.services).toHaveProperty("api");
      expect(result.config.services?.web.healthcheckUrl).toBe(
        "http://localhost:5173"
      );
      expect(result.config.services?.api.healthcheckUrl).toBe(
        "http://localhost:3000"
      );
    });

    it("should throw CommandError for services not being an object", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: "not-an-object",
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        "Invalid ral.json: services must be an object"
      );
    });

    it("should throw CommandError for services being an array", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: [],
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        "Invalid ral.json: services must be an object"
      );
    });

    it("should throw CommandError for missing service type", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            cwd: "/test/project",
            composeFile: "docker-compose.yml",
            service: "web",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        'Invalid ral.json: services.web.type must be "docker-compose"'
      );
    });

    it("should throw CommandError for invalid service type", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            type: "invalid-type",
            cwd: "/test/project",
            composeFile: "docker-compose.yml",
            service: "web",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        'Invalid ral.json: services.web.type must be "docker-compose", got "invalid-type"'
      );
    });

    it("should throw CommandError for missing cwd", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            composeFile: "docker-compose.yml",
            service: "web",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        "Invalid ral.json: services.web.cwd is required and must be a string"
      );
    });

    it("should throw CommandError for missing composeFile", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "/test/project",
            service: "web",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        "Invalid ral.json: services.web.composeFile is required and must be a string"
      );
    });

    it("should throw CommandError for missing service name", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "/test/project",
            composeFile: "docker-compose.yml",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        "Invalid ral.json: services.web.service is required and must be a string"
      );
    });

    it("should throw CommandError for missing healthcheckUrl", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "/test/project",
            composeFile: "docker-compose.yml",
            service: "web",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        "Invalid ral.json: services.web.healthcheckUrl is required and must be a string"
      );
    });

    it("should throw CommandError for invalid healthcheckUrl", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "/test/project",
            composeFile: "docker-compose.yml",
            service: "web",
            healthcheckUrl: "not-a-valid-url",
          },
        },
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      await expect(loadConfig("/test/dir")).rejects.toThrow(CommandError);
      await expect(loadConfig("/test/dir")).rejects.toThrow(
        'Invalid ral.json: services.web.healthcheckUrl must be a valid URL, got "not-a-valid-url"'
      );
    });

    it("should handle config with no services defined", async () => {
      const configContent = JSON.stringify({
        runner: "claude",
      });
      vi.mocked(readFile).mockResolvedValue(configContent);

      const result = await loadConfig("/test/dir");

      expect(result.config.services).toBeUndefined();
    });
  });
});
