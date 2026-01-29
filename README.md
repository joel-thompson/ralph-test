# Ralph Loop CLI (`ral`)

A TypeScript CLI tool for AI-assisted development loops where Claude iteratively works through a structured plan until completion.

## Quick Start

### Markdown Workflow (Original)

```bash
# 1. Clone and set up (for contributors)
git clone <repository-url>
cd ralph-test
pnpm install && pnpm build
pnpm link --global

# 2. Create a new project
mkdir my-project && cd my-project

# 3. Set up Ralph loop files
ral scaffold

# 4. Edit your plan
# Edit plan.md - define your tasks in JSON format
# Edit prompt.md - customize instructions (optional)

# 5. Run the loop
ral run -m 10

# 6. Monitor progress
cat activity.md
git log
```

### JSON Workflow (New)

```bash
# 1. Clone and set up (for contributors)
git clone <repository-url>
cd ralph-test
pnpm install && pnpm build
pnpm link --global

# 2. Create a new project
mkdir my-project && cd my-project

# 3. Set up Ralph loop files for JSON workflow
ral scaffold-json

# 4. Edit your plan and tasks
# Edit plan.md - add project details and context (no tasks)
# Edit tasks.json - define your tasks array
# Edit prompt.md - customize instructions (optional)

# 5. Run the loop
ral run-json -m 10

# 6. Monitor progress
cat activity.md
cat tasks.json  # See which tasks are complete
git log
```

## Prerequisites

- Node.js 18+
- **One of the following AI CLI tools:**
  - **Claude CLI** (default): `npm install -g @anthropic-ai/claude`
    - Requires Anthropic API key configured for Claude CLI
  - **Cursor CLI** (alternative): Install Cursor editor from [cursor.sh](https://cursor.sh)
    - The `agent` command is included with Cursor

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

**Notes:**
- If `ral.json` doesn't exist, Ralph uses Claude by default
- The `model` field only applies to Cursor runner
- Claude runner uses the model configured in your Claude CLI settings
- When using Cursor, token usage and cost information are not displayed (Cursor doesn't provide this data)

**Example with working directory:**
```bash
# Create config for a specific feature
mkdir -p features/my-feature
echo '{"runner": "cursor", "model": "composer-1"}' > features/my-feature/ral.json
ral scaffold -w features/my-feature
ral run -w features/my-feature -m 10
```

## Core Concepts

### Workflow Comparison

Ralph supports two separate workflows:

| Feature | Markdown Workflow | JSON Workflow |
|---------|-------------------|---------------|
| **Commands** | `scaffold`, `run` | `scaffold-json`, `run-json` |
| **Task storage** | Embedded in plan.md | Separate tasks.json file |
| **Task completion** | AI writes `passes: true` | CLI writes `passes: true` on `<promise>success</promise>` |
| **Use when** | AI should manage task flow | You want explicit success verification |
| **plan.md** | Contains tasks + details | Contains only details/context |

**Recommendation:** Start with markdown workflow (simpler). Use JSON workflow when you need:
- Explicit success verification per task
- Separation of tasks from plan details
- CLI-controlled task progression

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
# But reads plan/activity from features/my-feature/
```

This lets you work on multiple features in parallel with isolated plans.

## Commands

Ralph provides two separate workflows:
1. **Markdown workflow** (`scaffold` + `run`): Tasks embedded in plan.md with AI-controlled task completion
2. **JSON workflow** (`scaffold-json` + `run-json`): Tasks in tasks.json with CLI-controlled task completion

### `ral scaffold`

Generate Ralph loop file structure with starter templates (markdown workflow).

```bash
ral scaffold                    # Create in current directory
ral scaffold -w ./my-feature    # Create in subdirectory
ral scaffold -f                 # Overwrite existing files
```

Creates: `activity.md`, `plan.md`, `prompt.md`, `screenshots/`

### `ral run`

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

### `ral create-settings`

Generate Claude and MCP configuration files (optional).

```bash
ral create-settings              # Create in current directory
ral create-settings -w ./project # Create in subdirectory
ral create-settings -f           # Overwrite existing
```

Creates: `.claude/settings.json`, `.mcp.json`

## Writing Your Plan

### 1. Write a Spec (Recommended for Complex Features)

Create `spec.md` with detailed requirements:

```markdown
# Feature Name

## Project Overview
What you're building and why.

## Requirements
- Functional requirement 1
- Functional requirement 2
- Non-functional requirements

## Technical Constraints
- Use TypeScript strict mode
- Follow existing patterns in src/
- Minimize dependencies

## API Design
```typescript
interface MyFeature {
  doSomething(input: string): Promise<Result>
}
```

## Testing & Verification
- Unit tests for all functions
- Integration test for end-to-end flow
- Manual test: do X and verify Y
```

### 2. Generate a Plan with AI

Use Claude or ChatGPT to generate your task breakdown:

**Example prompt:**
```
I have a spec.md file describing a new feature. Please read @spec.md
and generate a plan.md with 6-10 tasks in the Ralph loop JSON format.
Each task should have: category, description, clear steps, and verification.
Tasks should be 5-15 minutes of work each.
```

### 3. Review and Refine the Plan

Edit `plan.md` to ensure quality:

```markdown
# Project Plan

## Project Overview
Brief description of what you're building.

@spec.md

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Set up database schema and install dependencies",
    "steps": [
      "Install required npm packages: zod, bcrypt",
      "Create database migration for users table",
      "Run migration: npm run migrate",
      "Verify table exists: psql -c '\\d users'",
      "Run npm run build - should have no TypeScript errors"
    ],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Create User repository with CRUD operations",
    "steps": [
      "Create src/repositories/UserRepository.ts",
      "Implement create, findById, findByEmail, update methods",
      "Add proper TypeScript types and error handling",
      "Write unit tests in tests/repositories/UserRepository.test.ts",
      "Run npm test - verify UserRepository tests pass"
    ],
    "passes": false
  }
]
```
```

**Good task characteristics:**
- ✅ Clear, specific description
- ✅ 5-15 minutes of focused work
- ✅ Explicit verification step
- ✅ Lists specific files to create/modify
- ❌ Avoid: "Implement everything" (too vague)
- ❌ Avoid: "Add one import" (too small)

### 4. Customize the Prompt (Optional)

Edit `prompt.md` to add project-specific guidance:

```markdown
## Project Context
- TypeScript Node.js API using Express and PostgreSQL
- Follow existing patterns in src/repositories/ and src/services/
- Use Zod for validation

## Coding Standards
- Add JSDoc comments for public functions
- Prefer async/await over .then() chains

## Testing Requirements
- Write unit tests for all new functions
- Mock external dependencies (database, APIs)
```

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

**Cost:** Typically $0.05-$0.15 per iteration depending on context size.

**Tip:** Start conservative and run again if needed. Progress is saved.

```bash
ral run -m 5    # Run 5 iterations
cat activity.md # Check progress
ral run -m 5    # Continue where you left off
```

## Common Pitfalls and Solutions

| Pitfall | Solution |
|---------|----------|
| Tasks too large (>30 min) | Break into smaller tasks (<15 min each) |
| Unclear success criteria | Add explicit verification: "Run tests, verify X passes" |
| Missing dependencies | Include installation in task steps |
| Tests don't exist yet | Order tasks: implement → write tests → run tests |
| Context grows too large | Keep plan focused; completed tasks marked `passes: true` |
| Loop gets stuck on a task | Pause, fix manually or refine task steps, resume |

## Example Workflows

For detailed, real-world examples see [EXAMPLES.md](EXAMPLES.md):

1. **Building a New Feature from Scratch**: Complete workflow for implementing a notification system
2. **Refactoring Existing Code**: Systematic refactoring of error handling across an Express API
3. **Debugging and Fixing a Bug**: Structured investigation and fix for an intermittent cart bug

Quick example - Building a feature:
```bash
# 1. Create feature directory and spec
mkdir -p features/notifications
cd features/notifications
# Write spec.md with requirements

# 2. Generate plan with AI assistant
# "Please read @spec.md and generate a plan.md..."

# 3. Scaffold and run
cd ../..  # back to project root
ral scaffold -w features/notifications
ral run -w features/notifications -m 15

# 4. Review results
cat features/notifications/activity.md
git log --oneline
```

## Tips and Best Practices

### Writing Effective Plans

- **Task granularity**: Aim for 5-15 minute tasks
- **Clear steps**: Use action verbs, specify files, include verification
- **Verification**: Every task needs a "verify it works" step
- **Dependencies**: Order tasks properly (create before using)
- **Categories**: Use consistent categories: setup, implementation, refactoring, testing, verification, cleanup

### Customizing prompt.md

Add project-specific context, coding standards, and testing requirements. Keep it concise - the prompt is included in every iteration. Works with both Claude and Cursor runners.

### Using spec.md

For non-trivial features, write a spec.md and reference it with `@spec.md` in plan.md. Include:
- Requirements and constraints
- API contracts and data structures
- Examples and use cases
- Testing criteria

Benefits: separation of concerns, better context for Claude, easier to maintain.

### Cost Optimization

- Monitor cumulative cost output
- Keep context focused (smaller plan.md and prompt.md)
- Break large features into separate loops
- Typical feature: $0.50-$1.50 for 10 iterations

### Workflow Tips

1. **Start small**: First loop? Try 3-5 simple tasks
2. **Review frequently**: Check activity.md after iterations
3. **Use git effectively**: Each task = 1 commit, easy to review/revert
4. **Leverage AI for planning**: Let AI generate task breakdown, then review
5. **Parallel features**: Use different working directories for multiple features
6. **Document learnings**: activity.md captures insights, root causes, patterns

## Local Development Setup

For contributors working on the CLI itself:

### 1. Clone and Install

```bash
git clone <repository-url>
cd ralph-test
pnpm install
pnpm build
```

### 2. Make `ral` Command Available Globally

**Option 1: pnpm link (Recommended for Development)**

This creates a global symlink so `ral` works from anywhere and automatically picks up your local changes:

```bash
# From the project directory
cd /Users/Joel/src/ralph-test
pnpm build                    # Build first
pnpm link --global           # Create global symlink
```

**Verify it works:**
```bash
# Test from anywhere
cd ~/some-other-project
ral --version                # Should show version
ral scaffold                 # Should work!
```

**Development Workflow:**
When you make changes to the CLI:
1. Edit source files in `src/`
2. Run `pnpm build` to rebuild
3. Changes are immediately available (symlink points to updated `dist/index.js`)

**Unlink when done:**
```bash
pnpm unlink --global
```

**Option 2: Shell Alias**
```bash
# Add to .zshrc or .bashrc
alias ral='/absolute/path/to/ralph-test/dist/index.js'
```
Note: Requires manual rebuild after changes.

**Option 3: Add to PATH**
```bash
# Add to .zshrc or .bashrc
export PATH="/absolute/path/to/ralph-test/dist:$PATH"
```
Note: Requires manual rebuild after changes.

### 3. Development Commands

```bash
pnpm run lint                    # Lint code
pnpm run dev scaffold            # Run in dev mode
pnpm run dev run -m 10           # Dev mode with args
```

## Testing

```bash
pnpm test                        # Run all tests
pnpm run test:watch              # Watch mode
```

Test coverage: 66 tests across 9 test files covering file operations, commands, and utilities.

## Package Manager

This project uses **pnpm** for faster installs and efficient disk space usage.

## Ralph Loop Philosophy

- **Structured Planning**: Clear tasks with pass/fail states
- **Activity Logging**: Every change documented with verification
- **Incremental Progress**: One task at a time, git commit per task
- **Self-Verification**: AI tests its own work before marking complete
- **Cost Tracking**: Token usage tracked per-iteration and cumulatively (Claude runner)
- **Early Exit**: Completes when AI outputs `<promise>COMPLETE</promise>`
- **Multi-Backend Support**: Works with Claude CLI or Cursor CLI via ral.json configuration

## File Structure

```
my-project/
├── .claude/
│   └── settings.json       # Claude config (optional)
├── .mcp.json               # MCP server config (optional)
├── ral.json                # Runner configuration (optional, defaults to Claude)
├── activity.md             # Activity log (required for run)
├── plan.md                 # Project plan (required for run)
├── prompt.md               # Instructions (required for run)
├── spec.md                 # Specification (optional)
└── screenshots/            # Screenshots directory
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `pnpm test` to verify
5. Submit a pull request

## License

MIT

## Support

For issues or questions, visit the project repository.
