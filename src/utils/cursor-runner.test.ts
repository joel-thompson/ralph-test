import { describe, it, expect, vi, beforeEach } from "vitest";
import { CursorRunner } from "./cursor-runner.js";
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

describe("CursorRunner", () => {
  let runner: CursorRunner;

  beforeEach(() => {
    vi.clearAllMocks();
    runner = new CursorRunner();
  });

  it("should spawn agent with correct arguments", async () => {
    const promptContent = "Test prompt";
    const validResponse = {
      type: "result",
      subtype: "success",
      is_error: false,
      duration_ms: 2525,
      result: "Success",
    };

    vi.mocked(readFile).mockResolvedValue(promptContent);
    createMockSpawn(validResponse);

    await runner.runClaude("/path/to/prompt.md", ".");

    expect(vi.mocked(spawn)).toHaveBeenCalledWith(
      "agent",
      ["-p", "--force", "--output-format", "json", "--model", "composer-1", promptContent],
      expect.any(Object)
    );
  });

  it("should use custom model when provided", async () => {
    const customRunner = new CursorRunner("custom-model");
    const promptContent = "Test prompt";
    const validResponse = {
      result: "Success",
      is_error: false,
      duration_ms: 1000,
    };

    vi.mocked(readFile).mockResolvedValue(promptContent);
    createMockSpawn(validResponse);

    await customRunner.runClaude("/path/to/prompt.md", ".");

    expect(vi.mocked(spawn)).toHaveBeenCalledWith(
      "agent",
      ["-p", "--force", "--output-format", "json", "--model", "custom-model", promptContent],
      expect.any(Object)
    );
  });

  it("should return response with zero usage and cost", async () => {
    const promptContent = "Test prompt";
    const validResponse = {
      result: "Success response",
      is_error: false,
      duration_ms: 2525,
    };

    vi.mocked(readFile).mockResolvedValue(promptContent);
    createMockSpawn(validResponse);

    const response = await runner.runClaude("/path/to/prompt.md", ".");

    expect(response).toEqual({
      result: "Success response",
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        cache_read_input_tokens: 0,
      },
      total_cost_usd: 0,
      duration_ms: 2525,
    });
  });

  it("should transform @ file references when working directory is not current", async () => {
    const promptContent = "@plan.md @activity.md";
    const validResponse = {
      result: "Success",
      is_error: false,
    };

    vi.mocked(readFile).mockResolvedValue(promptContent);
    createMockSpawn(validResponse);

    await runner.runClaude("/path/to/prompt.md", "features/auth");

    expect(vi.mocked(spawn)).toHaveBeenCalledWith(
      "agent",
      [
        "-p",
        "--force",
        "--output-format",
        "json",
        "--model",
        "composer-1",
        "@features/auth/plan.md @features/auth/activity.md",
      ],
      expect.any(Object)
    );
  });

  it("should reject when is_error is true", async () => {
    const promptContent = "Test prompt";
    const errorResponse = {
      is_error: true,
      subtype: "validation_error",
      result: "Invalid input provided",
    };

    vi.mocked(readFile).mockResolvedValue(promptContent);
    createMockSpawn(errorResponse);

    await expect(runner.runClaude("/path/to/prompt.md", ".")).rejects.toThrow(
      "Cursor agent CLI error (validation_error): Invalid input provided"
    );
  });

  it("should reject when response has no result field", async () => {
    const promptContent = "Test prompt";
    const invalidResponse = {
      is_error: false,
    };

    vi.mocked(readFile).mockResolvedValue(promptContent);
    createMockSpawn(invalidResponse);

    await expect(runner.runClaude("/path/to/prompt.md", ".")).rejects.toThrow(
      "Invalid Cursor agent CLI response format"
    );
  });

  it("should reject on JSON parse error", async () => {
    const promptContent = "Test prompt";

    vi.mocked(readFile).mockResolvedValue(promptContent);

    const mockProcess = new EventEmitter() as any;
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();

    vi.mocked(spawn).mockImplementation(() => {
      setTimeout(() => {
        mockProcess.stdout.emit("data", "{ invalid json }");
        mockProcess.emit("close", 0);
      }, 0);
      return mockProcess;
    });

    await expect(runner.runClaude("/path/to/prompt.md", ".")).rejects.toThrow(
      "Failed to parse Cursor agent CLI response as JSON"
    );
  });
});
