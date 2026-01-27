import { exec } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";

const execAsync = promisify(exec);

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
    try {
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

      // Execute Claude CLI with JSON output format
      const { stdout, stderr } = await execAsync(
        `claude -p "${promptContent.replace(/"/g, '\\"')}" --output-format json`
      );

      if (stderr) {
        console.error("[debug] Claude CLI stderr:", stderr);
      }

      // Parse the JSON response
      const response = JSON.parse(stdout);

      // Validate the response structure
      if (!response.result || !response.usage || typeof response.total_cost_usd !== "number") {
        throw new Error("Invalid Claude CLI response format");
      }

      return {
        result: response.result,
        usage: {
          input_tokens: response.usage.input_tokens || 0,
          output_tokens: response.usage.output_tokens || 0,
          cache_read_input_tokens: response.usage.cache_read_input_tokens || 0,
        },
        total_cost_usd: response.total_cost_usd,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Failed to parse Claude CLI response as JSON");
      }
      throw error;
    }
  }
}
