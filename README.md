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

# 3. Set up Ralph loop files for JSON workflow
ral scaffold-json -w features/my-feature

# 4. Edit your plan and tasks
# Edit plan.md - add project details and context (no tasks)
# Edit tasks.json - define your tasks array
# Edit prompt.md - customize instructions (optional)

# 5. Run the loop
ral run-json -m 10 -w features/my-feature

# 6. Monitor progress
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

Ralph supports multiple AI backends through a `ral.json` configuration file in your working directory.

### ral.json

Create a `ral.json` file in your project root or feature directory to configure the AI runner:

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

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `runner` | `"claude"` \| `"cursor"` | `"claude"` | Which AI CLI to use |
| `model` | `string` | `"composer-1"` | Model for Cursor runner (ignored for Claude) |
| `taskSelection` | `"first-incomplete"` \| `"smart"` | `"first-incomplete"` | Task selection strategy for `run-json` command |

**Task Selection Strategies (`run-json` only):**

The `taskSelection` field controls how Ralph chooses the next task to work on:

- **`"first-incomplete"`** (default): Selects the first task in `tasks.json` where `passes !== true`. Simple, predictable, follows the order you defined.

- **`"smart"`**: Asks the AI runner to analyze all incomplete tasks and choose the best next task based on dependencies, logical ordering, and current context. Falls back to `"first-incomplete"` if the AI returns invalid output or an error occurs.

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

## Core Concepts

### Workflow Comparison

Ralph supports two separate workflows:

| Feature | JSON Workflow | Markdown Workflow |
|---------|---------------|-------------------|
| **Commands** | `scaffold-json`, `run-json` | `scaffold`, `run` |
| **Task storage** | Separate tasks.json file | Embedded in plan.md |
| **Task completion** | CLI writes `passes: true` on `<promise>success</promise>` | AI writes `passes: true` |
| **Use when** | You want explicit success verification | AI should manage task flow |
| **plan.md** | Contains only details/context | Contains tasks + details |

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

### `ral create-settings`

Generate Claude and MCP configuration files (optional).

```bash
ral create-settings              # Create in current directory
ral create-settings -w ./project # Create in subdirectory
ral create-settings -f           # Overwrite existing
```

Creates: `.claude/settings.json`, `.mcp.json`

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
