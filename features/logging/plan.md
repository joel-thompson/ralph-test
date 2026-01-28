# Project Plan

## Project Overview

@spec

Add improved logging to the CLI, specifically around config (ral.json) usage and outcomes. Users should be able to see:
- Which config file was loaded (working directory, root directory, or default)
- What config values are being used (runner type, model)
- The outcome of that config (which runner was selected)

---

## Investigation Summary

After investigating the codebase:

1. **Config Loading**: The `loadConfig` function in `src/utils/config.ts` has a fallback chain:
   - First tries `{workingDirectory}/ral.json`
   - Falls back to `{rootDirectory}/ral.json` if working directory config doesn't exist
   - Falls back to default config (`{runner: "claude"}`) if neither exists
   - Currently, this resolution path is silent

2. **Config Usage**: In `src/commands/run.ts`:
   - Config is loaded at line 42: `const config = await loadConfig(workingDirectory, process.cwd())`
   - Runner is selected based on `config.runner` (cursor vs claude)
   - Model is passed to `CursorRunner` if specified
   - None of this is logged to the user

3. **Current Logging**: The run command only logs:
   - Iteration numbers
   - Token usage and costs (for Claude runner)
   - Duration (for Cursor runner)
   - Completion status

4. **Missing Information**: Users have no visibility into:
   - Which config file was actually used
   - What runner is being executed
   - What model is being used (for Cursor)
   - Whether defaults were applied

---

## Task List

IMPORTANT: Only work on one task! Exit the session after finishing a single task!

```json
[
  {
    "category": "config-logging",
    "description": "Modify loadConfig to return metadata about which config file was loaded",
    "steps": [
      "Update RalConfig interface or create a new return type that includes config source information",
      "Modify loadConfig function to track and return: config file path used (or 'default'), whether it was from working dir, root dir, or default",
      "Update all call sites of loadConfig to handle the new return type",
      "Update config.test.ts to verify the new metadata is returned correctly"
    ],
    "passes": true
  },
  {
    "category": "config-logging",
    "description": "Add logging in run command to display config information at startup",
    "steps": [
      "After loading config in run.ts, log which config file was used (or 'using default config')",
      "Log the runner type that will be used",
      "Log the model if specified (for Cursor runner)",
      "Format the output clearly so users understand what configuration is active",
      "Update run.test.ts to verify logging occurs correctly"
    ],
    "passes": false
  },
  {
    "category": "config-logging",
    "description": "Add logging to show config resolution path when multiple configs exist",
    "steps": [
      "When working directory config exists, log: 'Using config from {path}'",
      "When only root directory config exists, log: 'Config not found in working directory, using root config from {path}'",
      "When no config exists, log: 'No ral.json found, using default config (runner: claude)'",
      "Ensure error cases (invalid config) still show clear error messages"
    ],
    "passes": false
  },
  {
    "category": "config-logging",
    "description": "Add summary logging at end of run command showing final config used",
    "steps": [
      "Before exiting (both success and failure cases), log a summary",
      "Include: runner type used, model (if applicable), config source",
      "This helps users verify what configuration was actually used for the entire run",
      "Update run.test.ts to verify end-of-run logging"
    ],
    "passes": false
  }
]
```
