# Project Plan

## Project Overview

Typescript hono api which performs basic math operations.

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Initialize TypeScript Hono project",
    "steps": [
      "Initialize package.json with TypeScript support",
      "Install Hono and required dependencies",
      "Configure tsconfig.json",
      "Create project directory structure (src/)",
      "Set up dev scripts for running the server"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Create base Hono app with health check",
    "steps": [
      "Create main app entry point (src/index.ts)",
      "Initialize Hono application",
      "Add GET /health endpoint",
      "Verify server starts and responds"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement addition endpoint",
    "steps": [
      "Create POST /math/add endpoint",
      "Accept two numbers in request body",
      "Return sum in response",
      "Handle invalid input with error response"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement subtraction endpoint",
    "steps": [
      "Create POST /math/subtract endpoint",
      "Accept two numbers in request body",
      "Return difference in response",
      "Handle invalid input with error response"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Verify all math endpoints work correctly",
    "steps": [
      "Test addition with valid inputs",
      "Test subtraction with valid inputs",
      "Test multiplication with valid inputs",
      "Test division with valid inputs",
      "Test division by zero returns error",
      "Test invalid input handling for all endpoints"
    ],
    "passes": false
  },
  {
    "category": "documentation",
    "description": "Create API documentation",
    "steps": [
      "Create README.md file",
      "Document all available endpoints",
      "Include request/response examples for each endpoint",
      "Add setup and running instructions",
      "Include curl examples for testing"
    ],
    "passes": false
  }
]
```

## Agent Instructions

1. Read activity.md first to understand current state
2. Find next task with "passes": false
3. Complete all steps for that task
4. Verify the task is working
5. Update task to "passes": true
6. Log completion in activity.md

Important: Only modify the passes field. Do not remove or rewrite tasks.

## Verifying the task is working

After implementing, use curl to:
1. Make a request to the local server URL
2. Verify the response is correct

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


## Plan Completion Criteria
All tasks marked with "passes": true