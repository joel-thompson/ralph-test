import path from "path";
import { FileSystem, DefaultFileSystem } from "../utils/file-helpers.js";
import { PROMPT_JSON_TEMPLATE } from "../templates/index.js";

export interface RunJsonOptions {
  workingDirectory: string;
  maxIterations: number;
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
    throw new Error(`tasks.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
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
      throw new Error(`Task at index ${i} missing required field: category (string)`);
    }

    if (typeof task.description !== "string") {
      throw new Error(`Task at index ${i} missing required field: description (string)`);
    }

    if (!Array.isArray(task.steps)) {
      throw new Error(`Task at index ${i} missing required field: steps (array)`);
    }

    if (typeof task.passes !== "boolean") {
      throw new Error(`Task at index ${i} missing required field: passes (boolean)`);
    }
  }

  return tasks as Task[];
}

/**
 * Select the next incomplete task (first task where passes !== true).
 * @returns The task and its index, or null if all tasks are complete
 */
export function selectNextTask(tasks: Task[]): { task: Task; index: number } | null {
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].passes !== true) {
      return { task: tasks[i], index: i };
    }
  }
  return null;
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

export async function runJson(options: RunJsonOptions): Promise<void> {
  // TODO: Implement run-json command loop in next task (task 7)
  throw new Error('run-json command not yet implemented');
}
