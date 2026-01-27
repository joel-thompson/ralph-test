# Project Plan

## Project Overview

Three improvements to the Ralph loop CLI (`ral`):
1. Fix the working directory functionality in the run command
2. Add ESLint for code quality
3. Migrate from npm to bun

---

## Task List

```json
[
  {
    "category": "bugfix",
    "description": "Fix @ file references in prompt to resolve relative to working directory",
    "context": "The prompt contains @plan.md @activity.md which Claude interprets relative to its cwd (project root). We want Claude to stay in project root but have @ references point to the working directory.",
    "steps": [
      "Update ClaudeRunner interface to accept workingDirectory parameter",
      "In DefaultClaudeRunner.runClaude(), transform @ file references in prompt content to include workingDirectory prefix (e.g., @plan.md becomes @features/linting/plan.md)",
      "Update run.ts to pass workingDirectory when calling runner.runClaude()",
      "Update unit tests to verify @ references are transformed correctly (mock needs new signature)",
      "Update README.md with examples showing -w usage for feature development workflow"
    ],
    "files": [
      "src/utils/claude-runner.ts",
      "src/commands/run.ts",
      "src/commands/run.test.ts",
      "README.md"
    ],
    "passes": true
  },
  {
    "category": "setup",
    "description": "Add ESLint with TypeScript support",
    "steps": [
      "Install eslint and @typescript-eslint packages as dev dependencies",
      "Create eslint.config.js with flat config format (ESLint 9+)",
      "Configure rules: recommended TypeScript rules, unused vars as errors, consistent formatting",
      "Add lint script to package.json",
      "Run linter and fix any issues found"
    ],
    "files": [
      "package.json",
      "eslint.config.js (new)"
    ],
    "passes": true
  },
  {
    "category": "migration",
    "description": "Migrate from npm to bun",
    "steps": [
      "Verify bun is installed (bun --version)",
      "Delete package-lock.json",
      "Run bun install to generate bun.lockb",
      "Update package.json scripts if needed (most should work as-is)",
      "Test that build, test, and dev scripts work with bun",
      "Update .gitignore if needed",
      "Update README with bun instructions"
    ],
    "files": [
      "package-lock.json (delete)",
      "bun.lockb (new)",
      "package.json",
      "README.md"
    ],
    "passes": false
  }
]
```

---

## Implementation Notes

### Task 1: Working Directory Fix

The current code flow:
1. `run.ts` validates files exist in `workingDirectory` ✓
2. `run.ts` builds `promptPath` using `workingDirectory` ✓
3. `claude-runner.ts` reads the prompt file from `promptPath` ✓
4. `claude-runner.ts` passes prompt content to Claude, but `@plan.md` references resolve to project root ✗

**Goal:** Keep Claude running in project root (so it can edit source files), but have `@` file references point to the working directory.

**The fix:** Transform `@` references in the prompt content before passing to Claude:

```typescript
// claude-runner.ts
async runClaude(promptPath: string, workingDirectory: string): Promise<ClaudeResponse> {
  let promptContent = await readFile(promptPath, 'utf-8');
  
  // Transform @ file references to include working directory
  // Only transform if working directory is not current directory
  // @plan.md -> @features/linting/plan.md
  if (workingDirectory !== '.' && workingDirectory !== './') {
    promptContent = promptContent.replace(/@(\S+\.md)/g, `@${workingDirectory}/$1`);
  }
  
  const { stdout, stderr } = await execAsync(
    `claude -p "${promptContent.replace(/"/g, '\\"')}" --output-format json`
  );
}
```

**Edge cases to handle:**
- If `workingDirectory` is `.` or `./`, skip transformation (files are already in current directory)
- Regex matches `.md` files only - this covers `plan.md`, `activity.md`, `prompt.md` which are the standard files
- Normalize paths to avoid double slashes (e.g., `features/auth//plan.md`)

**README examples to add:**

```bash
# Feature development workflow - run from project root, point at feature folder
ral scaffold -w features/auth
ral run -w features/auth -m 10

# Multiple features in parallel
ral scaffold -w features/api-v2
ral scaffold -w features/dashboard
ral run -w features/api-v2 -m 5
```

### Task 2: ESLint Setup

Use ESLint 9's flat config format. Reasonable rules for a TypeScript CLI project:
- `@typescript-eslint/recommended` preset
- `no-unused-vars` as error
- `no-console` as off (CLI needs console output)
- `@typescript-eslint/explicit-function-return-types` as warn

### Task 3: npm to bun Migration

Bun is mostly a drop-in replacement for npm:
- `npm install` → `bun install`
- `npm run build` → `bun run build`
- `npm test` → `bun test` (vitest still works)
- `npx` → `bunx`

The main changes are:
1. Lock file format changes (package-lock.json → bun.lockb)
2. Faster installs and script execution
3. Native TypeScript support (though we use tsx/tsc already)
