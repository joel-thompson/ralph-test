import path from "path";
import { loadConfig } from "../utils/config.js";
import { CommandError } from "../utils/errors.js";
import { executeShell } from "../utils/shell.js";

export interface ServiceLogsOptions {
  workingDirectory: string;
  serviceName: string;
  tail?: number;
  json?: boolean;
}

export interface ServiceLogsResult {
  name: string;
  type: string;
  composeFile: string;
  composeService: string;
  lines: string[];
}

/**
 * Fetch logs from a service using Docker Compose.
 * Default behavior is to tail 200 lines and exit (no follow/attach).
 */
export async function serviceLogs(
  options: ServiceLogsOptions
): Promise<ServiceLogsResult> {
  const { workingDirectory, serviceName, tail = 200, json } = options;

  // Load config to get service definitions
  const { config } = await loadConfig(workingDirectory);

  if (!config.services) {
    throw new CommandError(
      "No services configured in ral.json. Add a 'services' section to use this command."
    );
  }

  const service = config.services[serviceName];
  if (!service) {
    throw new CommandError(
      `Service "${serviceName}" not found in ral.json. Available services: ${Object.keys(config.services).join(", ")}`
    );
  }

  if (service.type !== "docker-compose") {
    throw new CommandError(
      `Service "${serviceName}" has unsupported type "${service.type}". Only "docker-compose" is supported.`
    );
  }

  // Resolve service cwd relative to working directory
  const serviceCwd = path.isAbsolute(service.cwd)
    ? service.cwd
    : path.join(workingDirectory, service.cwd);

  // Run docker compose logs --tail N for the service
  try {
    const result = await executeShell(
      "docker",
      ["compose", "-f", service.composeFile, "logs", "--tail", String(tail), service.service],
      {
        cwd: serviceCwd,
        timeout: 30000, // 30 second timeout for fetching logs
      }
    );

    if (result.exitCode !== 0) {
      throw new CommandError(
        `Failed to fetch logs for service "${serviceName}": ${result.stderr || result.stdout}`
      );
    }

    // Split output into lines
    const lines = result.stdout.split("\n");

    const logsResult: ServiceLogsResult = {
      name: serviceName,
      type: service.type,
      composeFile: service.composeFile,
      composeService: service.service,
      lines,
    };

    // Output results
    if (json) {
      console.log(JSON.stringify(logsResult, null, 2));
    } else {
      // Plain text output - just print the logs
      console.log(result.stdout);
    }

    return logsResult;
  } catch (error) {
    if (error instanceof Error) {
      // Check if docker is not available
      if (error.message.includes("ENOENT") || error.message.includes("spawn docker")) {
        throw new CommandError(
          "Docker is not available. Please ensure Docker is installed and the Docker daemon is running."
        );
      }
      throw new CommandError(
        `Failed to fetch logs for service "${serviceName}": ${error.message}`
      );
    }
    throw error;
  }
}
