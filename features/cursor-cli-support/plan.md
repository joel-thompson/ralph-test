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
      "Test with invalid ral.json to verify error handling (mocked)",
      "Document the ral.json config options in README if appropriate"
    ],
    "passes": true
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

`ral.json` in working directory:

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
| `src/utils/claude-runner.ts` | Rename interfaces, add CursorRunner class |
| `src/utils/claude-runner.test.ts` | Add CursorRunner tests |
| `src/utils/config.ts` | New file for config loading |
| `src/utils/config.test.ts` | New file for config tests |
| `src/commands/run.ts` | Load config, select runner |
| `src/commands/run.test.ts` | Test runner selection |
| `src/templates/index.ts` | Optional: add config template |
