# Ralph Loop CLI (`ral`)

A TypeScript CLI tool for AI-assisted development loops where Claude iteratively works through a structured plan until completion.

## Prerequisites

- Node.js 18+
- **One of the following AI CLI tools:**
  - **Claude CLI** (default): `npm install -g @anthropic-ai/claude`
    - Requires Anthropic API key configured for Claude CLI
  - **Cursor CLI** (alternative): Install Cursor editor from [cursor.sh](https://cursor.sh)
    - The `agent` command is included with Cursor

## Quick Start

### JSON Workflow (Recommended)

```bash
# 1. Clone and set up (for contributors)
git clone https://github.com/joel-thompson/ralph-test
cd ralph-test
pnpm install && pnpm build
pnpm link --global # run pnpm build when you make changes to the code

# 2. Create a new project in a separate directory
mkdir my-project && cd my-project

# 3. (Optional) Generate configuration files
ral create-settings

# 4. Set up Ralph loop files for JSON workflow
ral scaffold-json -w features/my-feature

# 5. Edit your plan and tasks
# Edit plan.md - add project details and context (no tasks)
# Edit tasks.json - define your tasks array
# Edit prompt.md - customize instructions (optional)

# 6. Run the loop
ral run-json -m 10 -w features/my-feature

# 7. Monitor progress
cat activity.md
cat tasks.json  # See which tasks are complete
git log
```

## Claude Code Skills

Ralph includes two powerful skills for use with Claude Code that help you plan and structure your work before running the autonomous loop:

### ralph-plan: PRD Generator

Generates Product Requirements Documents (PRDs) for new features. Claude will ask clarifying questions and create a structured plan.md file with user stories and acceptance criteria.

**Usage in Claude Code:**

- Say: "create a ralph plan for [feature]"
- Or use the command: `/ralph-plan`

### ralph-tasks: PRD to Tasks Converter

Converts an existing PRD into the tasks.json format that Ralph uses for execution. Ensures tasks are properly sized and ordered.

**Usage in Claude Code:**

- Say: "convert this ralph plan to ralph tasks"
- Or use the command: `/ralph-tasks`

### Installing the Skills

Copy the skills to your Claude configuration directory:

```bash
cp -r skills/ralph-plan ~/.claude/skills/
cp -r skills/ralph-tasks ~/.claude/skills/
```

After installation, the skills are available in any Claude Code session.

### Workflow with Skills

1. **Plan**: Use `/ralph-plan` to generate a PRD for your feature
2. **Convert**: Use `/ralph-tasks` to convert the PRD to tasks.json
3. **Execute**: Run `ral run-json` to have Claude complete all tasks autonomously
4. **Review**: Check activity.md and git commits for what was accomplished

This workflow enables: *Idea → PRD → tasks.json → Autonomous Execution*

## Configuration

Ralph supports multiple AI backends through a `ral.json` configuration file in your project root.

### ral.json

Create a `ral.json` file in your project root to configure the AI runner:

**Using Claude (default):**

```json
{
  "runner": "claude"
}
```

**Using Cursor:**

```json
{
  "runner": "cursor",
  "model": "composer-1"
}
```

**Configuration Options:**


| Field           | Type                             | Default              | Description                                    |
| --------------- | -------------------------------- | -------------------- | ---------------------------------------------- |
| `runner`        | `"claude"` | `"cursor"`          | `"claude"`           | Which AI CLI to use                            |
| `model`         | `string`                         | `"composer-1"`       | Model for Cursor runner (ignored for Claude)   |
| `taskSelection` | `"first-incomplete"` | `"smart"` | `"first-incomplete"` | Task selection strategy for `run-json` command |


**Task Selection Strategies (`run-json` only):**

The `taskSelection` field controls how Ralph chooses the next task to work on:

- `**"first-incomplete"**` (default): Selects the first task in `tasks.json` where `passes !== true`. Simple, predictable, follows the order you defined.
- `**"smart"**`: Asks the AI runner to analyze all incomplete tasks and choose the best next task based on dependencies, logical ordering, and current context. Falls back to `"first-incomplete"` if the AI returns invalid output or an error occurs.

Example with smart task selection:

```json
{
  "runner": "claude",
  "taskSelection": "smart"
}
```

**Notes:**

- If `ral.json` doesn't exist, Ralph uses Claude by default
- The `model` field only applies to Cursor runner
- Claude runner uses the model configured in your Claude CLI settings
- When using Cursor, token usage and cost information are not displayed (Cursor doesn't provide this data)
- The `taskSelection` field only applies to the `run-json` command (ignored by `run`)

### Service Management

Ralph provides built-in service management commands to safely start, stop, check status, and fetch logs from dev servers (e.g., Vite, Next.js) without blocking the autonomous loop.

**⚠️ Important for AI Agents:** Do not run dev servers directly (e.g., `pnpm dev`, `npm run dev`, `vite`). These commands are long-running and will hang the loop. Always use `ral service ...` commands instead.

#### Configuring Services in ral.json

Add a `services` section to your `ral.json` to define one or more services:

```json
{
  "runner": "claude",
  "services": {
    "web": {
      "type": "docker-compose",
      "cwd": "./my-app",
      "composeFile": "docker-compose.yml",
      "service": "web",
      "healthcheckUrl": "http://localhost:5173/"
    },
    "api": {
      "type": "docker-compose",
      "cwd": "./backend",
      "composeFile": "docker-compose.yml",
      "service": "api",
      "healthcheckUrl": "http://localhost:3000/health"
    }
  }
}
```

**Service Configuration Fields:**


| Field            | Type               | Required | Description                                                                            |
| ---------------- | ------------------ | -------- | -------------------------------------------------------------------------------------- |
| `type`           | `"docker-compose"` | Yes      | Service type (only `docker-compose` supported in v1)                                   |
| `cwd`            | `string`           | Yes      | Working directory where Docker Compose will run (relative to project root or absolute) |
| `composeFile`    | `string`           | Yes      | Docker Compose file name (e.g., `docker-compose.yml`)                                  |
| `service`        | `string`           | Yes      | Service name from the Compose file to manage                                           |
| `healthcheckUrl` | `string`           | Yes      | HTTP URL to check if the service is healthy (e.g., `http://localhost:5173/`)           |


#### Service Commands

Ralph provides four service management commands that are safe for AI agents to use:

##### `ral service start <name>`

Start a service in the background (non-blocking, idempotent).

```bash
ral service start web                    # Start the "web" service
ral service start api -w ./features/api  # Start with custom working directory
```

**Behavior:**

- Runs `docker compose up -d` for the configured service
- Returns quickly (does not wait for full startup)
- Idempotent: safe to run when already running
- Returns clear error if Docker is not available

##### `ral service stop <name>`

Stop a running service (non-blocking, idempotent).

```bash
ral service stop web                     # Stop the "web" service
ral service stop api -w ./features/api
```

**Behavior:**

- Runs `docker compose stop` for the configured service
- Returns quickly
- Idempotent: safe to run when already stopped

##### `ral service status <name>`

Check if a service is running and healthy.

```bash
ral service status web                   # Human-readable output
ral service status web --json            # JSON output for programmatic use
```

**Behavior:**

- Checks if the Docker Compose service is running
- Performs HTTP healthcheck to `healthcheckUrl` with 5 second timeout
- Returns `running` and `healthy` status
- Only performs healthcheck if service is running

**Example JSON output:**

```json
{
  "name": "web",
  "type": "docker-compose",
  "running": true,
  "healthy": true,
  "healthcheckUrl": "http://localhost:5173/",
  "composeFile": "docker-compose.yml",
  "composeService": "web"
}
```

##### `ral service logs <name>`

Fetch recent logs from a service (tail-and-exit, does not follow).

```bash
ral service logs web                     # Fetch last 200 lines (default)
ral service logs web --tail 500          # Fetch last 500 lines
ral service logs web --json              # JSON output with metadata
```

**Behavior:**

- Fetches the last N lines of logs and exits (does not attach/follow)
- Default: 200 lines
- Returns quickly (bounded operation)
- Safe for AI agents to use for debugging

**Example JSON output:**

```json
{
  "name": "web",
  "type": "docker-compose",
  "composeFile": "docker-compose.yml",
  "composeService": "web",
  "lines": [
    "web-1  | > vite",
    "web-1  | ",
    "web-1  |   VITE v5.0.0  ready in 234 ms"
  ]
}
```

#### Example: Vite + React Dev Server

Here's a complete example for managing a Vite dev server:

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  web:
    image: node:18
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "5173:5173"
    command: npm run dev -- --host 0.0.0.0
```

**ral.json:**

```json
{
  "runner": "claude",
  "services": {
    "web": {
      "type": "docker-compose",
      "cwd": ".",
      "composeFile": "docker-compose.yml",
      "service": "web",
      "healthcheckUrl": "http://localhost:5173/"
    }
  }
}
```

**Usage in a Ralph loop:**

```bash
# AI agent can safely start the dev server
ral service start web

# Check if it's running and healthy
ral service status web

# Fetch recent logs to debug issues
ral service logs web --tail 100

# Stop when done
ral service stop web
```

## Core Concepts

### Workflow Comparison

Ralph supports two separate workflows:


| Feature             | JSON Workflow                                             | Markdown Workflow          |
| ------------------- | --------------------------------------------------------- | -------------------------- |
| **Commands**        | `scaffold-json`, `run-json`                               | `scaffold`, `run`          |
| **Task storage**    | Separate tasks.json file                                  | Embedded in plan.md        |
| **Task completion** | CLI writes `passes: true` on `<promise>success</promise>` | AI writes `passes: true`   |
| **Use when**        | You want explicit success verification                    | AI should manage task flow |
| **plan.md**         | Contains only details/context                             | Contains tasks + details   |


**Recommendation:** The JSON workflow is recommended and is being actively developed.

### The Ralph Loop

Ralph automates iterative development by having an AI assistant (Claude or Cursor):

1. Read the activity log to understand current state
2. Find the next incomplete task in your plan
3. Complete all steps for that task
4. Verify the task works
5. Update the activity log
6. Mark the task as complete
7. Make a git commit
8. Repeat until all tasks are done

### Key Files

- **plan.md**: JSON task list with descriptions, steps, and pass/fail status
- **activity.md**: Detailed log of what Claude accomplished each iteration
- **prompt.md**: Instructions that guide Claude's behavior
- **spec.md** (optional): Detailed specification/requirements document

### Working Directory Pattern

```bash
# Organize features in subdirectories
mkdir -p features/my-feature
ral scaffold -w features/my-feature
# Edit features/my-feature/plan.md and spec.md
ral run -w features/my-feature -m 15

# AI runs from project root (can edit source files)
# But reads plan/activity/tasks/prompt from features/my-feature/
```

This lets you work on multiple features in parallel with isolated plans.

## Commands

Ralph provides two separate workflows:

1. **JSON workflow** (`scaffold-json` + `run-json`): Tasks in tasks.json with CLI-controlled task completion (recommended)
2. **Markdown workflow** (`scaffold` + `run`): Tasks embedded in plan.md with AI-controlled task completion (legacy)

### `ral create-settings`

Generate Ralph, Claude, and MCP configuration files (optional).

```bash
ral create-settings    # Create in current directory
ral create-settings -f # Overwrite existing files
```

Creates: `ral.json`, `.claude/settings.json`, `.mcp.json`

**Files created:**

- **`ral.json`**: Ralph configuration with default runner and task selection settings
- **`.claude/settings.json`**: Claude Code settings including permissions, sandbox configuration, and environment variables
- **`.mcp.json`**: MCP server configuration (Context7 by default)

**Note:** This command always creates files in the current working directory. Change to your desired directory before running the command.

### `ral scaffold-json`

Generate Ralph loop file structure for JSON workflow.

```bash
ral scaffold-json                    # Create in current directory
ral scaffold-json -w ./my-feature    # Create in subdirectory
ral scaffold-json -f                 # Overwrite existing files
```

Creates: `activity.md`, `plan.md` (details only), `tasks.json`, `prompt.md`, `screenshots/`

**Key differences from `scaffold`:**

- Tasks are stored separately in `tasks.json` (not embedded in plan.md)
- The CLI controls task completion (not the AI)
- plan.md contains only project details and context

### `ral run-json`

Execute the Ralph loop using JSON workflow.

```bash
ral run-json -m <max-iterations>      # Required: set iteration limit
ral run-json -m 10 -w ./features/api  # Run with specific working directory
```

**Behavior:**

- Loads tasks from `tasks.json` (array of task objects)
- Selects first incomplete task (where `passes !== true`) in array order
- Injects task details into prompt dynamically
- Only marks task complete when AI outputs `<promise>success</promise>`
- Retries incomplete tasks automatically on next iteration
- Exits with code 0 when all tasks complete
- Exits with code 1 if max iterations reached with tasks remaining

**tasks.json schema:**

```json
[
  {
    "category": "implementation",
    "description": "Create user authentication module",
    "steps": [
      "Create src/auth/authenticate.ts",
      "Implement JWT token validation",
      "Add unit tests in tests/auth/authenticate.test.ts",
      "Run npm test -- verify tests pass"
    ],
    "passes": false
  }
]
```

**Required fields:**

- `category` (string): Task category (e.g., "setup", "implementation", "testing")
- `description` (string): Clear description of what to accomplish
- `steps` (array): Explicit steps to complete the task
- `passes` (boolean): Completion status (CLI sets to true on success)

**Success contract:**
The AI must output `<promise>success</promise>` only when the task is verified complete. The CLI detects this tag and marks the task complete in tasks.json. Without this tag, the task remains incomplete and will retry on the next iteration.

**What the AI can edit:**

- ✅ Source code, tests, documentation
- ✅ activity.md (progress logging)
- ✅ plan.md (notes and context)
- ❌ tasks.json (CLI owns task completion status)

### `ral scaffold` (Legacy)

Generate Ralph loop file structure with starter templates (markdown workflow).

```bash
ral scaffold                    # Create in current directory
ral scaffold -w ./my-feature    # Create in subdirectory
ral scaffold -f                 # Overwrite existing files
```

Creates: `activity.md`, `plan.md`, `prompt.md`, `screenshots/`

### `ral run` (Legacy)

Execute the Ralph loop (markdown workflow).

```bash
ral run -m <max-iterations>           # Required: set iteration limit
ral run -m 10 -w ./features/auth     # Run with specific working directory
```

**Behavior:**

- Iterates up to max-iterations times
- Tracks token usage and costs per iteration (Claude runner only)
- Exits with code 0 when the AI outputs `<promise>COMPLETE</promise>`
- Exits with code 1 if max iterations reached without completion

**Output (Claude runner):**

```
Iteration 1/10
Input tokens: 15234, Output tokens: 2341
Cost this iteration: $0.123
Cumulative cost: $0.123
```

**Output (Cursor runner):**

```
Iteration 1/10
Duration: 2525ms
```

Note: Cursor runner does not provide token usage or cost information.

## Choosing max-iterations

Formula: `max-iterations = number_of_tasks + buffer`

Examples:

- 5 tasks → use `-m 8` (5 + 3 buffer)
- 10 tasks → use `-m 13` (10 + 3 buffer)
- 20 tasks → use `-m 25` (20 + 5 buffer)

**Why a buffer?**

- Tests might fail and need fixing
- Build errors need resolution
- Tasks might be more complex than anticipated

**Tip:** Start conservative and run again if needed. Progress is saved.

```bash
ral run -m 5    # Run 5 iterations
cat activity.md # Check progress
ral run -m 5    # Continue where you left off
```

## Example Workflows

For detailed, real-world examples see [EXAMPLES.md](EXAMPLES.md):

1. **Building a New Feature from Scratch**: Complete workflow for implementing a notification system
2. **Refactoring Existing Code**: Systematic refactoring of error handling across an Express API
3. **Debugging and Fixing a Bug**: Structured investigation and fix for an intermittent cart bug

Quick example - Building a feature:

```bash
# 1. Create feature directory and spec
ral scaffold-json -w features/notifications

# 2. Generate plan with AI assistant
# Use /ralph-plan skill in Claude Code to generate PRD
# Use /ralph-tasks skill to convert PRD to tasks.json

# 3. run
ral run-json -w features/notifications -m 15

# 4. Review results
cat features/notifications/activity.md
cat features/notifications/tasks.json
git log --oneline
```

## Testing

```bash
pnpm test:run                # Run all tests
pnpm test                    # Watch mode
```

