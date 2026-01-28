## Feature: JSON task list + procedural loop

Add a new workflow where the **agent no longer decides which task to do next**. Instead, the CLI loops over an explicit JSON task list and calls the agent for each task attempt.

This must be implemented as **new commands** so existing behavior stays intact:
- `ral run` stays the same (prompt-driven, `<promise>COMPLETE</promise>` ends the loop)
- Add `ral run-json`
- Add `ral scaffold-json`

### Goals

- Split planning into two artifacts:
  - **Plan implementation details**: investigation summary, notes, files to touch, context, etc. (markdown)
  - **Plan task list**: tasks only, as pure JSON (no markdown wrapper)
- Move “pick the next task” and “loop until done” responsibility out of the prompt and into code.

### New files created by `scaffold-json`

In the working directory:
- `activity.md` (same as existing scaffold)
- `plan.md` (details-only template; no embedded tasks)
- `tasks.json` (array of task objects)
- `prompt.md` (json-run prompt; does not instruct agent to choose next task)
- `ral.json` (same as existing scaffold)
- `screenshots/` (same as existing scaffold)

### `tasks.json` format

`tasks.json` is a JSON array. Each item is a task object with (at minimum):
- `category` (string)
- `description` (string)
- `steps` (string[])
- `passes` (boolean)
- `files` (optional string[])
- `context` (optional string)

### `run-json` loop semantics

`run-json` runs attempts up to `-m/--max-iterations` where **iterations = task attempts**.

Per iteration:
1. Load `tasks.json`
2. Pick the next task with `passes !== true` (e.g. first in array order)
3. Build prompt content:
   - include `@plan.md @activity.md` so the agent sees context
   - include the full selected task JSON inline (so no parsing guesswork)
   - include explicit instructions: do not choose tasks, do not edit `tasks.json`
4. Call the runner with **prompt content** (not only a prompt path)
5. If and only if the agent output contains `<promise>success</promise>`, mark that task `passes = true` and persist `tasks.json`
6. Otherwise leave `passes` as-is; the next iteration will attempt the same task again

Exit conditions:
- Exit 0 when there are **no remaining incomplete tasks**
- Exit 1 when max iterations reached and tasks remain incomplete

### Per-task success contract

For `run-json`, the agent’s final output should contain:
- `<promise>success</promise>` **iff** the task was verified complete

Unlike `run`, `<promise>COMPLETE</promise>` is not needed for `run-json`.

### Runner changes (Option B)

Update the runner interface to support **both**:
- run from a `promptPath` (existing behavior)
- run from `promptContent` (new behavior)

Also extend `transformFileReferences` to rewrite `@...` references for:
- `.md` (existing)
- `.json` (new, for `@tasks.json` if we ever reference it)

### Testing / verification

Unit tests only (do not integration-test by calling real CLIs):
- `run-json`:
  - exits 0 when all tasks already `passes: true`
  - marks task complete only when `<promise>success</promise>` is returned
  - retries same task when success promise is missing
  - respects `--max-iterations` as max attempts
- `scaffold-json`:
  - writes the expected files with plausible starter content
- runner:
  - prompt content path vs content code paths both transform `@` references as expected
