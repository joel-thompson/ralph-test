import { spawn } from "child_process";

export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface ShellOptions {
  cwd?: string;
  timeout?: number;
}

/**
 * Execute a shell command and return stdout, stderr, and exit code.
 * This function is designed for bounded execution (non-blocking, with timeout).
 */
export async function executeShell(
  command: string,
  args: string[],
  options: ShellOptions = {}
): Promise<ShellResult> {
  return new Promise((resolve, reject) => {
    const { cwd, timeout = 30000 } = options;

    const child = spawn(command, args, {
      cwd,
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeoutId = globalThis.setTimeout(() => {
      timedOut = true;
      child.kill();
      reject(new Error(`Command timed out after ${timeout}ms`));
    }, timeout);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      globalThis.clearTimeout(timeoutId);
      reject(error);
    });

    child.on("close", (code) => {
      globalThis.clearTimeout(timeoutId);
      if (!timedOut) {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code ?? 1,
        });
      }
    });
  });
}
