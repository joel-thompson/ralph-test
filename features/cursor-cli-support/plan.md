# Project Plan

## Project Overview

Add Cursor CLI (`agent`) support to the `run` command as an alternative to Claude CLI. Configuration will be managed via a `ral.json` file in the working directory, allowing users to select between Claude and Cursor runners and configure the model for Cursor.

Default model for Cursor: `composer-1`

---

## Task List

IMPORTANT: Only work on one task! Exit the session after finishing a single task!

```json
[
  {
    "category": "refactor",
    "description": "Generalize runner interfaces for multi-backend support",
    "steps": [
      "In src/utils/claude-runner.ts, rename ClaudeUsage → AgentUsage",
      "Rename ClaudeResponse → AgentResponse",
      "Add optional duration_ms?: number field to AgentResponse",
      "Rename ClaudeRunner interface → AgentRunner",
      "Keep DefaultClaudeRunner class name unchanged (it specifically runs Claude)",
      "Update all imports in run.ts and run.test.ts to use new names",
      "Run tests to verify refactor didn't break anything"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Create config loading system for ral.json",
    "steps": [
      "Create src/utils/config.ts with RalConfig interface: { runner: 'claude' | 'cursor', model?: string }",
      "Implement loadConfig(workingDirectory: string) function that reads ral.json",
      "Return default config { runner: 'claude' } if file doesn't exist",
      "Validate config structure and throw CommandError for invalid configs",
      "Add CONFIG_TEMPLATE to src/templates/index.ts for scaffold command (optional)",
      "Write unit tests in src/utils/config.test.ts"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement CursorRunner class",
    "steps": [
      "Add CursorRunner class to src/utils/claude-runner.ts implementing AgentRunner interface",
      "Constructor takes model parameter (default: 'composer-1')",
      "Implement run method: spawn 'agent' with args [-p, --force, --output-format, json, --model, <model>, prompt]",
      "Handle @ file reference transformation same as DefaultClaudeRunner (extract to shared function)",
      "Parse JSON response: extract 'result' field, set usage/cost to 0 (not provided by Cursor)",
      "Check is_error and subtype fields for error handling",
      "Write unit tests in src/utils/claude-runner.test.ts for CursorRunner"
    ],
    "passes": true
  },
  {
    "category": "integration",
    "description": "Update run command to support config-based runner selection",
    "steps": [
      "Import loadConfig in src/commands/run.ts",
      "Load config at start of run function before validation",
      "Select runner based on config.runner value",
      "Pass config.model to CursorRunner constructor when runner is 'cursor'",
      "Update stats display: skip token/cost output when values are 0 (Cursor mode)",
      "Optionally show duration_ms for Cursor runs instead",
      "Update run.test.ts with tests for runner selection based on config"
    ],
    "passes": true
  },
  {
    "category": "testing",
    "description": "Unit testing with mocks (DO NOT call run command directly)",
    "steps": [
      "All CursorRunner tests must mock spawn - do not call actual 'agent' CLI",
      "All config loading tests must mock fs - do not read actual files",
      "Test runner selection logic with mocked runners",
      "Verify Cursor CLI args are correct by inspecting mock spawn calls",
      "Test fallback to Claude when no ral.json exists (mocked)",
      "Test with invalid ral.json to verify error handling (mocked)"
    ],
    "passes": true
  },
  {
    "category": "refactor",
    "description": "Separate runner implementations into distinct files",
    "steps": [
      "Create src/utils/cursor-runner.ts with CursorRunner class and transformFileReferences helper",
      "Keep DefaultClaudeRunner in src/utils/claude-runner.ts",
      "Export shared transformFileReferences from claude-runner.ts (or create shared utils file)",
      "Create src/utils/cursor-runner.test.ts with CursorRunner tests (move from claude-runner.test.ts)",
      "Update imports in run.ts to import CursorRunner from new file",
      "Run tests to verify refactor didn't break anything"
    ],
    "passes": true
  },
  {
    "category": "documentation",
    "description": "Update documentation for Cursor CLI support",
    "steps": [
      "Document ral.json config options in README.md",
      "Add example ral.json configurations for both Claude and Cursor runners",
      "Document Cursor CLI requirements and model options",
      "Update any existing examples that reference runner configuration"
    ],
    "passes": true
  },
  {
    "category": "testing",
    "description": "Smoke test: create a poem file",
    "steps": [
      "Create a file called poem.md in the working directory",
      "Write a short poem about yourself (the AI agent/model running this task)",
      "The poem should reflect on what it's like to be an AI assistant"
    ],
    "passes": true
  },
  {
    "category": "testing",
    "description": "Smoke test: create a signed haiku file",
    "steps": [
      "Create a file called haiku.md in the working directory",
      "Write a haiku about being an AI assistant",
      "IMPORTANT: Include your model name (e.g. claude-3.5-sonnet, composer-1, etc.) somewhere in the file",
      "Sign it with the model name at the bottom"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Support ral.json in root directory with cascading lookup",
    "steps": [
      "Update loadConfig signature to accept optional rootDirectory parameter: loadConfig(workingDirectory: string, rootDirectory?: string)",
      "Implement cascading lookup: try workingDirectory first, if ENOENT and rootDirectory provided, try rootDirectory",
      "If both directories' configs don't exist, return default config",
      "Update src/commands/run.ts to pass process.cwd() as rootDirectory when calling loadConfig",
      "Add tests in config.test.ts for cascading behavior: working dir takes precedence over root",
      "Add test: root dir config used when working dir has no ral.json",
      "Add test: default config returned when neither directory has ral.json",
      "Run pnpm test to verify all tests pass"
    ],
    "passes": true
  },
  {
    "category": "testing",
    "description": "Smoke test: write a poem about being an agent",
    "steps": [
      "Create a file called agent-poem.md in the features/cursor-cli-support/ folder",
      "Write a poem that reflects on what it's like being an AI agent",
      "The poem should explore themes of autonomy, task execution, and collaboration with humans",
      "IMPORTANT: Include a note at the top or bottom of the file stating which model wrote this poem (e.g. claude-3.5-sonnet, composer-1, gpt-4, etc.)"
    ],
    "passes": true
  },
  {
    "category": "testing",
    "description": "Smoke test: write a 10 sentence journal entry",
    "steps": [
      "Create a file called journal-entry.md in the features/cursor-cli-support/ folder",
      "Write a short journal entry consisting of exactly 10 sentences",
      "The journal entry should be written from the perspective of an AI assistant reflecting on a day of work",
      "IMPORTANT: Include a note at the top or bottom of the file stating which model wrote this entry (e.g. claude-3.5-sonnet, composer-1, gpt-4, etc.)"
    ],
    "passes": false
  }
]
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      run command                             │
│  1. Load ral.json config                                     │
│  2. Select runner based on config.runner                     │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │ DefaultClaude   │         │  CursorRunner   │
    │ Runner          │         │  (model config) │
    └─────────────────┘         └─────────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
                  ┌─────────────────┐
                  │  AgentRunner    │
                  │  interface      │
                  │                 │
                  │  AgentResponse  │
                  │  - result       │
                  │  - usage (0s    │
                  │    for Cursor)  │
                  │  - total_cost   │
                  │  - duration_ms? │
                  └─────────────────┘
```

---

## Config File Format

`ral.json` can be placed in:
1. **Working directory (feature folder)** - takes precedence
2. **Root directory (CLI invocation directory)** - fallback

This allows project-wide defaults in the root with per-feature overrides.

```json
{
  "runner": "cursor",
  "model": "composer-1"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `runner` | `"claude"` \| `"cursor"` | `"claude"` | Which CLI to use |
| `model` | `string` | `"composer-1"` | Model for Cursor (ignored for Claude) |

**Lookup order:**
1. `{workingDirectory}/ral.json` (e.g., `./features/my-feature/ral.json`)
2. `{rootDirectory}/ral.json` (e.g., `./ral.json` where CLI is invoked)
3. Default config if neither exists

---

## Important: Testing Approach

**DO NOT test by calling the `run` command directly.** This can cause hanging or infinite loops.

All testing must use unit tests with mocked dependencies:
- Mock `spawn` for CLI calls (both Claude and Cursor)
- Mock `fs` for config file reading
- Mock the runner interface for run command tests

---

## Key Implementation Notes

### CursorRunner CLI invocation
```bash
agent -p --force --output-format json --model composer-1 "<prompt>"
```

Note: `--force` flag allows commands without prompting.

### Cursor CLI JSON Response Format (confirmed)

```json
{
  "type": "result",
  "subtype": "success",
  "is_error": false,
  "duration_ms": 2525,
  "duration_api_ms": 2525,
  "result": "Response text here...",
  "session_id": "uuid",
  "request_id": "uuid"
}
```

**Key differences from Claude CLI:**
- `result` field exists (same as Claude) ✓
- **No token usage info** (input_tokens, output_tokens, cache_read_input_tokens)
- **No cost info** (total_cost_usd)
- Has `duration_ms` instead (can display this)

### Stats display for Cursor runner

Since Cursor doesn't provide token/cost data, the run loop should:
- Skip token/cost output when using Cursor runner
- Optionally show `duration_ms` instead
- Or: AgentResponse allows nullable usage/cost fields, run.ts checks before displaying

### @ file reference handling
Both runners need to transform `@plan.md` → `@workingDirectory/plan.md` when working directory is not current directory. This logic exists in DefaultClaudeRunner and should be shared or duplicated in CursorRunner.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/claude-runner.ts` | Rename interfaces, keep DefaultClaudeRunner, export shared helpers |
| `src/utils/claude-runner.test.ts` | Tests for DefaultClaudeRunner only |
| `src/utils/cursor-runner.ts` | New file for CursorRunner class |
| `src/utils/cursor-runner.test.ts` | New file for CursorRunner tests |
| `src/utils/config.ts` | Config loading with cascading lookup (workingDir → rootDir → default) |
| `src/utils/config.test.ts` | Tests for config loading including cascading behavior |
| `src/commands/run.ts` | Load config, select runner, pass process.cwd() as rootDirectory |
| `src/commands/run.test.ts` | Test runner selection |
| `src/templates/index.ts` | Optional: add config template |
| `README.md` | Document ral.json config options, Cursor CLI support, and lookup order |
