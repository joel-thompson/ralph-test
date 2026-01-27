import { spawn } from "child_process";
import { readFile } from "fs/promises";

export interface ClaudeUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
}

export interface ClaudeResponse {
  result: string;
  usage: ClaudeUsage;
  total_cost_usd: number;
}

export interface ClaudeRunner {
  runClaude(promptPath: string, workingDirectory: string): Promise<ClaudeResponse>;
}

export class DefaultClaudeRunner implements ClaudeRunner {
  async runClaude(promptPath: string, workingDirectory: string): Promise<ClaudeResponse> {
    // Read the prompt file
    let promptContent = await readFile(promptPath, "utf-8");

    // Transform @ file references to include working directory
    // Only transform if working directory is not current directory
    if (workingDirectory !== "." && workingDirectory !== "./") {
      // Normalize working directory by removing trailing slashes
      const normalizedDir = workingDirectory.replace(/\/+$/, "");
      // Replace @filename.md with @workingDirectory/filename.md
      promptContent = promptContent.replace(/@(\S+\.md)/g, `@${normalizedDir}/$1`);
    }

    return new Promise((resolve, reject) => {
      const claude = spawn("claude", ["-p", promptContent, "--output-format", "json"], {
        stdio: ["inherit", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      claude.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      claude.stderr.on("data", (data) => {
        const chunk = data.toString();
        stderr += chunk;
        // Stream stderr to console for visibility
        process.stderr.write(chunk);
      });

      claude.on("error", (error) => {
        reject(new Error(`Failed to spawn Claude CLI: ${error.message}`));
      });

      claude.on("close", (code) => {
        if (code !== 0 && !stdout) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          const response = JSON.parse(stdout);

          // Validate the response structure
          if (!response.result || !response.usage || typeof response.total_cost_usd !== "number") {
            reject(new Error("Invalid Claude CLI response format"));
            return;
          }

          resolve({
            result: response.result,
            usage: {
              input_tokens: response.usage.input_tokens || 0,
              output_tokens: response.usage.output_tokens || 0,
              cache_read_input_tokens: response.usage.cache_read_input_tokens || 0,
            },
            total_cost_usd: response.total_cost_usd,
          });
        } catch (error) {
          if (error instanceof SyntaxError) {
            reject(new Error("Failed to parse Claude CLI response as JSON"));
          } else {
            reject(error);
          }
        }
      });
    });
  }
}
