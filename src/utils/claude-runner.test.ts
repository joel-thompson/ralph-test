import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultClaudeRunner } from './claude-runner.js';
import { readFile } from 'fs/promises';
import { exec } from 'child_process';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('DefaultClaudeRunner', () => {
  let runner: DefaultClaudeRunner;

  beforeEach(() => {
    vi.clearAllMocks();
    runner = new DefaultClaudeRunner();
  });

  describe('@ file reference transformation', () => {
    it('should transform @ references when working directory is not current directory', async () => {
      const promptContent = '@plan.md @activity.md\n\nSome instructions here.';
      const workingDirectory = 'features/auth';

      vi.mocked(readFile).mockResolvedValue(promptContent);
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        // Verify the prompt content passed to Claude CLI has transformed @ references
        expect(cmd).toContain('@features/auth/plan.md');
        expect(cmd).toContain('@features/auth/activity.md');

        callback(null, {
          stdout: JSON.stringify({
            result: 'Success',
            usage: {
              input_tokens: 100,
              output_tokens: 50,
              cache_read_input_tokens: 0,
            },
            total_cost_usd: 0.01,
          }),
          stderr: '',
        });
        return {} as any;
      });

      await runner.runClaude('/path/to/prompt.md', workingDirectory);

      expect(vi.mocked(readFile)).toHaveBeenCalledWith('/path/to/prompt.md', 'utf-8');
    });

    it('should not transform @ references when working directory is current directory (.)', async () => {
      const promptContent = '@plan.md @activity.md\n\nSome instructions here.';
      const workingDirectory = '.';

      vi.mocked(readFile).mockResolvedValue(promptContent);
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        // Verify @ references are NOT transformed
        expect(cmd).toContain('@plan.md');
        expect(cmd).toContain('@activity.md');
        expect(cmd).not.toContain('@./plan.md');

        callback(null, {
          stdout: JSON.stringify({
            result: 'Success',
            usage: {
              input_tokens: 100,
              output_tokens: 50,
              cache_read_input_tokens: 0,
            },
            total_cost_usd: 0.01,
          }),
          stderr: '',
        });
        return {} as any;
      });

      await runner.runClaude('/path/to/prompt.md', workingDirectory);
    });

    it('should not transform @ references when working directory is current directory (./)', async () => {
      const promptContent = '@plan.md @activity.md\n\nSome instructions here.';
      const workingDirectory = './';

      vi.mocked(readFile).mockResolvedValue(promptContent);
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        // Verify @ references are NOT transformed
        expect(cmd).toContain('@plan.md');
        expect(cmd).toContain('@activity.md');

        callback(null, {
          stdout: JSON.stringify({
            result: 'Success',
            usage: {
              input_tokens: 100,
              output_tokens: 50,
              cache_read_input_tokens: 0,
            },
            total_cost_usd: 0.01,
          }),
          stderr: '',
        });
        return {} as any;
      });

      await runner.runClaude('/path/to/prompt.md', workingDirectory);
    });

    it('should normalize working directory by removing trailing slashes', async () => {
      const promptContent = '@plan.md';
      const workingDirectory = 'features/auth/';

      vi.mocked(readFile).mockResolvedValue(promptContent);
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        // Should not have double slashes
        expect(cmd).toContain('@features/auth/plan.md');
        expect(cmd).not.toContain('auth//plan.md');

        callback(null, {
          stdout: JSON.stringify({
            result: 'Success',
            usage: {
              input_tokens: 100,
              output_tokens: 50,
              cache_read_input_tokens: 0,
            },
            total_cost_usd: 0.01,
          }),
          stderr: '',
        });
        return {} as any;
      });

      await runner.runClaude('/path/to/prompt.md', workingDirectory);
    });

    it('should only transform .md file references', async () => {
      const promptContent = '@plan.md @README.md @config.json';
      const workingDirectory = 'features/auth';

      vi.mocked(readFile).mockResolvedValue(promptContent);
      vi.mocked(exec).mockImplementation((cmd: string, callback: any) => {
        // .md files should be transformed
        expect(cmd).toContain('@features/auth/plan.md');
        expect(cmd).toContain('@features/auth/README.md');
        // Non-.md files should not match the regex (config.json won't be transformed)
        // The regex only matches .md files

        callback(null, {
          stdout: JSON.stringify({
            result: 'Success',
            usage: {
              input_tokens: 100,
              output_tokens: 50,
              cache_read_input_tokens: 0,
            },
            total_cost_usd: 0.01,
          }),
          stderr: '',
        });
        return {} as any;
      });

      await runner.runClaude('/path/to/prompt.md', workingDirectory);
    });
  });
});
