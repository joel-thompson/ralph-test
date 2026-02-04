import path from "path";
import { loadConfig } from "../utils/config.js";
import { CommandError } from "../utils/errors.js";
import { executeShell } from "../utils/shell.js";

export interface ServiceStopOptions {
  workingDirectory: string;
  serviceName: string;
}

/**
 * Stop a service using Docker Compose.
 * This command is idempotent - it's safe to call when the service is already stopped.
 */
export async function serviceStop(options: ServiceStopOptions): Promise<void> {
  const { workingDirectory, serviceName } = options;

  // Load config to get service definitions
  const { config } = await loadConfig(process.cwd());

  if (!config.services) {
    throw new CommandError(
      "No services configured in ral.json. Add a 'services' section to use this command."
    );
  }

  const service = config.services[serviceName];
  if (!service) {
    throw new CommandError(
      `Service "${serviceName}" not found in ral.json. Available services: ${Object.keys(
        config.services
      ).join(", ")}`
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

  // Run docker compose stop for the service
  try {
    const result = await executeShell(
      "docker",
      ["compose", "-f", service.composeFile, "stop", service.service],
      {
        cwd: serviceCwd,
        timeout: 60000, // 60 second timeout for stopping services
      }
    );

    // Docker compose stop is idempotent - it will return 0 even if already stopped
    if (result.exitCode !== 0) {
      throw new CommandError(
        `Failed to stop service "${serviceName}": ${
          result.stderr || result.stdout
        }`
      );
    }

    // Check if output indicates the service was already stopped or just stopped
    const output = result.stdout + result.stderr;
    if (output.includes("no such service") || output.trim() === "") {
      console.log(
        `Service "${serviceName}" is already stopped (compose service: ${service.service})`
      );
    } else {
      console.log(
        `Stopped service "${serviceName}" (compose service: ${service.service})`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      // Check if docker is not available
      if (
        error.message.includes("ENOENT") ||
        error.message.includes("spawn docker")
      ) {
        throw new CommandError(
          "Docker is not available. Please ensure Docker is installed and the Docker daemon is running."
        );
      }
      throw new CommandError(
        `Failed to stop service "${serviceName}": ${error.message}`
      );
    }
    throw error;
  }
}
