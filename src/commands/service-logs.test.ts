import { describe, it, expect, vi, beforeEach } from "vitest";
import { serviceLogs } from "./service-logs.js";
import * as configModule from "../utils/config.js";
import * as shellModule from "../utils/shell.js";

vi.mock("../utils/config.js");
vi.mock("../utils/shell.js");

describe("serviceLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.log during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should throw error when no services are configured", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
      },
      source: "default",
    });

    await expect(
      serviceLogs({
        workingDirectory: "/test/dir",
        serviceName: "web",
      })
    ).rejects.toThrow(
      "No services configured in ral.json. Add a 'services' section to use this command."
    );
  });

  it("should throw error when service name is not found", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          api: {
            type: "docker-compose",
            cwd: "./api",
            composeFile: "docker-compose.yml",
            service: "api-service",
            healthcheckUrl: "http://localhost:3000/health",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    await expect(
      serviceLogs({
        workingDirectory: "/test/dir",
        serviceName: "web",
      })
    ).rejects.toThrow(
      'Service "web" not found in ral.json. Available services: api'
    );
  });

  it("should throw error when service type is not docker-compose", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          web: {
            type: "kubernetes" as any, // Simulate an unsupported type
            cwd: "./web",
            composeFile: "docker-compose.yml",
            service: "web-service",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    await expect(
      serviceLogs({
        workingDirectory: "/test/dir",
        serviceName: "web",
      })
    ).rejects.toThrow(
      'Service "web" has unsupported type "kubernetes". Only "docker-compose" is supported.'
    );
  });

  it("should fetch logs with default tail of 200 lines", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "./web",
            composeFile: "docker-compose.yml",
            service: "web-service",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: "log line 1\nlog line 2\nlog line 3",
      stderr: "",
      exitCode: 0,
    });

    const result = await serviceLogs({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(shellModule.executeShell).toHaveBeenCalledWith(
      "docker",
      ["compose", "-f", "docker-compose.yml", "logs", "--tail", "200", "web-service"],
      {
        cwd: "/test/dir/web",
        timeout: 30000,
      }
    );

    expect(result).toEqual({
      name: "web",
      type: "docker-compose",
      composeFile: "docker-compose.yml",
      composeService: "web-service",
      lines: ["log line 1", "log line 2", "log line 3"],
    });

    expect(console.log).toHaveBeenCalledWith("log line 1\nlog line 2\nlog line 3");
  });

  it("should fetch logs with custom tail value", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "./web",
            composeFile: "docker-compose.yml",
            service: "web-service",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: "log line 1\nlog line 2",
      stderr: "",
      exitCode: 0,
    });

    await serviceLogs({
      workingDirectory: "/test/dir",
      serviceName: "web",
      tail: 50,
    });

    expect(shellModule.executeShell).toHaveBeenCalledWith(
      "docker",
      ["compose", "-f", "docker-compose.yml", "logs", "--tail", "50", "web-service"],
      {
        cwd: "/test/dir/web",
        timeout: 30000,
      }
    );
  });

  it("should output JSON format when --json flag is provided", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "./web",
            composeFile: "docker-compose.yml",
            service: "web-service",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: "log line 1\nlog line 2",
      stderr: "",
      exitCode: 0,
    });

    const result = await serviceLogs({
      workingDirectory: "/test/dir",
      serviceName: "web",
      tail: 100,
      json: true,
    });

    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        {
          name: "web",
          type: "docker-compose",
          composeFile: "docker-compose.yml",
          composeService: "web-service",
          lines: ["log line 1", "log line 2"],
        },
        null,
        2
      )
    );

    expect(result.lines).toEqual(["log line 1", "log line 2"]);
  });

  it("should throw error when docker command fails", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "./web",
            composeFile: "docker-compose.yml",
            service: "web-service",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: "",
      stderr: "Error: service not found",
      exitCode: 1,
    });

    await expect(
      serviceLogs({
        workingDirectory: "/test/dir",
        serviceName: "web",
      })
    ).rejects.toThrow(
      'Failed to fetch logs for service "web": Error: service not found'
    );
  });

  it("should handle docker not installed error", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "./web",
            composeFile: "docker-compose.yml",
            service: "web-service",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    vi.mocked(shellModule.executeShell).mockRejectedValue(
      Object.assign(new Error("spawn docker ENOENT"), { code: "ENOENT" })
    );

    await expect(
      serviceLogs({
        workingDirectory: "/test/dir",
        serviceName: "web",
      })
    ).rejects.toThrow(
      "Docker is not available. Please ensure Docker is installed and the Docker daemon is running."
    );
  });

  it("should handle absolute service cwd path", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "/absolute/path/web",
            composeFile: "docker-compose.yml",
            service: "web-service",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: "log output",
      stderr: "",
      exitCode: 0,
    });

    await serviceLogs({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(shellModule.executeShell).toHaveBeenCalledWith(
      "docker",
      ["compose", "-f", "docker-compose.yml", "logs", "--tail", "200", "web-service"],
      {
        cwd: "/absolute/path/web",
        timeout: 30000,
      }
    );
  });

  it("should handle empty logs output", async () => {
    vi.mocked(configModule.loadConfig).mockResolvedValue({
      config: {
        runner: "claude",
        services: {
          web: {
            type: "docker-compose",
            cwd: "./web",
            composeFile: "docker-compose.yml",
            service: "web-service",
            healthcheckUrl: "http://localhost:5173",
          },
        },
      },
      source: "working-directory",
      path: "/test/dir/ral.json",
    });

    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: "",
      stderr: "",
      exitCode: 0,
    });

    const result = await serviceLogs({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(result.lines).toEqual([""]);
  });
});
