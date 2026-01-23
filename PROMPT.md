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

**Starting/restarting the dev server:**
- Run `./dev-server.sh` with run_in_background: true anytime you need to start or restart the server
- The script automatically kills any existing server and starts fresh
- Wait 3 seconds with sleep after starting
- Test the endpoint with curl
- If curl succeeds, move on immediately - DO NOT read error logs
- If curl fails, THEN check the background task output

**When to restart (REQUIRED after):**
- Installing new npm packages
- Modifying dependencies or imports
- Changing server configuration
- Between tasks (always start with a fresh server)

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