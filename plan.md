# Project Plan

## Project Overview

Ralph loop CLI (`ral`) written in TypeScript using Commander library. See @spec.md for full specification.

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Initialize TypeScript CLI project",
    "steps": [
      "Initialize package.json with TypeScript support",
      "Install commander, typescript, and required dependencies",
      "Install vitest for unit testing",
      "Configure tsconfig.json for CLI output",
      "Create project directory structure (src/commands/, src/utils/, src/templates/)",
      "Set up bin entry point for 'ral' command",
      "Create src/index.ts main entry point with Commander setup",
      "Configure build and test scripts",
      "Configure package.json for npm publishing (name, version, files, bin)",
      "Verify CLI builds and runs (npx tsx src/index.ts --help)"
    ],
    "passes": false
  },
  {
    "category": "infrastructure",
    "description": "Create shared utilities and patterns",
    "steps": [
      "Create src/utils/file-helpers.ts for file operations (writeFileIfNotExists, ensureDirectory)",
      "Create src/utils/validation.ts for input validation (validateWorkingDirectory, validateRequiredFiles)",
      "Create src/utils/errors.ts for consistent error handling and messaging",
      "Implement dependency injection pattern for testability (FileSystem interface)",
      "Write unit tests for utility functions"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement create-settings command",
    "steps": [
      "Create src/templates/index.ts for all templates",
      "Define CLAUDE_SETTINGS_TEMPLATE as TypeScript object (JSON.stringify when writing)",
      "Define MCP_SETTINGS_TEMPLATE as TypeScript object (JSON.stringify when writing)",
      "Create src/commands/create-settings.ts handler",
      "Implement -w flag for working directory (default to cwd)",
      "Generate .claude/settings.json from template object",
      "Generate .mcp.json from template object",
      "Implement -f flag for overwrite behavior",
      "Skip existing files when -f is not set (log skipped files)",
      "Register command in src/index.ts",
      "Write unit tests for create-settings logic",
      "Integration test: run CLI, verify files created, cleanup"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement scaffold command",
    "steps": [
      "Add ACTIVITY_TEMPLATE as template string to src/templates/index.ts",
      "Add PLAN_TEMPLATE as template string to src/templates/index.ts",
      "Add PROMPT_TEMPLATE as template string to src/templates/index.ts",
      "Create src/commands/scaffold.ts handler",
      "Implement -w flag for working directory (default to cwd)",
      "Implement -f flag for overwrite behavior",
      "Generate activity.md from template string",
      "Generate plan.md from template string",
      "Generate prompt.md from template string",
      "Create screenshots/ folder",
      "Skip existing files when -f is not set (log skipped files)",
      "Register command in src/index.ts",
      "Write unit tests for scaffold logic",
      "Integration test: run CLI, verify files created, cleanup"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement run command",
    "steps": [
      "Create src/commands/run.ts handler",
      "Implement -w flag for working directory (default to cwd)",
      "Implement -m flag for max iterations (required)",
      "Create src/utils/claude-runner.ts wrapper (calls: claude -p <prompt> --output-format json)",
      "Validate required files exist (plan.md, prompt.md, activity.md)",
      "Abort with helpful message if files missing (suggest running ral scaffold)",
      "Parse JSON response: result, usage.input_tokens, usage.output_tokens, usage.cache_read_input_tokens, total_cost_usd",
      "Handle invalid JSON or Claude CLI errors gracefully",
      "Implement loop with iteration tracking and cumulative token/cost totals",
      "Check for <promise>COMPLETE</promise> in response to exit early (exit 0)",
      "Print per-iteration and cumulative stats (tokens, cost)",
      "Exit 1 if max iterations reached without completion",
      "Register command in src/index.ts",
      "Write unit tests with mocked Claude runner"
    ],
    "passes": false
  },
  {
    "category": "documentation",
    "description": "Create CLI documentation",
    "steps": [
      "Create README.md with CLI usage instructions",
      "Document all commands and their flags",
      "Include example usage for each command",
      "Add installation and setup instructions"
    ],
    "passes": false
  }
]
```
