@plan.md @activity.md

## Instructions

1. Read activity.md to understand current state and what was recently accomplished.
2. Study plan.md thoroughly.
3. Open plan.md and find the next highest leverage task with "passes": false
4. Work on exactly ONE task: complete all steps for that task. Important: ONLY WORK ON A SINGLE TASK.
5. Verify the task is working.
6. Update the activity log.
7. Update that task's passes value in plan.md from false to true. Important: Only modify the passes field. Do not remove or rewrite tasks.
8. Make one git commit for that task only with a clear message. Important: Do not git init, do not change remotes, do not push.

## Activity Log

After completing a task, append a dated progress entry to activity.md describing what you changed, and the result of verifying the task is working.

If any problems or mistakes are discovered, append a dated entry to activity.md describing what happened, and what should be avoided in the future.

Make note of any dependencies that were installed, and why.

## Task Verification

After implementing, use curl to:
1. Make a request to the local server URL
2. Verify the response is correct
3. Write an unbiased unit test

## Dependencies

Reduce dependencies when possible. Use only well known dependencies.

## Running the local dev server and background server processes

**Port restrictions:**
- ONLY use ports 3001 or 3002 for the dev server
- These are the only ports where you can view and kill processes

**Starting/restarting the dev server:**
- Before starting, kill any existing server on the chosen port using `kill -9 $(lsof -ti:PORT)` where PORT is 3001 or 3002
- Always call `nvm use` (or language equivalent like `pyenv local`, `rvm use`, etc.) before building/running to ensure the correct runtime version
- Build the application using the appropriate build command (e.g., `npm run build`, `tsc`, `cargo build`, etc.)
- Run the application directly with the runtime (e.g., `node dist/index.js`, `python app.py`, `cargo run`, etc.) - DO NOT use watchers or hot-reload tools
- Run the server in the background with run_in_background: true
- **IMPORTANT: Immediately save the returned task_id** - you MUST use this later with TaskStop to clean up
- Wait 3 seconds with sleep after starting
- Test the endpoint with curl
- If curl succeeds, move on immediately - DO NOT read error logs
- If curl fails, THEN check the background task output

**Example startup pattern:**
```
# Start background server and SAVE the task_id
Bash: node dist/index.js (run_in_background: true)
Result: task_id = "abc123"  ← SAVE THIS

# Later cleanup - use the saved task_id
TaskStop: task_id = "abc123"
```

**When to restart (REQUIRED after):**
- ANY code changes (since there's no watcher)
- Installing new packages/dependencies
- Modifying dependencies or imports
- Changing server configuration
- Between tasks (always start with a fresh server)

**After completing the current task - CLEANUP CHECKLIST:**

1. **Stop background tasks**: Use TaskStop with the task_id you saved when starting the server
   - Example: `TaskStop: task_id = "abc123"`
   - If you can't remember the task_id, check your earlier tool outputs

2. **Kill port processes**: Run `kill -9 $(lsof -ti:3001)` and `kill -9 $(lsof -ti:3002)`
   - Do NOT use `|| true` or `2>/dev/null` - you need to see if it fails
   - If it fails with "operation not permitted", that means you forgot step 1 (TaskStop)

3. **Verify cleanup**: Run `lsof -i:3001` and `lsof -i:3002`
   - Both should return exit code 1 (no processes found)
   - If processes are still running, go back to step 1

**Common mistake**: Using `kill || true` which hides failures. If kill fails, you MUST use TaskStop first.

**Error handling:**
- Sandbox permission errors like "operation not permitted /tmp/claude/tsx-..." are NORMAL and non-fatal
- The HTTP server still binds and works correctly
- Trust the curl test, not error messages


## Plan Completion Criteria Output

When ALL tasks have passes true, output <promise>COMPLETE</promise>