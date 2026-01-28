# Project Plan

## Project Overview

more details in the spec: @spec.md

Add two new commands to `ral`:

- `run-json`: loops procedurally over a `tasks.json` array, invoking the agent once per attempt. A task is marked complete only when the agent outputs `<promise>success</promise>`.
- `scaffold-json`: scaffolds a json-oriented workflow with `plan.md` (details-only) + `tasks.json` (tasks-only).

The existing `run` / `scaffold` behavior must remain intact.

---

## Task List

```json
[
  {
    "category": "runner",
    "description": "Extend AgentRunner to accept prompt content (string) in addition to prompt path (keep existing run behavior)",
    "steps": [
      "Define an exact runner call signature that supports both promptPath and promptContent (exactly one must be provided)",
      "Update DefaultClaudeRunner to support the new signature without breaking run.ts",
      "Update CursorRunner to support the new signature without breaking run.ts",
      "Update unit tests that mock AgentRunner to match the new signature"
    ],
    "files": [
      "src/utils/claude-runner.ts",
      "src/utils/cursor-runner.ts"
    ],
    "passes": true
  },
  {
    "category": "runner",
    "description": "Extend @ reference rewriting to support .json files (in addition to .md)",
    "steps": [
      "Update transformFileReferences to rewrite @... references for .json as well as .md (only for those extensions)",
      "Add/extend unit tests to cover .md and .json transformations and ensure no unwanted rewrites"
    ],
    "files": [
      "src/utils/claude-runner.ts",
      "src/utils/cursor-runner.ts"
    ],
    "passes": true
  },
  {
    "category": "templates",
    "description": "Add scaffold-json templates (plan details, tasks.json, prompt) embedded in code",
    "steps": [
      "Add PLAN_DETAILS_TEMPLATE (markdown) for details-only plan.md",
      "Add TASKS_JSON_TEMPLATE (as a TS object/array, written via JSON.stringify)",
      "Add PROMPT_JSON_TEMPLATE (markdown) for run-json workflow",
      "Ensure templates follow the same embedding conventions as existing templates"
    ],
    "files": [
      "src/templates/index.ts"
    ],
    "passes": true
  },
  {
    "category": "command",
    "description": "Implement scaffold-json command to create plan.md (details), tasks.json (tasks), prompt.md, activity.md, screenshots/, ral.json",
    "steps": [
      "Create src/commands/scaffold-json.ts mirroring scaffold.ts structure",
      "Write tasks.json file using JSON.stringify template data",
      "Honor -w/--working-directory and -f/--force behaviors consistent with scaffold",
      "Add unit tests for scaffold-json (files created, force behavior, tasks.json is valid JSON)"
    ],
    "files": [
      "src/commands/scaffold-json.ts (new)",
      "src/commands/scaffold-json.test.ts (new)",
      "src/commands/scaffold.ts",
      "src/commands/scaffold.test.ts",
      "src/utils/file-helpers.ts",
      "src/templates/index.ts"
    ],
    "passes": true
  },
  {
    "category": "command",
    "description": "Register new CLI commands: scaffold-json and run-json",
    "steps": [
      "Add commander registrations in src/index.ts for scaffold-json and run-json",
      "Match existing flags and error handling patterns (working directory, force, max attempts)",
      "Ensure existing commands remain unchanged"
    ],
    "files": [
      "src/index.ts"
    ],
    "passes": true
  },
  {
    "category": "command",
    "description": "Implement run-json helpers (tasks.json parsing/validation, selection, prompt builder, persistence)",
    "steps": [
      "Create helper(s) for loading and validating tasks.json (must be a JSON array; each item must have category, description, steps[], passes boolean)",
      "Define selection rule: pick the first task (array order) where passes !== true",
      "Define update rule: mark passes=true by array index (do not match by description); optionally support a stable id field later",
      "Create helper to build promptContent: prompt.md content + selected task JSON inline + explicit instructions (do not edit tasks.json; output <promise>success</promise> iff verified done)",
      "Create helper to persist updated tasks.json with stable formatting (JSON.stringify(..., null, 2) + trailing newline)"
    ],
    "files": [
      "src/commands/run-json.ts (new)",
      "src/utils/file-helpers.ts"
    ],
    "passes": true
  },
  {
    "category": "command",
    "description": "Implement run-json command wiring + loop (max attempts; mark passes=true only on <promise>success</promise>)",
    "steps": [
      "Create src/commands/run-json.ts main command structure using the helpers",
      "Validate required files in working directory: plan.md, prompt.md, activity.md, tasks.json",
      "Loop up to -m/--max-iterations attempts: load tasks, select next incomplete task, build promptContent, call runner with promptContent",
      "If response includes <promise>success</promise>, persist tasks.json with that task marked complete; otherwise leave it incomplete so it retries",
      "Exit 0 when there is no next incomplete task; exit 1 when max attempts reached and tasks remain incomplete",
      "Add unit tests for all run-json behaviors (already-complete exit, success-gated completion, retry behavior, max attempts exit)"
    ],
    "files": [
      "src/commands/run-json.ts (new)",
      "src/commands/run-json.test.ts (new)",
      "src/utils/validation.ts",
      "src/utils/config.ts"
    ],
    "passes": true
  },
  {
    "category": "docs",
    "description": "Update README with scaffold-json / run-json usage and workflow",
    "steps": [
      "Add quickstart examples for scaffold-json and run-json",
      "Document the tasks.json schema at a high level and the <promise>success</promise> contract",
      "Clarify that run (existing) and run-json (new) are separate workflows"
    ],
    "files": [
      "README.md"
    ],
    "passes": true
  }
]
```

---

## Implementation Notes

### Loop semantics

- `-m/--max-iterations` for `run-json` is **max attempts** (to prevent infinite retries if the agent fails).
- The loop should always pick the next `passes !== true` task (first in array order). If the agent fails (no `<promise>success</promise>`), that task remains incomplete and will be selected again on the next attempt.

### Task identity / update rule

- Selection is by **array order**.
- Completion updates should be applied by **array index** (the task we attempted), not by matching `description` text.
- Optional future improvement: add a stable `id` string per task to make reordering safer.

### What the agent may edit (run-json)

- Allowed: source code, tests, docs, `activity.md`, and optionally `plan.md` notes.
- Not allowed: editing `tasks.json` directly (the CLI owns updating `passes`).

### Runner call signature (exact)

The runner should accept either prompt source:
- `promptPath` (used by existing `run`)
- `promptContent` (used by new `run-json`)

Exactly one must be provided per call.

### Prompt contract for run-json

The prompt content passed to the runner should:
- include `@plan.md @activity.md` for context
- include the selected task JSON inline
- explicitly instruct the agent to work on that single task
- require `<promise>success</promise>` only when the task is verified complete
- instruct the agent **not** to edit `tasks.json` (the CLI owns updating passes)

### @ reference rewriting scope

`transformFileReferences` should only rewrite:
- `@something.md`
- `@something.json`

and should avoid rewriting other uses of `@` (e.g. package scopes, emails, etc.).
