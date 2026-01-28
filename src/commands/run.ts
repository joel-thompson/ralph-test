import path from "path";
import {
  validateWorkingDirectory,
  validateRequiredFiles,
} from "../utils/validation.js";
import { CommandError } from "../utils/errors.js";
import { AgentRunner, DefaultClaudeRunner } from "../utils/claude-runner.js";

export interface RunOptions {
  workingDirectory: string;
  maxIterations: number;
}

interface IterationStats {
  iteration: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cost: number;
}

interface CumulativeStats {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCost: number;
}

export async function run(
  options: RunOptions,
  runner: AgentRunner = new DefaultClaudeRunner()
): Promise<void> {
  const { workingDirectory, maxIterations } = options;

  // Validate working directory exists
  await validateWorkingDirectory(workingDirectory);

  // Validate required files exist
  const requiredFiles = ["plan.md", "prompt.md", "activity.md"];
  const validation = await validateRequiredFiles(
    workingDirectory,
    requiredFiles
  );

  if (!validation.valid) {
    throw new CommandError(
      `Missing required files: ${validation.missing.join(", ")}\n` +
        `Run 'ral scaffold -w ${workingDirectory}' to create the necessary files.`
    );
  }

  const promptPath = path.join(workingDirectory, "prompt.md");

  // Initialize cumulative stats
  const cumulative: CumulativeStats = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheReadTokens: 0,
    totalCost: 0,
  };

  // Run the loop
  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`\n--- Iteration ${iteration}/${maxIterations} ---`);

    try {
      // Call Claude CLI
      const response = await runner.runClaude(promptPath, workingDirectory);

      // Update cumulative stats
      cumulative.totalInputTokens += response.usage.input_tokens;
      cumulative.totalOutputTokens += response.usage.output_tokens;
      cumulative.totalCacheReadTokens += response.usage.cache_read_input_tokens;
      cumulative.totalCost += response.total_cost_usd;

      // Print per-iteration stats
      const iterationStats: IterationStats = {
        iteration,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens,
        cost: response.total_cost_usd,
      };

      console.log(`Tokens In: ${iterationStats.inputTokens}`);
      console.log(`Tokens Out: ${iterationStats.outputTokens}`);
      console.log(`Cache Read: ${iterationStats.cacheReadTokens}`);
      console.log(`Cost: $${iterationStats.cost.toFixed(4)}`);

      // Print cumulative stats
      console.log("\nCumulative Stats:");
      console.log(`Total Tokens In: ${cumulative.totalInputTokens}`);
      console.log(`Total Tokens Out: ${cumulative.totalOutputTokens}`);
      console.log(`Total Cache Read: ${cumulative.totalCacheReadTokens}`);
      console.log(`Total Cost: $${cumulative.totalCost.toFixed(4)}`);

      // Check for completion
      if (response.result.includes("<promise>COMPLETE</promise>")) {
        console.log(
          `\n✓ Task completed successfully after ${iteration} iteration(s)!`
        );
        process.exit(0);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new CommandError(`Failed to run Claude CLI: ${error.message}`);
      }
      throw error;
    }
  }

  // Max iterations reached without completion
  console.log(
    `\n✗ Maximum iterations (${maxIterations}) reached without completion.`
  );
  process.exit(1);
}
