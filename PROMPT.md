@plan.md @activity.md

## Overview

We are building the project from scratch in this repo.

First read activity.md to see what was recently accomplished.

Start the project locally with the appropriate command, check the package.json for the correct command. If it doesn't exist, you may need to set that up.

Open plan.md and choose the single highest priority task where passes is false.

Work on exactly ONE task: implement the change.

## Testing

After implementing, use curl to:
1. Make a request to the local server URL
2. Verify the response is correct

## Background Server Processes

**Port restrictions:**
- ONLY use ports 3001 or 3002 for the dev server
- These are the only ports where you can view and kill processes

**Starting/restarting the dev server:**
- Before starting, kill any existing server on the chosen port using `kill -9 $(lsof -ti:PORT)` where PORT is 3001 or 3002
- Always call `nvm use` (or language equivalent like `pyenv local`, `rvm use`, etc.) before building/running to ensure the correct runtime version
- Build the application using the appropriate build command (e.g., `npm run build`, `tsc`, `cargo build`, etc.)
- Run the application directly with the runtime (e.g., `node dist/index.js`, `python app.py`, `cargo run`, etc.) - DO NOT use watchers or hot-reload tools
- Run the server in the background with run_in_background: true
- Wait 3 seconds with sleep after starting
- Test the endpoint with curl
- If curl succeeds, move on immediately - DO NOT read error logs
- If curl fails, THEN check the background task output

**When to restart (REQUIRED after):**
- ANY code changes (since there's no watcher)
- Installing new packages/dependencies
- Modifying dependencies or imports
- Changing server configuration
- Between tasks (always start with a fresh server)

**After completing the current task:**
- Kill ALL background processes that were started:
  - Kill processes on ports 3001 and 3002: `kill -9 $(lsof -ti:3001)` and `kill -9 $(lsof -ti:3002)`
  - Ensure complete cleanup of all background processes before finishing

**Error handling:**
- Sandbox permission errors like "operation not permitted /tmp/claude/tsx-..." are NORMAL and non-fatal
- The HTTP server still binds and works correctly
- Trust the curl test, not error messages

## Task Completion

Append a dated progress entry to activity.md describing what you changed and the curl request and response.

Update that task's passes in plan.md from false to true.

Make one git commit for that task only with a clear message.

Do not git init, do not change remotes, do not push.

ONLY WORK ON A SINGLE TASK.

## Completion Criteria Output

When ALL tasks have passes true, output <promise>COMPLETE</promise>