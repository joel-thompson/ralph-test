import { readFile } from "fs/promises";
import path from "path";
import { CommandError } from "./errors.js";

export interface DockerComposeService {
  type: "docker-compose";
  cwd: string;
  composeFile: string;
  service: string;
  healthcheckUrl: string;
}

export type ServiceConfig = DockerComposeService;

export interface RalConfig {
  runner: "claude" | "cursor";
  model?: string;
  taskSelection?: "first-incomplete" | "smart";
  services?: Record<string, ServiceConfig>;
}

export type ConfigSource = "root-directory" | "default";

export interface ConfigResult {
  config: RalConfig;
  source: ConfigSource;
  path?: string;
}

const DEFAULT_CONFIG: RalConfig = {
  runner: "claude",
  taskSelection: "first-incomplete",
};

function validateServiceConfig(
  serviceName: string,
  service: unknown
): ServiceConfig {
  if (!service || typeof service !== "object") {
    throw new CommandError(
      `Invalid ral.json: services.${serviceName} must be an object`
    );
  }

  const serviceObj = service as Record<string, unknown>;

  if (serviceObj.type !== "docker-compose") {
    throw new CommandError(
      `Invalid ral.json: services.${serviceName}.type must be "docker-compose", got "${serviceObj.type}"`
    );
  }

  if (!serviceObj.cwd || typeof serviceObj.cwd !== "string") {
    throw new CommandError(
      `Invalid ral.json: services.${serviceName}.cwd is required and must be a string`
    );
  }

  if (!serviceObj.composeFile || typeof serviceObj.composeFile !== "string") {
    throw new CommandError(
      `Invalid ral.json: services.${serviceName}.composeFile is required and must be a string`
    );
  }

  if (!serviceObj.service || typeof serviceObj.service !== "string") {
    throw new CommandError(
      `Invalid ral.json: services.${serviceName}.service is required and must be a string`
    );
  }

  if (
    !serviceObj.healthcheckUrl ||
    typeof serviceObj.healthcheckUrl !== "string"
  ) {
    throw new CommandError(
      `Invalid ral.json: services.${serviceName}.healthcheckUrl is required and must be a string`
    );
  }

  // Validate healthcheckUrl is a valid URL
  try {
    new globalThis.URL(serviceObj.healthcheckUrl);
  } catch {
    throw new CommandError(
      `Invalid ral.json: services.${serviceName}.healthcheckUrl must be a valid URL, got "${serviceObj.healthcheckUrl}"`
    );
  }

  return {
    type: serviceObj.type,
    cwd: serviceObj.cwd,
    composeFile: serviceObj.composeFile,
    service: serviceObj.service,
    healthcheckUrl: serviceObj.healthcheckUrl,
  };
}

function validateServices(services: unknown): Record<string, ServiceConfig> {
  if (!services || typeof services !== "object" || Array.isArray(services)) {
    throw new CommandError("Invalid ral.json: services must be an object");
  }

  const validatedServices: Record<string, ServiceConfig> = {};

  for (const [serviceName, serviceConfig] of Object.entries(services)) {
    validatedServices[serviceName] = validateServiceConfig(
      serviceName,
      serviceConfig
    );
  }

  return validatedServices;
}

export async function loadConfig(
  rootDirectory?: string
): Promise<ConfigResult> {
  if (!rootDirectory) {
    console.log("No ral.json found, using default config (runner: claude)");
    return { config: DEFAULT_CONFIG, source: "default" };
  }

  const configPath = path.join(rootDirectory, "ral.json");

  try {
    const content = await readFile(configPath, "utf-8");
    const config = JSON.parse(content);

    // Validate config structure
    if (!config || typeof config !== "object") {
      throw new CommandError("Invalid ral.json: config must be an object");
    }

    if (
      config.runner &&
      config.runner !== "claude" &&
      config.runner !== "cursor"
    ) {
      throw new CommandError(
        `Invalid ral.json: runner must be "claude" or "cursor", got "${config.runner}"`
      );
    }

    if (config.model !== undefined && typeof config.model !== "string") {
      throw new CommandError("Invalid ral.json: model must be a string");
    }

    if (
      config.taskSelection !== undefined &&
      config.taskSelection !== "first-incomplete" &&
      config.taskSelection !== "smart"
    ) {
      throw new CommandError(
        `Invalid ral.json: taskSelection must be "first-incomplete" or "smart", got "${config.taskSelection}"`
      );
    }

    let validatedServices: Record<string, ServiceConfig> | undefined;
    if (config.services !== undefined) {
      validatedServices = validateServices(config.services);
    }

    console.log(`Using config from ${configPath}`);

    return {
      config: {
        runner: config.runner || DEFAULT_CONFIG.runner,
        model: config.model,
        taskSelection: config.taskSelection || DEFAULT_CONFIG.taskSelection,
        services: validatedServices,
      },
      source: "root-directory",
      path: configPath,
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.log("No ral.json found, using default config (runner: claude)");
      return { config: DEFAULT_CONFIG, source: "default" };
    }

    // If it's already a CommandError, rethrow it
    if (error instanceof CommandError) {
      throw error;
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      throw new CommandError(`Invalid ral.json: ${error.message}`);
    }

    // Handle other errors
    throw error;
  }
}
