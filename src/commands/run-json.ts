import path from "path";
import { FileSystem, DefaultFileSystem } from "../utils/file-helpers.js";
import { PROMPT_JSON_TEMPLATE } from "../templates/index.js";

export interface RunJsonOptions {
  workingDirectory: string;
  maxIterations: number;
  verbose?: boolean;
}

interface AttemptStats {
  attempt: number;
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

export interface Task {
  category: string;
  description: string;
  steps: string[];
  passes: boolean;
  [key: string]: unknown; // Allow additional fields like optional 'id'
}

/**
 * Load and validate tasks.json from the working directory.
 * @throws Error if tasks.json is not a valid JSON array or items don't have required fields
 */
export async function loadTasks(
  workingDirectory: string,
  fs: FileSystem = new DefaultFileSystem()
): Promise<Task[]> {
  const tasksPath = path.join(workingDirectory, "tasks.json");
  const content = await fs.readFile(tasksPath);

  let tasks: unknown;
  try {
    tasks = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `tasks.json is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  if (!Array.isArray(tasks)) {
    throw new Error("tasks.json must be a JSON array");
  }

  // Validate each task has required fields
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (typeof task !== "object" || task === null) {
      throw new Error(`Task at index ${i} must be an object`);
    }

    if (typeof task.category !== "string") {
      throw new Error(
        `Task at index ${i} missing required field: category (string)`
      );
    }

    if (typeof task.description !== "string") {
      throw new Error(
        `Task at index ${i} missing required field: description (string)`
      );
    }

    if (!Array.isArray(task.steps)) {
      throw new Error(
        `Task at index ${i} missing required field: steps (array)`
      );
    }

    if (typeof task.passes !== "boolean") {
      throw new Error(
        `Task at index ${i} missing required field: passes (boolean)`
      );
    }
  }

  return tasks as Task[];
}

/**
 * Select the next incomplete task (first task where passes !== true).
 * @returns The task and its index, or null if all tasks are complete
 */
export function selectNextTask(
  tasks: Task[]
): { task: Task; index: number } | null {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].passes !== true) {
      return { task: tasks[i], index: i };
    }
  }
  return null;
}

/**
 * Build a compact prompt for smart task selection.
 * Lists all incomplete tasks with their original indices.
 */
export function buildSmartSelectionPrompt(tasks: Task[]): string {
  const incompleteTasks: Array<{ index: number; task: Task }> = [];

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].passes !== true) {
      incompleteTasks.push({ index: i, task: tasks[i] });
    }
  }

  const taskList = incompleteTasks
    .map(({ index, task }) => {
      return `Index ${index}: [${task.category}] ${task.description}`;
    })
    .join("\n");

  return `You are a task selection assistant. Choose the best next task to work on from the following incomplete tasks:

${taskList}

Consider:
- Task dependencies (some tasks may need to be done before others)
- Logical ordering (configuration before implementation, implementation before testing, testing before documentation)
- Current project state and what makes the most sense to tackle next

Respond with ONLY valid JSON in this exact format:
{"index": N}

Where N is the index number of the task you select. No explanation, no additional text, just the JSON object.`;
}

/**
 * Validate a smart selection response.
 * @returns The validated index, or null if invalid
 */
export function validateSmartSelection(
  responseText: string,
  tasks: Task[]
): number | null {
  const tryParse = (text: string): unknown => JSON.parse(text);
  const candidates: string[] = [];

  const trimmed = responseText.trim();
  if (trimmed.length > 0) {
    candidates.push(trimmed);
  }

  // Handle common "```json ... ```" / "``` ... ```" wrappers.
  // This keeps validation strict while being tolerant of formatting.
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);
  if (fenceMatch?.[1]) {
    const fenced = fenceMatch[1].trim();
    if (fenced.length > 0) {
      candidates.push(fenced);
    }
  }

  // As a last resort, try extracting the first {...} block.
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const braceSlice = trimmed.slice(firstBrace, lastBrace + 1).trim();
    if (braceSlice.length > 0) {
      candidates.push(braceSlice);
    }
  }

  let parsed: unknown = null;
  for (const candidate of candidates) {
    try {
      parsed = tryParse(candidate);
      break;
    } catch {
      // keep trying candidates
    }
  }

  try {
    if (parsed === null) {
      return null;
    }

    // Check if it has an index field
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    if (
      !("index" in parsed) ||
      typeof (parsed as { index?: unknown }).index !== "number"
    ) {
      return null;
    }

    const index = (parsed as { index: number }).index;

    // Check if index is an integer
    if (!Number.isInteger(index)) {
      return null;
    }

    // Check if index is in valid range
    if (index < 0 || index >= tasks.length) {
      return null;
    }

    // Check if task at index is incomplete
    if (tasks[index].passes === true) {
      return null;
    }

    return index;
  } catch {
    // JSON parse error or any other error
    return null;
  }
}

/**
 * Result of smart task selection, including selection and usage data.
 */
export interface SmartSelectionResult {
  selection: { task: Task; index: number } | null;
  usage: import("../utils/claude-runner.js").AgentUsage | null;
  totalCostUsd: number;
  durationMs?: number;
}

/**
 * Attempt smart task selection using the runner.
 * @returns Selection result (task + index or null), plus usage/cost data from the runner
 */
export async function selectTaskSmart(
  tasks: Task[],
  workingDirectory: string,
  runner: import("../utils/claude-runner.js").AgentRunner,
  verbose: boolean = false
): Promise<SmartSelectionResult> {
  try {
    const promptContent = buildSmartSelectionPrompt(tasks);

    const response = await runner.runAgent({
      promptContent,
      workingDirectory,
    });

    const validatedIndex = validateSmartSelection(response.result, tasks);

    if (validatedIndex === null) {
      if (verbose) {
        console.warn(
          "\n--- Smart task selection debug (validation failed) ---"
        );
        console.warn("Prompt sent to runner:");
        console.warn(promptContent);
        console.warn("\nRunner response:");
        const trimmedResponse = response.result.trim();
        const previewLength = 500;
        if (trimmedResponse.length > previewLength) {
          console.warn(
            `${trimmedResponse.substring(
              0,
              previewLength
            )}...\n[truncated, full length: ${trimmedResponse.length} chars]`
          );
        } else {
          console.warn(trimmedResponse);
        }
        console.warn("--- End debug ---\n");
      }
      // Selection failed validation, but return usage/cost data
      return {
        selection: null,
        usage: response.usage,
        totalCostUsd: response.total_cost_usd,
        durationMs: response.duration_ms,
      };
    }

    return {
      selection: {
        task: tasks[validatedIndex],
        index: validatedIndex,
      },
      usage: response.usage,
      totalCostUsd: response.total_cost_usd,
      durationMs: response.duration_ms,
    };
  } catch (error) {
    if (verbose) {
      console.warn("\n--- Smart task selection debug (runner error) ---");
      const promptContent = buildSmartSelectionPrompt(tasks);
      console.warn("Prompt sent to runner:");
      console.warn(promptContent);
      console.warn("\nRunner error:");
      if (error instanceof Error) {
        console.warn(`Message: ${error.message}`);
        if (error.stack) {
          console.warn(`Stack: ${error.stack}`);
        }
      } else {
        console.warn(String(error));
      }
      console.warn("--- End debug ---\n");
    }
    // Any error during smart selection returns null (no usage/cost available)
    return {
      selection: null,
      usage: null,
      totalCostUsd: 0,
    };
  }
}

/**
 * Mark a task as complete by setting passes=true at the given index.
 * @returns A new array with the task at the given index marked complete
 */
export function markTaskComplete(tasks: Task[], index: number): Task[] {
  if (index < 0 || index >= tasks.length) {
    throw new Error(`Invalid task index: ${index}`);
  }

  // Create a deep copy to avoid mutating the original
  const updatedTasks = tasks.map((task, i) => {
    if (i === index) {
      return { ...task, passes: true };
    }
    return { ...task };
  });

  return updatedTasks;
}

/**
 * Build the prompt content for run-json workflow.
 * Includes prompt.md content, @ references, and the selected task JSON inline.
 */
export async function buildPromptContent(
  workingDirectory: string,
  task: Task,
  index: number,
  fs: FileSystem = new DefaultFileSystem()
): Promise<string> {
  const promptPath = path.join(workingDirectory, "prompt.md");
  let promptTemplate: string;

  try {
    promptTemplate = await fs.readFile(promptPath);
  } catch {
    // If prompt.md doesn't exist, use the default template
    promptTemplate = PROMPT_JSON_TEMPLATE;
  }

  // Build the task section to insert
  const taskSection = `\`\`\`json
${JSON.stringify(task, null, 2)}
\`\`\`

**Task Index:** ${index}
**Category:** ${task.category}
**Description:** ${task.description}

**Steps:**
${task.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}
`;

  // Replace the placeholder with the actual task details
  const promptWithTask = promptTemplate.replace(
    "The CLI will insert the current task details here when invoking the agent.",
    taskSection
  );

  return promptWithTask;
}

/**
 * Persist updated tasks.json with stable formatting.
 * Uses JSON.stringify with 2-space indentation and trailing newline.
 */
export async function saveTasks(
  workingDirectory: string,
  tasks: Task[],
  fs: FileSystem = new DefaultFileSystem()
): Promise<void> {
  const tasksPath = path.join(workingDirectory, "tasks.json");
  const content = JSON.stringify(tasks, null, 2) + "\n";
  await fs.writeFile(tasksPath, content);
}

export async function runJson(
  options: RunJsonOptions,
  runner?: import("../utils/claude-runner.js").AgentRunner,
  fs: FileSystem = new DefaultFileSystem()
): Promise<void> {
  const { workingDirectory, maxIterations, verbose = false } = options;

  // Import validation utilities and config
  const { validateWorkingDirectory, validateRequiredFiles } = await import(
    "../utils/validation.js"
  );
  const { loadConfig } = await import("../utils/config.js");
  const { DefaultClaudeRunner } = await import("../utils/claude-runner.js");
  const { CursorRunner } = await import("../utils/cursor-runner.js");
  const { CommandError } = await import("../utils/errors.js");

  // Validate working directory exists
  await validateWorkingDirectory(workingDirectory, fs);

  // Load config and select runner if not provided
  const configResult = await loadConfig(workingDirectory, process.cwd());
  const config = configResult.config;

  if (!runner) {
    // Log config information
    console.log("\n--- Configuration ---");
    if (configResult.source === "default") {
      console.log("Using default config (no ral.json found)");
    } else if (configResult.source === "working-directory") {
      console.log(`Config loaded from: ${configResult.path}`);
    } else if (configResult.source === "root-directory") {
      console.log(`Config loaded from: ${configResult.path}`);
    }
    console.log(`Runner: ${config.runner}`);
    if (config.model) {
      console.log(`Model: ${config.model}`);
    }
    console.log("");

    if (config.runner === "cursor") {
      runner = new CursorRunner(config.model);
    } else {
      runner = new DefaultClaudeRunner();
    }
  }

  // Validate required files exist
  const requiredFiles = ["plan.md", "prompt.md", "activity.md", "tasks.json"];
  const validation = await validateRequiredFiles(
    workingDirectory,
    requiredFiles,
    fs
  );

  if (!validation.valid) {
    throw new CommandError(
      `Missing required files: ${validation.missing.join(", ")}\n` +
        `Run 'ral scaffold-json -w ${workingDirectory}' to create the necessary files.`
    );
  }

  // Log task selection mode
  if (config.taskSelection === "smart") {
    console.log(
      "Task selection mode: smart (with fallback to first-incomplete)"
    );
  }

  // Initialize cumulative stats
  const cumulative: CumulativeStats = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheReadTokens: 0,
    totalCost: 0,
  };

  // Run the loop
  for (let attempt = 1; attempt <= maxIterations; attempt++) {
    // Load tasks and select next incomplete task
    let tasks: Task[];
    try {
      tasks = await loadTasks(workingDirectory, fs);
    } catch (error) {
      throw new CommandError(
        `Failed to load tasks.json: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Attempt smart selection if configured
    let selected: { task: Task; index: number } | null = null;

    if (config.taskSelection === "smart") {
      const smartResult = await selectTaskSmart(
        tasks,
        workingDirectory,
        runner,
        verbose
      );
      selected = smartResult.selection;
      if (selected === null) {
        console.warn(
          "⚠ Smart task selection failed, falling back to first incomplete task"
        );
      }
    }

    // Fall back to first incomplete task if smart selection didn't work
    if (selected === null) {
      selected = selectNextTask(tasks);
    }

    if (!selected) {
      console.log("\n✓ All tasks completed successfully!");
      process.exit(0);
      return; // For testing - process.exit doesn't actually exit when mocked
    }

    // Only print attempt banner when we have a task to work on
    console.log(`\n--- Attempt ${attempt}/${maxIterations} ---`);

    const { task, index } = selected;
    console.log(
      `Working on task ${index + 1}/${tasks.length}: ${task.description}`
    );

    // Build prompt content
    let promptContent: string;
    try {
      promptContent = await buildPromptContent(
        workingDirectory,
        task,
        index,
        fs
      );
    } catch (error) {
      throw new CommandError(
        `Failed to build prompt content: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Call runner with prompt content
    let response;
    try {
      response = await runner.runAgent({
        promptContent,
        workingDirectory,
      });
    } catch (error) {
      throw new CommandError(
        `Failed to run agent: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Update cumulative stats
    cumulative.totalInputTokens += response.usage.input_tokens;
    cumulative.totalOutputTokens += response.usage.output_tokens;
    cumulative.totalCacheReadTokens += response.usage.cache_read_input_tokens;
    cumulative.totalCost += response.total_cost_usd;

    // Print per-attempt stats
    const attemptStats: AttemptStats = {
      attempt,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheReadTokens: response.usage.cache_read_input_tokens,
      cost: response.total_cost_usd,
    };

    // Only show token/cost stats if they are non-zero (Claude mode)
    const hasTokenStats =
      attemptStats.inputTokens > 0 ||
      attemptStats.outputTokens > 0 ||
      attemptStats.cost > 0;

    if (hasTokenStats) {
      console.log(`Tokens In: ${attemptStats.inputTokens}`);
      console.log(`Tokens Out: ${attemptStats.outputTokens}`);
      console.log(`Cache Read: ${attemptStats.cacheReadTokens}`);
      console.log(`Cost: $${attemptStats.cost.toFixed(4)}`);

      // Print cumulative stats
      console.log("\nCumulative Stats:");
      console.log(`Total Tokens In: ${cumulative.totalInputTokens}`);
      console.log(`Total Tokens Out: ${cumulative.totalOutputTokens}`);
      console.log(`Total Cache Read: ${cumulative.totalCacheReadTokens}`);
      console.log(`Total Cost: $${cumulative.totalCost.toFixed(4)}`);
    } else if (response.duration_ms !== undefined) {
      // Show duration for Cursor mode
      console.log(`Duration: ${response.duration_ms}ms`);
    }

    // Check for success promise in response
    if (response.result.includes("<promise>success</promise>")) {
      console.log(`✓ Task ${index + 1} completed successfully!`);

      // Mark task complete and persist tasks.json
      const updatedTasks = markTaskComplete(tasks, index);
      try {
        await saveTasks(workingDirectory, updatedTasks, fs);
        console.log("✓ tasks.json updated");
      } catch (error) {
        throw new CommandError(
          `Failed to save tasks.json: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }

      // Check if all tasks are now complete
      const remainingTasks = updatedTasks.filter((t) => t.passes !== true);
      if (remainingTasks.length === 0) {
        console.log("\n✓ All tasks completed successfully!");
        process.exit(0);
        return; // For testing - process.exit doesn't actually exit when mocked
      }
    } else {
      console.log(
        `✗ Task ${
          index + 1
        } did not complete (no <promise>success</promise> found)`
      );
      console.log("The task will be retried on the next attempt.");
    }
  }

  // Max attempts reached without completing all tasks
  const tasks = await loadTasks(workingDirectory, fs);
  const remaining = tasks.filter((t) => t.passes !== true).length;
  console.log(
    `\n✗ Maximum attempts (${maxIterations}) reached with ${remaining} task(s) still incomplete.`
  );
  process.exit(1);
  return; // For testing - process.exit doesn't actually exit when mocked
}
