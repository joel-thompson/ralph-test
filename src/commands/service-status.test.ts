import { describe, it, expect, vi, beforeEach } from "vitest";
import { serviceStatus } from "./service-status.js";
import * as configModule from "../utils/config.js";
import * as shellModule from "../utils/shell.js";

vi.mock("../utils/config.js");
vi.mock("../utils/shell.js");

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe("serviceStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
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
      serviceStatus({
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
      serviceStatus({
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
            type: "kubernetes" as any,
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
      serviceStatus({
        workingDirectory: "/test/dir",
        serviceName: "web",
      })
    ).rejects.toThrow(
      'Service "web" has unsupported type "kubernetes". Only "docker-compose" is supported.'
    );
  });

  it("should report running=true and healthy=true when service is running and healthcheck passes", async () => {
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

    // Mock docker compose ps to return running service
    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: JSON.stringify({
        Service: "web-service",
        State: "running",
      }),
      stderr: "",
      exitCode: 0,
    });

    // Mock successful healthcheck
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
    });

    const status = await serviceStatus({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(status).toEqual({
      name: "web",
      type: "docker-compose",
      running: true,
      healthy: true,
      healthcheckUrl: "http://localhost:5173",
      composeFile: "docker-compose.yml",
      composeService: "web-service",
    });

    expect(shellModule.executeShell).toHaveBeenCalledWith(
      "docker",
      [
        "compose",
        "-f",
        "docker-compose.yml",
        "ps",
        "--status",
        "running",
        "--format",
        "json",
        "web-service",
      ],
      {
        cwd: "/test/dir/web",
        timeout: 30000,
      }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:5173",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("should report running=false and healthy=false when service is not running", async () => {
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

    // Mock docker compose ps to return empty (not running)
    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: "",
      stderr: "",
      exitCode: 0,
    });

    const status = await serviceStatus({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(status).toEqual({
      name: "web",
      type: "docker-compose",
      running: false,
      healthy: false,
      healthcheckUrl: "http://localhost:5173",
      composeFile: "docker-compose.yml",
      composeService: "web-service",
    });

    // Healthcheck should not be called if not running
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should report running=true and healthy=false when service is running but healthcheck fails", async () => {
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

    // Mock docker compose ps to return running service
    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: JSON.stringify({
        Service: "web-service",
        State: "running",
      }),
      stderr: "",
      exitCode: 0,
    });

    // Mock failed healthcheck (non-2xx status)
    mockFetch.mockResolvedValue({
      status: 503,
      ok: false,
    });

    const status = await serviceStatus({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(status).toEqual({
      name: "web",
      type: "docker-compose",
      running: true,
      healthy: false,
      healthcheckUrl: "http://localhost:5173",
      composeFile: "docker-compose.yml",
      composeService: "web-service",
    });
  });

  it("should report healthy=false when healthcheck times out", async () => {
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

    // Mock docker compose ps to return running service
    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: JSON.stringify({
        Service: "web-service",
        State: "running",
      }),
      stderr: "",
      exitCode: 0,
    });

    // Mock healthcheck timeout
    mockFetch.mockRejectedValue(new Error("Request timeout"));

    const status = await serviceStatus({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(status.running).toBe(true);
    expect(status.healthy).toBe(false);
  });

  it("should handle newline-delimited JSON from docker compose ps", async () => {
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

    // Mock docker compose ps to return newline-delimited JSON objects
    const jsonLine1 = JSON.stringify({
      Service: "other-service",
      State: "running",
    });
    const jsonLine2 = JSON.stringify({
      Service: "web-service",
      State: "running",
    });

    vi.mocked(shellModule.executeShell).mockResolvedValue({
      stdout: `${jsonLine1}\n${jsonLine2}\n`,
      stderr: "",
      exitCode: 0,
    });

    // Mock successful healthcheck
    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
    });

    const status = await serviceStatus({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(status.running).toBe(true);
    expect(status.healthy).toBe(true);
  });

  it("should output JSON when --json flag is provided", async () => {
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
      stdout: JSON.stringify({
        Service: "web-service",
        State: "running",
      }),
      stderr: "",
      exitCode: 0,
    });

    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
    });

    await serviceStatus({
      workingDirectory: "/test/dir",
      serviceName: "web",
      json: true,
    });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('"name": "web"')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('"running": true')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('"healthy": true')
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
      serviceStatus({
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
      stdout: "",
      stderr: "",
      exitCode: 0,
    });

    await serviceStatus({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(shellModule.executeShell).toHaveBeenCalledWith(
      "docker",
      [
        "compose",
        "-f",
        "docker-compose.yml",
        "ps",
        "--status",
        "running",
        "--format",
        "json",
        "web-service",
      ],
      {
        cwd: "/absolute/path/web",
        timeout: 30000,
      }
    );
  });
});
