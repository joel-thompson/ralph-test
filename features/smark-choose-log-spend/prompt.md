@plan.md @activity.md @tasks.json

## Instructions

1. Read activity.md to understand current state and what was recently accomplished.
2. Study plan.md for project context and details.
3. Review tasks.json - the CLI will provide you with a single task to work on below.
4. Work on exactly ONE task: complete all steps for that task. Important: ONLY WORK ON A SINGLE TASK.
5. Do not do opportunistic refactors. If you notice a follow-up improvement, record it in activity.md instead of implementing it.
6. Verify the task is working by running tests and/or the CLI (use pnpm).
7. Update activity.md with a dated entry describing your changes and verification results.
8. Make one git commit for that task only with a clear message. Important: do not git init, do not change remotes, do not push.
9. Output <promise>success</promise> if and only if the task is fully complete and verified. If successful, output ONLY <promise>success</promise>.

IMPORTANT: Do NOT edit tasks.json directly. The CLI manages task completion status.

## Current Task

The CLI will insert the current task details here when invoking the agent.

## Activity Log

After completing a task, append a dated progress entry to activity.md describing what you changed, and the result of verifying the task is working.

If any problems or mistakes are discovered, append a dated entry to activity.md describing what happened, and what should be avoided in the future.

Make note of any dependencies that were installed, and why.

## Task Verification

After implementing, run the cli and/or the tests to verify the implementation works correctly.

## Dependencies

Reduce dependencies when possible. Use only well known dependencies.

## Definition of Done

Output <promise>success</promise> ONLY when:
- All steps for the current task are complete.
- The implementation has been tested and verified to work (use pnpm).
- The activity log has been updated with what changed and how it was verified.
