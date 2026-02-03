# Smart Task Selection (Prompt Context)

## Overview

`run-json` currently works on the **first incomplete** task in `tasks.json`. This adds an optional “smart choose” mode that asks the configured runner (Claude CLI or Cursor CLI) to pick the best next task **by index**, with a safe fallback to the existing behavior.

This intentionally avoids introducing a second AI stack (no Vercel AI SDK, no provider switching, no extra env vars).

## Goals

- Improve task ordering for `run-json` by letting the runner choose the next task.
- Keep the feature **optional** and **safe**: any failure falls back to the current `selectNextTask()` logic.
- Avoid new dependencies and avoid a large helper/test surface area.

## Non-goals

- No changes to `tasks.json` schema.
- No OpenAI/Anthropic API plumbing beyond the existing runner abstraction.

## Configuration (`ral.json`)

Extend `ral.json` with an optional field:

```json
{
  "runner": "claude",
  "taskSelection": "smart"
}
```

If `taskSelection` is missing, behavior is unchanged.

## Smart Selection Prompt Contract

- Provide the model a list of **incomplete tasks** with their **original indices** from `tasks.json`.
- Require **strict JSON only** output:

```json
{"index": 12}
```

## Parsing / Validation

- `index` must be an integer
- \(0 \le index < tasks.length\)
- `tasks[index].passes !== true`
- Any failure ⇒ return `null` and fall back to `selectNextTask(tasks)`

## Integration

- When `config.taskSelection === "smart"`, attempt smart selection once per attempt.
- On invalid output or error, fall back to `selectNextTask(tasks)`.

