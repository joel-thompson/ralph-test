import { describe, it, expect, vi, beforeEach } from "vitest";
import { serviceStart } from "./service-start.js";
import * as configModule from "../utils/config.js";
import * as shellModule from "../utils/shell.js";

vi.mock("../utils/config.js");
vi.mock("../utils/shell.js");

describe("serviceStart", () => {
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
      serviceStart({
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
      serviceStart({
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
      serviceStart({
        workingDirectory: "/test/dir",
        serviceName: "web",
      })
    ).rejects.toThrow(
      'Service "web" has unsupported type "kubernetes". Only "docker-compose" is supported.'
    );
  });

  it("should successfully start a service", async () => {
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
      stdout: "Container web-service Started",
      stderr: "",
      exitCode: 0,
    });

    await serviceStart({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(shellModule.executeShell).toHaveBeenCalledWith(
      "docker",
      ["compose", "-f", "docker-compose.yml", "up", "-d", "web-service"],
      {
        cwd: "/test/dir/web",
        timeout: 60000,
      }
    );
  });

  it("should handle already running service (idempotent)", async () => {
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
      stdout: "Container web-service Running",
      stderr: "",
      exitCode: 0,
    });

    await serviceStart({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(shellModule.executeShell).toHaveBeenCalledWith(
      "docker",
      ["compose", "-f", "docker-compose.yml", "up", "-d", "web-service"],
      {
        cwd: "/test/dir/web",
        timeout: 60000,
      }
    );

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("is already running")
    );
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
      stderr: "Error: Cannot connect to the Docker daemon",
      exitCode: 1,
    });

    await expect(
      serviceStart({
        workingDirectory: "/test/dir",
        serviceName: "web",
      })
    ).rejects.toThrow(
      'Failed to start service "web": Error: Cannot connect to the Docker daemon'
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
      serviceStart({
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
      stdout: "Container web-service Started",
      stderr: "",
      exitCode: 0,
    });

    await serviceStart({
      workingDirectory: "/test/dir",
      serviceName: "web",
    });

    expect(shellModule.executeShell).toHaveBeenCalledWith(
      "docker",
      ["compose", "-f", "docker-compose.yml", "up", "-d", "web-service"],
      {
        cwd: "/absolute/path/web",
        timeout: 60000,
      }
    );
  });
});
