import path from "path";
import { loadConfig } from "../utils/config.js";
import { CommandError } from "../utils/errors.js";
import { executeShell } from "../utils/shell.js";

export interface ServiceStatusOptions {
  workingDirectory: string;
  serviceName: string;
  json?: boolean;
}

export interface ServiceStatus {
  name: string;
  type: string;
  running: boolean;
  healthy: boolean;
  healthcheckUrl: string;
  composeFile: string;
  composeService: string;
}

/**
 * Check the status of a service using Docker Compose and HTTP healthcheck.
 */
export async function serviceStatus(
  options: ServiceStatusOptions
): Promise<ServiceStatus> {
  const { workingDirectory, serviceName, json } = options;

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

  // Determine if the service is running using Docker Compose
  let running = false;
  try {
    const result = await executeShell(
      "docker",
      [
        "compose",
        "-f",
        service.composeFile,
        "ps",
        "--status",
        "running",
        "--format",
        "json",
        service.service,
      ],
      {
        cwd: serviceCwd,
        timeout: 30000, // 30 second timeout for status checks
      }
    );

    if (result.exitCode === 0 && result.stdout.trim()) {
      // Docker compose ps --format json can output newline-delimited JSON objects
      // or a single JSON object. We need to handle both cases.
      const lines = result.stdout
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        try {
          const containerInfo = JSON.parse(line);
          // Check if this container is for our service and is running
          if (
            containerInfo.Service === service.service &&
            containerInfo.State === "running"
          ) {
            running = true;
            break;
          }
        } catch {
          // If we can't parse a line, skip it
          continue;
        }
      }
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
    }
    // If docker command fails, assume not running
    running = false;
  }

  // Determine if the service is healthy using HTTP healthcheck
  let healthy = false;
  if (running) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(service.healthcheckUrl, {
        signal: controller.signal,
        method: "GET",
      });

      clearTimeout(timeout);

      // Consider 2xx responses as healthy
      if (response.status >= 200 && response.status < 300) {
        healthy = true;
      }
    } catch {
      // If healthcheck fails (timeout, connection refused, etc), healthy = false
      healthy = false;
    }
  }

  const status: ServiceStatus = {
    name: serviceName,
    type: service.type,
    running,
    healthy,
    healthcheckUrl: service.healthcheckUrl,
    composeFile: service.composeFile,
    composeService: service.service,
  };

  // Output results
  if (json) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    console.log(`Service: ${serviceName}`);
    console.log(`Type: ${service.type}`);
    console.log(`Running: ${running ? "yes" : "no"}`);
    console.log(`Healthy: ${healthy ? "yes" : "no"}`);
    console.log(`Healthcheck URL: ${service.healthcheckUrl}`);
    console.log(`Compose file: ${service.composeFile}`);
    console.log(`Compose service: ${service.service}`);
  }

  return status;
}
