# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ralph Loop CLI (`ral`) is a TypeScript CLI tool for AI-assisted development loops where Claude or Cursor iteratively works through a structured plan until completion. The tool supports two workflows:

1. **Markdown Workflow**: Tasks embedded in plan.md with AI-controlled completion
2. **JSON Workflow**: Tasks in separate tasks.json with CLI-controlled completion via `<promise>success</promise>` tags

## Development Commands

### Setup
```bash
pnpm install          # Install dependencies
pnpm build            # Compile TypeScript to dist/
pnpm link --global    # Make `ral` command available globally
```

### Testing
```bash
pnpm test             # Run all tests with Vitest
pnpm run test:run     # Run tests once without watch mode
```

### Linting
```bash
pnpm run lint         # Run ESLint on source files
pnpm run lint:fix     # Auto-fix linting issues
pnpm run typecheck    # Run TypeScript compiler without emitting files
```

### Development
```bash
pnpm run dev scaffold              # Run in dev mode
pnpm run dev run -m 10             # Dev mode with args
```

## Architecture

### Entry Point & Commands
- **src/index.ts**: CLI entry point using Commander.js. Registers all commands (scaffold, scaffold-json, run, run-json, create-settings).
- **src/commands/**: Command implementations. Each command validates inputs, loads config, and orchestrates the workflow.

### Core Workflows

**Markdown Workflow** (`run` command):
- Loads `plan.md`, `prompt.md`, `activity.md` from working directory
- AI reads plan.md, finds first task with `passes: false`
- AI completes task, verifies it, updates activity.md, sets `passes: true`, makes git commit
- Continues until all tasks complete or max iterations reached

**JSON Workflow** (`run-json` command):
- Loads `tasks.json`, `plan.md` (details only), `prompt.md`, `activity.md`
- Selects next incomplete task (via first-incomplete or smart selection)
- Injects task into prompt dynamically, calls AI runner
- Only marks task complete when AI outputs `<promise>success</promise>`
- Persists updated tasks.json after each successful completion

### Task Selection Strategies
- **first-incomplete** (default): Selects first task where `passes !== true`
- **smart**: Calls AI runner with all incomplete tasks to choose best next task based on dependencies and logical ordering. Falls back to first-incomplete if smart selection fails.

### Runner Abstraction
- **src/utils/claude-runner.ts**: Default runner using `claude` CLI. Returns token usage and cost.
- **src/utils/cursor-runner.ts**: Alternative runner using Cursor's `agent` CLI. Returns duration but no token/cost data.
- **AgentRunner interface**: `runAgent(options) => AgentResponse` with usage/cost/duration data.

### Configuration System
- **src/utils/config.ts**: Loads `ral.json` from working directory or project root
- Config schema: `{ runner: "claude"|"cursor", model?: string, taskSelection?: "first-incomplete"|"smart" }`
- Falls back to default config (claude runner, first-incomplete selection) if no ral.json found

### File Helpers & Validation
- **src/utils/file-helpers.ts**: FileSystem abstraction (DefaultFileSystem) for reads/writes. Enables dependency injection in tests.
- **src/utils/validation.ts**: Validates working directory exists and required files are present.

### Templates
- **src/templates/index.ts**: Template strings for scaffolding (activity.md, plan.md, prompt.md, tasks.json, ral.json).
- Includes `PROMPT_TASK_PLACEHOLDER` for dynamic task injection in JSON workflow.

### Error Handling
- **src/utils/errors.ts**: Custom `CommandError` class for user-facing errors vs system errors.

## Key Implementation Patterns

### Cost Tracking
Claude runner tracks tokens and cost per iteration (input, output, cache read tokens). Cumulative stats displayed after each attempt. Cursor runner only tracks duration.

## Code Style Guidelines

### Avoid Magic Strings and Numbers
From AGENTS.md: Use named constants instead of hard-coded literals.

**Bad:**
```ts
if (user.status === "active") {
  setTimeout(logout, 3000);
}
```

**Good:**
```ts
const USER_STATUS_ACTIVE = "active";
const LOGOUT_TIMEOUT_MS = 3000;

if (user.status === USER_STATUS_ACTIVE) {
  setTimeout(logout, LOGOUT_TIMEOUT_MS);
}
```

**Better (for related values):**
```ts
const USER_STATUSES = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
});
```

Exceptions: Standard API usage, HTTP status codes in short scripts, loop counters like `for (let i = 0; ...)`.

## Package Management

Use **pnpm** for all package operations (not npm or yarn).

## TypeScript Configuration

- Target: ES2022
- Module: ES2022 (ESM)
- Strict mode enabled
- Output: dist/
- Source maps and declarations generated

## Testing Philosophy

Tests validate:
- Command input validation and error messages
- Task loading, selection, and completion logic
- Config loading with fallback behavior
- File reference transformations
- Runner response parsing and usage tracking
- Smart selection prompt building and validation

Use FileSystem abstraction to avoid actual file I/O in tests.
