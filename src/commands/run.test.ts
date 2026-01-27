import { describe, it, expect, beforeEach, vi } from "vitest";
import { run } from "./run.js";
import { ClaudeRunner, ClaudeResponse } from "../utils/claude-runner.js";
import { CommandError } from "../utils/errors.js";
import * as validation from "../utils/validation.js";
import * as path from "path";

// Mock validation module
vi.mock("../utils/validation.js", () => ({
  validateWorkingDirectory: vi.fn(),
  validateRequiredFiles: vi.fn(),
}));

// Mock process.exit to throw a predictable error
const mockExit = vi
  .spyOn(process, "exit")
  .mockImplementation((code?: string | number | null | undefined) => {
    throw new Error(`process.exit(${code})`);
  }) as any;

describe("run command", () => {
  const testDir = "/test/dir";

  beforeEach(() => {
    vi.clearAllMocks();
    mockExit.mockClear();
  });

  it("should validate working directory exists", async () => {
    vi.mocked(validation.validateWorkingDirectory).mockRejectedValue(
      new Error("Working directory does not exist")
    );

    await expect(
      run({
        workingDirectory: testDir,
        maxIterations: 5,
      })
    ).rejects.toThrow();
  });

  it("should validate required files exist", async () => {
    vi.mocked(validation.validateWorkingDirectory).mockResolvedValue();
    vi.mocked(validation.validateRequiredFiles).mockResolvedValue({
      valid: false,
      missing: ["plan.md", "prompt.md"],
    });

    await expect(
      run({
        workingDirectory: testDir,
        maxIterations: 5,
      })
    ).rejects.toThrow(CommandError);
  });

  it("should run loop and exit with code 0 when COMPLETE is found", async () => {
    // Mock validation
    vi.mocked(validation.validateWorkingDirectory).mockResolvedValue();
    vi.mocked(validation.validateRequiredFiles).mockResolvedValue({
      valid: true,
      missing: [],
    });

    // Mock Claude runner
    const mockRunner: ClaudeRunner = {
      runClaude: vi.fn().mockResolvedValue({
        result: "Task is done. <promise>COMPLETE</promise>",
        usage: {
          input_tokens: 1000,
          output_tokens: 500,
          cache_read_input_tokens: 200,
        },
        total_cost_usd: 0.05,
      } as ClaudeResponse),
    };

    // Should exit with code 0
    await expect(
      run(
        {
          workingDirectory: testDir,
          maxIterations: 5,
        },
        mockRunner
      )
    ).rejects.toThrow(CommandError);

    // Verify process.exit was called with 0
    expect(mockExit).toHaveBeenCalledWith(0);

    // Verify Claude runner was called once
    expect(mockRunner.runClaude).toHaveBeenCalledTimes(1);
    expect(mockRunner.runClaude).toHaveBeenCalledWith(
      path.join(testDir, "prompt.md"),
      testDir
    );
  });

  it("should run loop and exit with code 1 when max iterations reached", async () => {
    // Mock validation
    vi.mocked(validation.validateWorkingDirectory).mockResolvedValue();
    vi.mocked(validation.validateRequiredFiles).mockResolvedValue({
      valid: true,
      missing: [],
    });

    // Mock Claude runner (never returns COMPLETE)
    const mockRunner: ClaudeRunner = {
      runClaude: vi.fn().mockResolvedValue({
        result: "Still working on it...",
        usage: {
          input_tokens: 1000,
          output_tokens: 500,
          cache_read_input_tokens: 200,
        },
        total_cost_usd: 0.05,
      } as ClaudeResponse),
    };

    // Should exit with code 1 after max iterations
    await expect(
      run(
        {
          workingDirectory: testDir,
          maxIterations: 3,
        },
        mockRunner
      )
    ).rejects.toThrow();

    // Verify process.exit was called with 1
    expect(mockExit).toHaveBeenCalledWith(1);

    // Verify Claude runner was called 3 times
    expect(mockRunner.runClaude).toHaveBeenCalledTimes(3);
  });

  it("should track cumulative stats across iterations", async () => {
    // Mock validation
    vi.mocked(validation.validateWorkingDirectory).mockResolvedValue();
    vi.mocked(validation.validateRequiredFiles).mockResolvedValue({
      valid: true,
      missing: [],
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Mock Claude runner with different stats for each iteration
    let callCount = 0;
    const mockRunner: ClaudeRunner = {
      runClaude: vi.fn().mockImplementation(async () => {
        callCount++;
        return {
          result: "Working...",
          usage: {
            input_tokens: 1000 * callCount,
            output_tokens: 500 * callCount,
            cache_read_input_tokens: 200 * callCount,
          },
          total_cost_usd: 0.05 * callCount,
        } as ClaudeResponse;
      }),
    };

    // Run for 2 iterations
    await expect(
      run(
        {
          workingDirectory: testDir,
          maxIterations: 2,
        },
        mockRunner
      )
    ).rejects.toThrow();

    // Verify process.exit was called with 1
    expect(mockExit).toHaveBeenCalledWith(1);

    // Verify cumulative stats were logged
    const logs = consoleSpy.mock.calls.map((call) => call[0]);

    // After iteration 1: cumulative should be 1000, 500, 200, $0.05
    expect(logs).toContain("Total Tokens In: 1000");
    expect(logs).toContain("Total Tokens Out: 500");
    expect(logs).toContain("Total Cache Read: 200");
    expect(logs).toContain("Total Cost: $0.0500");

    // After iteration 2: cumulative should be 3000, 1500, 600, $0.15
    expect(logs).toContain("Total Tokens In: 3000");
    expect(logs).toContain("Total Tokens Out: 1500");
    expect(logs).toContain("Total Cache Read: 600");
    expect(logs).toContain("Total Cost: $0.1500");

    consoleSpy.mockRestore();
  });

  it("should handle Claude CLI errors gracefully", async () => {
    // Mock validation
    vi.mocked(validation.validateWorkingDirectory).mockResolvedValue();
    vi.mocked(validation.validateRequiredFiles).mockResolvedValue({
      valid: true,
      missing: [],
    });

    // Mock Claude runner that throws an error
    const mockRunner: ClaudeRunner = {
      runClaude: vi.fn().mockRejectedValue(new Error("Claude CLI failed")),
    };

    await expect(
      run(
        {
          workingDirectory: testDir,
          maxIterations: 5,
        },
        mockRunner
      )
    ).rejects.toThrow(CommandError);
  });

  it("should complete early if COMPLETE is found in later iteration", async () => {
    // Mock validation
    vi.mocked(validation.validateWorkingDirectory).mockResolvedValue();
    vi.mocked(validation.validateRequiredFiles).mockResolvedValue({
      valid: true,
      missing: [],
    });

    // Mock Claude runner that returns COMPLETE on 3rd iteration
    let callCount = 0;
    const mockRunner: ClaudeRunner = {
      runClaude: vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 3) {
          return {
            result: "All done! <promise>COMPLETE</promise>",
            usage: {
              input_tokens: 1000,
              output_tokens: 500,
              cache_read_input_tokens: 200,
            },
            total_cost_usd: 0.05,
          } as ClaudeResponse;
        }
        return {
          result: "Still working...",
          usage: {
            input_tokens: 1000,
            output_tokens: 500,
            cache_read_input_tokens: 200,
          },
          total_cost_usd: 0.05,
        } as ClaudeResponse;
      }),
    };

    // Should exit with code 0 after 3 iterations (not 5)
    await expect(
      run(
        {
          workingDirectory: testDir,
          maxIterations: 5,
        },
        mockRunner
      )
    ).rejects.toThrow(CommandError);

    // Verify process.exit was called with 0
    expect(mockExit).toHaveBeenCalledWith(0);

    // Verify Claude runner was called exactly 3 times
    expect(mockRunner.runClaude).toHaveBeenCalledTimes(3);
  });
});
