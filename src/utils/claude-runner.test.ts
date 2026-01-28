import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefaultClaudeRunner } from "./claude-runner.js";
import { readFile } from "fs/promises";
import { spawn } from "child_process";
import { EventEmitter } from "events";

// Mock fs/promises
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}));

// Mock child_process
vi.mock("child_process", () => ({
  spawn: vi.fn(),
}));

function createMockSpawn(jsonResponse: object) {
  const mockProcess = new EventEmitter() as any;
  mockProcess.stdout = new EventEmitter();
  mockProcess.stderr = new EventEmitter();

  vi.mocked(spawn).mockImplementation(() => {
    // Emit the response asynchronously
    setTimeout(() => {
      mockProcess.stdout.emit("data", JSON.stringify(jsonResponse));
      mockProcess.emit("close", 0);
    }, 0);
    return mockProcess;
  });

  return mockProcess;
}

describe("DefaultClaudeRunner", () => {
  let runner: DefaultClaudeRunner;

  beforeEach(() => {
    vi.clearAllMocks();
    runner = new DefaultClaudeRunner();
  });

  describe("@ file reference transformation", () => {
    const validResponse = {
      result: "Success",
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_read_input_tokens: 0,
      },
      total_cost_usd: 0.01,
    };

    it("should transform @ references when working directory is not current directory", async () => {
      const promptContent = "@plan.md @activity.md\n\nSome instructions here.";
      const workingDirectory = "features/auth";

      vi.mocked(readFile).mockResolvedValue(promptContent);
      createMockSpawn(validResponse);

      await runner.runClaude("/path/to/prompt.md", workingDirectory);

      expect(vi.mocked(readFile)).toHaveBeenCalledWith("/path/to/prompt.md", "utf-8");
      expect(vi.mocked(spawn)).toHaveBeenCalledWith(
        "claude",
        ["-p", "@features/auth/plan.md @features/auth/activity.md\n\nSome instructions here.", "--output-format", "json"],
        expect.any(Object)
      );
    });

    it("should not transform @ references when working directory is current directory (.)", async () => {
      const promptContent = "@plan.md @activity.md\n\nSome instructions here.";
      const workingDirectory = ".";

      vi.mocked(readFile).mockResolvedValue(promptContent);
      createMockSpawn(validResponse);

      await runner.runClaude("/path/to/prompt.md", workingDirectory);

      expect(vi.mocked(spawn)).toHaveBeenCalledWith(
        "claude",
        ["-p", "@plan.md @activity.md\n\nSome instructions here.", "--output-format", "json"],
        expect.any(Object)
      );
    });

    it("should not transform @ references when working directory is current directory (./)", async () => {
      const promptContent = "@plan.md @activity.md\n\nSome instructions here.";
      const workingDirectory = "./";

      vi.mocked(readFile).mockResolvedValue(promptContent);
      createMockSpawn(validResponse);

      await runner.runClaude("/path/to/prompt.md", workingDirectory);

      expect(vi.mocked(spawn)).toHaveBeenCalledWith(
        "claude",
        ["-p", "@plan.md @activity.md\n\nSome instructions here.", "--output-format", "json"],
        expect.any(Object)
      );
    });

    it("should normalize working directory by removing trailing slashes", async () => {
      const promptContent = "@plan.md";
      const workingDirectory = "features/auth/";

      vi.mocked(readFile).mockResolvedValue(promptContent);
      createMockSpawn(validResponse);

      await runner.runClaude("/path/to/prompt.md", workingDirectory);

      expect(vi.mocked(spawn)).toHaveBeenCalledWith(
        "claude",
        ["-p", "@features/auth/plan.md", "--output-format", "json"],
        expect.any(Object)
      );
    });

    it("should only transform .md file references", async () => {
      const promptContent = "@plan.md @README.md @config.json";
      const workingDirectory = "features/auth";

      vi.mocked(readFile).mockResolvedValue(promptContent);
      createMockSpawn(validResponse);

      await runner.runClaude("/path/to/prompt.md", workingDirectory);

      // .md files transformed, .json not transformed
      expect(vi.mocked(spawn)).toHaveBeenCalledWith(
        "claude",
        ["-p", "@features/auth/plan.md @features/auth/README.md @config.json", "--output-format", "json"],
        expect.any(Object)
      );
    });
  });
});
