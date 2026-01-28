import { readFile } from "fs/promises";
import path from "path";
import { CommandError } from "./errors.js";

export interface RalConfig {
  runner: "claude" | "cursor";
  model?: string;
}

export type ConfigSource = "working-directory" | "root-directory" | "default";

export interface ConfigResult {
  config: RalConfig;
  source: ConfigSource;
  path?: string;
}

const DEFAULT_CONFIG: RalConfig = {
  runner: "claude",
};

export async function loadConfig(
  workingDirectory: string,
  rootDirectory?: string
): Promise<ConfigResult> {
  const workingConfigPath = path.join(workingDirectory, "ral.json");

  try {
    const content = await readFile(workingConfigPath, "utf-8");
    const config = JSON.parse(content);

    // Validate config structure
    if (!config || typeof config !== "object") {
      throw new CommandError("Invalid ral.json: config must be an object");
    }

    if (config.runner && config.runner !== "claude" && config.runner !== "cursor") {
      throw new CommandError(
        `Invalid ral.json: runner must be "claude" or "cursor", got "${config.runner}"`
      );
    }

    if (config.model !== undefined && typeof config.model !== "string") {
      throw new CommandError("Invalid ral.json: model must be a string");
    }

    console.log(`Using config from ${workingConfigPath}`);

    return {
      config: {
        runner: config.runner || DEFAULT_CONFIG.runner,
        model: config.model,
      },
      source: "working-directory",
      path: workingConfigPath,
    };
  } catch (error) {
    // If file doesn't exist and rootDirectory is provided, try root directory
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT" &&
      rootDirectory
    ) {
      const rootConfigPath = path.join(rootDirectory, "ral.json");

      try {
        const content = await readFile(rootConfigPath, "utf-8");
        const config = JSON.parse(content);

        // Validate config structure
        if (!config || typeof config !== "object") {
          throw new CommandError("Invalid ral.json: config must be an object");
        }

        if (config.runner && config.runner !== "claude" && config.runner !== "cursor") {
          throw new CommandError(
            `Invalid ral.json: runner must be "claude" or "cursor", got "${config.runner}"`
          );
        }

        if (config.model !== undefined && typeof config.model !== "string") {
          throw new CommandError("Invalid ral.json: model must be a string");
        }

        console.log(`Config not found in working directory, using root config from ${rootConfigPath}`);

        return {
          config: {
            runner: config.runner || DEFAULT_CONFIG.runner,
            model: config.model,
          },
          source: "root-directory",
          path: rootConfigPath,
        };
      } catch (rootError) {
        // If root directory config also doesn't exist, return default config
        if (
          rootError instanceof Error &&
          "code" in rootError &&
          rootError.code === "ENOENT"
        ) {
          console.log(`No ral.json found, using default config (runner: claude)`);

          return {
            config: DEFAULT_CONFIG,
            source: "default",
          };
        }

        // If it's already a CommandError, rethrow it
        if (rootError instanceof CommandError) {
          throw rootError;
        }

        // Handle JSON parse errors
        if (rootError instanceof SyntaxError) {
          throw new CommandError(`Invalid ral.json: ${rootError.message}`);
        }

        // Handle other errors
        throw rootError;
      }
    }

    // If file doesn't exist and no rootDirectory provided, return default config
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.log(`No ral.json found, using default config (runner: claude)`);

      return {
        config: DEFAULT_CONFIG,
        source: "default",
      };
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
