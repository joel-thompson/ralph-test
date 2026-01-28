import { spawn } from "child_process";
import { readFile } from "fs/promises";

export interface AgentUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
}

export interface AgentResponse {
  result: string;
  usage: AgentUsage;
  total_cost_usd: number;
  duration_ms?: number;
}

export interface RunClaudeOptions {
  promptPath?: string;
  promptContent?: string;
  workingDirectory: string;
}

export interface AgentRunner {
  runClaude(options: RunClaudeOptions): Promise<AgentResponse>;
}

/**
 * Transform @ file references to include working directory path.
 * Only transforms if working directory is not current directory.
 */
export function transformFileReferences(content: string, workingDirectory: string): string {
  if (workingDirectory !== "." && workingDirectory !== "./") {
    // Normalize working directory by removing trailing slashes
    const normalizedDir = workingDirectory.replace(/\/+$/, "");
    // Replace @filename.md with @workingDirectory/filename.md
    return content.replace(/@(\S+\.md)/g, `@${normalizedDir}/$1`);
  }
  return content;
}

export class DefaultClaudeRunner implements AgentRunner {
  async runClaude(options: RunClaudeOptions): Promise<AgentResponse> {
    const { promptPath, promptContent: providedContent, workingDirectory } = options;

    // Exactly one of promptPath or promptContent must be provided
    if ((promptPath && providedContent) || (!promptPath && !providedContent)) {
      throw new Error("Exactly one of promptPath or promptContent must be provided");
    }

    // Get the prompt content either from file or directly
    let promptContent: string;
    if (promptPath) {
      promptContent = await readFile(promptPath, "utf-8");
    } else {
      promptContent = providedContent!;
    }

    // Transform @ file references to include working directory
    promptContent = transformFileReferences(promptContent, workingDirectory);

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
