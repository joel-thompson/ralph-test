import { describe, it, expect } from "vitest";
import { executeShell } from "./shell.js";

describe("executeShell", () => {
  it("should execute a simple command successfully", async () => {
    const result = await executeShell("echo", ["hello"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("hello");
    expect(result.stderr).toBe("");
  });

  it("should capture stderr", async () => {
    // Use a command that writes to stderr
    const result = await executeShell("node", [
      "-e",
      "console.error('error message')",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("error message");
  });

  it("should return non-zero exit code on command failure", async () => {
    const result = await executeShell("node", ["-e", "process.exit(1)"]);

    expect(result.exitCode).toBe(1);
  });

  it("should use the specified working directory", async () => {
    const result = await executeShell("pwd", [], { cwd: "/" });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("/");
  });

  it("should timeout long-running commands", async () => {
    await expect(
      executeShell("sleep", ["10"], { timeout: 100 })
    ).rejects.toThrow("Command timed out after 100ms");
  });

  it("should reject when command does not exist", async () => {
    await expect(
      executeShell("nonexistentcommand123456", [])
    ).rejects.toThrow();
  });
});
