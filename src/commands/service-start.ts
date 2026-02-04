import path from "path";
import { loadConfig } from "../utils/config.js";
import { CommandError } from "../utils/errors.js";
import { executeShell } from "../utils/shell.js";

export interface ServiceStartOptions {
  workingDirectory: string;
  serviceName: string;
}

/**
 * Start a service using Docker Compose.
 * This command is idempotent - it's safe to call when the service is already running.
 */
export async function serviceStart(
  options: ServiceStartOptions
): Promise<void> {
  const { workingDirectory, serviceName } = options;

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

  // Run docker compose up -d for the service
  try {
    const result = await executeShell(
      "docker",
      ["compose", "-f", service.composeFile, "up", "-d", service.service],
      {
        cwd: serviceCwd,
        timeout: 60000, // 60 second timeout for starting services
      }
    );

    // Docker compose up -d is idempotent - it will return 0 even if already running
    if (result.exitCode !== 0) {
      throw new CommandError(
        `Failed to start service "${serviceName}": ${result.stderr || result.stdout}`
      );
    }

    // Check if output indicates the service was already running or just started
    const output = result.stdout + result.stderr;
    if (output.includes("Running") || output.includes("up-to-date")) {
      console.log(
        `Service "${serviceName}" is already running (compose service: ${service.service})`
      );
    } else if (output.includes("Started") || output.includes("Created")) {
      console.log(
        `Started service "${serviceName}" (compose service: ${service.service})`
      );
    } else {
      console.log(
        `Service "${serviceName}" started successfully (compose service: ${service.service})`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      // Check if docker is not available
      if (error.message.includes("ENOENT") || error.message.includes("spawn docker")) {
        throw new CommandError(
          "Docker is not available. Please ensure Docker is installed and the Docker daemon is running."
        );
      }
      throw new CommandError(
        `Failed to start service "${serviceName}": ${error.message}`
      );
    }
    throw error;
  }
}
