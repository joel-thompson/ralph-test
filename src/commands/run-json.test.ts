import { describe, it, expect, beforeEach } from "vitest";
import {
  loadTasks,
  selectNextTask,
  markTaskComplete,
  buildPromptContent,
  saveTasks,
  Task,
} from "./run-json.js";
import { FileSystem } from "../utils/file-helpers.js";

class MockFileSystem implements FileSystem {
  private files: Map<string, string> = new Map();

  async writeFile(filePath: string, content: string): Promise<void> {
    this.files.set(filePath, content);
  }

  async readFile(filePath: string): Promise<string> {
    const content = this.files.get(filePath);
    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    }
    return content;
  }

  async exists(filePath: string): Promise<boolean> {
    return this.files.has(filePath);
  }

  async mkdir(_dirPath: string, _options?: { recursive?: boolean }): Promise<void> {
    // No-op for tests
  }

  setFile(filePath: string, content: string): void {
    this.files.set(filePath, content);
  }

  getFile(filePath: string): string | undefined {
    return this.files.get(filePath);
  }
}

describe("run-json helpers", () => {
  let mockFs: MockFileSystem;

  beforeEach(() => {
    mockFs = new MockFileSystem();
  });

  describe("loadTasks", () => {
    it("should load and validate a valid tasks.json", async () => {
      const tasksJson = [
        {
          category: "setup",
          description: "Setup project",
          steps: ["Step 1", "Step 2"],
          passes: false,
        },
        {
          category: "implementation",
          description: "Implement feature",
          steps: ["Step A"],
          passes: true,
        },
      ];

      mockFs.setFile("/test/tasks.json", JSON.stringify(tasksJson, null, 2));

      const tasks = await loadTasks("/test", mockFs);

      expect(tasks).toEqual(tasksJson);
      expect(tasks).toHaveLength(2);
    });

    it("should throw error if tasks.json is not valid JSON", async () => {
      mockFs.setFile("/test/tasks.json", "not valid json {");

      await expect(loadTasks("/test", mockFs)).rejects.toThrow("tasks.json is not valid JSON");
    });

    it("should throw error if tasks.json is not an array", async () => {
      mockFs.setFile("/test/tasks.json", JSON.stringify({ foo: "bar" }));

      await expect(loadTasks("/test", mockFs)).rejects.toThrow("tasks.json must be a JSON array");
    });

    it("should throw error if task is missing category field", async () => {
      const invalidTasks = [
        {
          description: "Test",
          steps: [],
          passes: false,
        },
      ];

      mockFs.setFile("/test/tasks.json", JSON.stringify(invalidTasks));

      await expect(loadTasks("/test", mockFs)).rejects.toThrow(
        "Task at index 0 missing required field: category (string)"
      );
    });

    it("should throw error if task is missing description field", async () => {
      const invalidTasks = [
        {
          category: "test",
          steps: [],
          passes: false,
        },
      ];

      mockFs.setFile("/test/tasks.json", JSON.stringify(invalidTasks));

      await expect(loadTasks("/test", mockFs)).rejects.toThrow(
        "Task at index 0 missing required field: description (string)"
      );
    });

    it("should throw error if task is missing steps field", async () => {
      const invalidTasks = [
        {
          category: "test",
          description: "Test",
          passes: false,
        },
      ];

      mockFs.setFile("/test/tasks.json", JSON.stringify(invalidTasks));

      await expect(loadTasks("/test", mockFs)).rejects.toThrow(
        "Task at index 0 missing required field: steps (array)"
      );
    });

    it("should throw error if task is missing passes field", async () => {
      const invalidTasks = [
        {
          category: "test",
          description: "Test",
          steps: [],
        },
      ];

      mockFs.setFile("/test/tasks.json", JSON.stringify(invalidTasks));

      await expect(loadTasks("/test", mockFs)).rejects.toThrow(
        "Task at index 0 missing required field: passes (boolean)"
      );
    });

    it("should allow additional fields beyond required ones", async () => {
      const tasksWithExtra = [
        {
          id: "task-1",
          category: "setup",
          description: "Setup",
          steps: ["Step 1"],
          passes: false,
          priority: "high",
        },
      ];

      mockFs.setFile("/test/tasks.json", JSON.stringify(tasksWithExtra));

      const tasks = await loadTasks("/test", mockFs);

      expect(tasks).toEqual(tasksWithExtra);
      expect(tasks[0]).toHaveProperty("id", "task-1");
      expect(tasks[0]).toHaveProperty("priority", "high");
    });
  });

  describe("selectNextTask", () => {
    it("should select the first task with passes !== true", () => {
      const tasks: Task[] = [
        {
          category: "setup",
          description: "Setup",
          steps: [],
          passes: true,
        },
        {
          category: "implementation",
          description: "Implement",
          steps: [],
          passes: false,
        },
        {
          category: "testing",
          description: "Test",
          steps: [],
          passes: false,
        },
      ];

      const result = selectNextTask(tasks);

      expect(result).not.toBeNull();
      expect(result?.index).toBe(1);
      expect(result?.task.description).toBe("Implement");
    });

    it("should return null if all tasks are complete", () => {
      const tasks: Task[] = [
        {
          category: "setup",
          description: "Setup",
          steps: [],
          passes: true,
        },
        {
          category: "implementation",
          description: "Implement",
          steps: [],
          passes: true,
        },
      ];

      const result = selectNextTask(tasks);

      expect(result).toBeNull();
    });

    it("should return null for empty task array", () => {
      const result = selectNextTask([]);

      expect(result).toBeNull();
    });

    it("should select first task if passes is false (not just !== true)", () => {
      const tasks: Task[] = [
        {
          category: "setup",
          description: "Setup",
          steps: [],
          passes: false,
        },
      ];

      const result = selectNextTask(tasks);

      expect(result).not.toBeNull();
      expect(result?.index).toBe(0);
    });
  });

  describe("markTaskComplete", () => {
    it("should mark the task at given index as complete", () => {
      const tasks: Task[] = [
        {
          category: "setup",
          description: "Setup",
          steps: [],
          passes: false,
        },
        {
          category: "implementation",
          description: "Implement",
          steps: [],
          passes: false,
        },
      ];

      const updated = markTaskComplete(tasks, 0);

      expect(updated[0].passes).toBe(true);
      expect(updated[1].passes).toBe(false);
      // Original should not be mutated
      expect(tasks[0].passes).toBe(false);
    });

    it("should preserve other task properties", () => {
      const tasks: Task[] = [
        {
          category: "setup",
          description: "Setup",
          steps: ["Step 1", "Step 2"],
          passes: false,
          customField: "value",
        },
      ];

      const updated = markTaskComplete(tasks, 0);

      expect(updated[0]).toEqual({
        category: "setup",
        description: "Setup",
        steps: ["Step 1", "Step 2"],
        passes: true,
        customField: "value",
      });
    });

    it("should throw error for invalid index (negative)", () => {
      const tasks: Task[] = [
        {
          category: "setup",
          description: "Setup",
          steps: [],
          passes: false,
        },
      ];

      expect(() => markTaskComplete(tasks, -1)).toThrow("Invalid task index: -1");
    });

    it("should throw error for invalid index (out of bounds)", () => {
      const tasks: Task[] = [
        {
          category: "setup",
          description: "Setup",
          steps: [],
          passes: false,
        },
      ];

      expect(() => markTaskComplete(tasks, 5)).toThrow("Invalid task index: 5");
    });
  });

  describe("buildPromptContent", () => {
    it("should build prompt content with task details", async () => {
      const promptTemplate = `@plan.md @activity.md @tasks.json

The CLI will insert the current task details here when invoking the agent.

## Additional Instructions

Do not edit tasks.json`;

      mockFs.setFile("/test/prompt.md", promptTemplate);

      const task: Task = {
        category: "implementation",
        description: "Implement feature X",
        steps: ["Step 1", "Step 2", "Step 3"],
        passes: false,
      };

      const result = await buildPromptContent("/test", task, 0, mockFs);

      expect(result).toContain("@plan.md @activity.md @tasks.json");
      expect(result).toContain("**Task Index:** 0");
      expect(result).toContain("**Category:** implementation");
      expect(result).toContain("**Description:** Implement feature X");
      expect(result).toContain("1. Step 1");
      expect(result).toContain("2. Step 2");
      expect(result).toContain("3. Step 3");
      expect(result).toContain(JSON.stringify(task, null, 2));
      expect(result).not.toContain("The CLI will insert the current task details here when invoking the agent.");
    });

    it("should use default template if prompt.md does not exist", async () => {
      const task: Task = {
        category: "setup",
        description: "Setup project",
        steps: ["Initialize"],
        passes: false,
      };

      const result = await buildPromptContent("/test", task, 2, mockFs);

      // Should contain elements from PROMPT_JSON_TEMPLATE
      expect(result).toContain("@plan.md @activity.md @tasks.json");
      expect(result).toContain("**Task Index:** 2");
      expect(result).toContain("**Category:** setup");
      expect(result).toContain("<promise>success</promise>");
    });

    it("should format steps as numbered list", async () => {
      mockFs.setFile("/test/prompt.md", "The CLI will insert the current task details here when invoking the agent.");

      const task: Task = {
        category: "test",
        description: "Test",
        steps: ["First", "Second", "Third"],
        passes: false,
      };

      const result = await buildPromptContent("/test", task, 0, mockFs);

      expect(result).toContain("1. First");
      expect(result).toContain("2. Second");
      expect(result).toContain("3. Third");
    });
  });

  describe("saveTasks", () => {
    it("should save tasks with proper JSON formatting and trailing newline", async () => {
      const tasks: Task[] = [
        {
          category: "setup",
          description: "Setup",
          steps: ["Step 1"],
          passes: true,
        },
        {
          category: "implementation",
          description: "Implement",
          steps: ["Step A", "Step B"],
          passes: false,
        },
      ];

      await saveTasks("/test", tasks, mockFs);

      const saved = mockFs.getFile("/test/tasks.json");
      expect(saved).toBeDefined();

      // Check formatting: 2-space indentation
      expect(saved).toContain('  "category": "setup"');
      expect(saved).toContain('  "steps": [');

      // Check trailing newline
      expect(saved?.endsWith("\n")).toBe(true);

      // Verify it's valid JSON
      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(tasks);
    });

    it("should preserve additional fields when saving", async () => {
      const tasks: Task[] = [
        {
          id: "task-1",
          category: "setup",
          description: "Setup",
          steps: [],
          passes: false,
          customField: "value",
        },
      ];

      await saveTasks("/test", tasks, mockFs);

      const saved = mockFs.getFile("/test/tasks.json");
      const parsed = JSON.parse(saved!);

      expect(parsed[0]).toHaveProperty("id", "task-1");
      expect(parsed[0]).toHaveProperty("customField", "value");
    });
  });
});
