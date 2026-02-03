# Project Plan

## Project Overview

Add spend logging for **smart task selection** in `run-json`, so selection calls contribute to the same tokens/cost visibility we already get for normal attempt runs.

Today `runJson()` calls `selectTaskSmart()` (which calls `runner.runAgent()`), but the selection response usage/cost is discarded. This means selection spend is invisible and **not included** in cumulative totals.

## Desired Behavior

- When `taskSelection: "smart"`:
  - Log selection spend (tokens/cache/cost) for the smart-selection runner call.
  - Add selection spend to the existing cumulative totals (so totals reflect *all* runner calls: selection + attempts).
  - Log selection spend even when selection fails validation and we fall back to first-incomplete (because the runner call still spent tokens/cost).
- Preserve the existing per-attempt logging format and semantics (attempt stats remain attempt-only).
- Keep Cursor runner behavior reasonable (Cursor runner returns `usage`/`total_cost_usd` as **0**; `duration_ms` may exist).

## Touchpoints

- `src/commands/run-json.ts`
  - `runJson()` (owns cumulative totals + logging)
  - `selectTaskSmart()` (invokes `runner.runAgent()` for selection)

## Logging Format (selection spend)

Print a compact selection-only block when there is non-zero spend (mirrors existing “avoid all zeros” behavior):

- `Task selection (smart)`
- `  Tokens In: <n>  Tokens Out: <n>  Cache Read: <n>  Cost: $<n>`

## Implementation Notes / Approach

- Change `selectTaskSmart()` to return **both**:
  - the selected task/index (or `null`), and
  - the runner response usage/cost (when available).
- In `runJson()`:
  - record/log selection usage/cost (when smart selection is enabled),
  - add it into `cumulative` before running the attempt,
  - keep the existing attempt stats logging as-is.

Cursor compatibility:
- Only print selection token/cost lines when they are non-zero (mirrors existing attempt behavior). This avoids noisy “all zeros” blocks in Cursor mode.
- Still add 0s into cumulative totals (no behavior change, but keeps code paths uniform).

## Acceptance Checks

- Selection spend is logged when smart selection runs and spend is non-zero.
- Selection spend contributes to cumulative totals (selection + attempts).
- Attempt log lines remain attempt-only and unchanged.
- Selection failures still log/accumulate spend when the runner returned usage/cost.
- Cursor/zero-usage mode does not print a noisy all-zero selection block.

## Non-Goals

- Changing the selection prompt format/heuristics.
- Changing task completion semantics or retry logic.
