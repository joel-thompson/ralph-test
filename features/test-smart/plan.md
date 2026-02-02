# Smart task selection smoke test

This fixture exists to validate `ral run-json` **smart task selection**: the chosen task should be the best “next” task based on dependencies and logical ordering, **even when it is not the first incomplete task in `tasks.json`**.

## What this fixture is testing

- `tasks.json` intentionally lists **documentation first**, then **setup**, then **implementation**.
- With `taskSelection: "smart"` enabled in `ral.json`, the runner should pick the **setup** task (index 1) because later tasks explicitly depend on the setup artifacts.

## How to run

From the repo root:

```bash
ral run-json -m 1 -w ./features/test-smart
```

## What you should see

- Output includes `Task selection mode: smart (with fallback to first-incomplete)`
- It should start work on task **2/3** (the setup task), not task 1/3. For example:
  - `Working on task 2/3: Create the demo input artifacts required by later tasks`

## Quick control (optional)

To confirm the difference versus non-smart behavior, temporarily change `features/test-smart/ral.json` to omit `taskSelection` (or set it to `"first-incomplete"`). Then `ral run-json` should select task **1/3** (the documentation task) because it falls back to “first incomplete”.
