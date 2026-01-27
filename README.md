# Ralph Loop CLI (`ral`)

A TypeScript-based CLI tool for managing Claude-based development loops. The Ralph loop is a structured approach to AI-assisted development where Claude iteratively works on tasks following a plan until completion.

## Installation

```bash
npm install -g ral
```

Or use directly with `npx`:

```bash
npx ral <command>
```

## Local Development Setup

For contributors or coworkers who want to work on the CLI itself:

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ralph-test

# Install dependencies
pnpm install

# Build the project
pnpm build
```

### 2. Make `ral` Command Available

After building, choose one of these options to use the `ral` command globally:

**Option 1: pnpm link (Recommended)**
```bash
pnpm link --global
```
One command that auto-updates when you rebuild. Run from the project directory.

**Option 2: Shell Alias**
```bash
# Add to your .zshrc or .bashrc
alias ral='/absolute/path/to/ralph-test/dist/index.js'
```
Simple and explicit. Replace with your actual path to the project.

**Option 3: Add to PATH**
```bash
# Add to your .zshrc or .bashrc
export PATH="/absolute/path/to/ralph-test/dist:$PATH"
```
Makes the command available system-wide. Replace with your actual path.

After making changes to the code, rebuild with `pnpm build` and the `ral` command will use the updated code (Option 1 handles this automatically).

**Note:** Once published to npm, you can install globally with `npm install -g ral`.

### Development Commands

```bash
# Lint code
pnpm run lint

# Run in development mode (no -- needed with pnpm)
pnpm run dev <command>

# Examples:
pnpm run dev scaffold -w ./features/my-feature
pnpm run dev run -w ./features/my-feature -m 10
pnpm run dev create-settings
```

## Prerequisites

- Node.js 18+
- Claude CLI installed and configured (`npm install -g @anthropic-ai/claude`)
- Valid Anthropic API key configured for Claude CLI

## Package Manager

This project uses **pnpm** for package management and running scripts, which provides faster installs and efficient disk space usage with content-addressable storage.

## Commands

### `ral create-settings`

Generate configuration files for Claude and MCP (Model Context Protocol) settings.

**Usage:**
```bash
ral create-settings [options]
```

**Options:**
- `-w, --working-directory <path>` - Target directory for settings files (default: current directory)
- `-f, --force` - Overwrite existing files if they exist

**Created Files:**
- `.claude/settings.json` - Claude configuration with MCP filesystem server
- `.mcp.json` - MCP server configuration

**Examples:**
```bash
# Create settings in current directory
ral create-settings

# Create settings in specific directory
ral create-settings -w ./my-project

# Overwrite existing settings files
ral create-settings -f
```

---

### `ral scaffold`

Generate the Ralph loop file structure with starter templates.

**Usage:**
```bash
ral scaffold [options]
```

**Options:**
- `-w, --working-directory <path>` - Target directory for scaffold files (default: current directory)
- `-f, --force` - Overwrite existing files if they exist

**Created Files:**
- `activity.md` - Activity log for tracking what the agent accomplishes each iteration
- `plan.md` - Project plan with structured task list
- `prompt.md` - Instructions for Claude to follow during the loop
- `screenshots/` - Directory for storing screenshots

**Examples:**
```bash
# Scaffold in current directory
ral scaffold

# Scaffold in new project directory
ral scaffold -w ./my-new-project

# Overwrite existing scaffold files
ral scaffold -f
```

---

### `ral run`

Execute the Ralph loop by repeatedly calling Claude with your prompt until completion or max iterations.

**Usage:**
```bash
ral run -m <iterations> [options]
```

**Options:**
- `-m, --max-iterations <number>` - Maximum number of iterations (required)
- `-w, --working-directory <path>` - Working directory containing loop files (default: current directory)

**Required Files:**
- `plan.md` - Project plan with tasks
- `prompt.md` - Instructions for Claude
- `activity.md` - Activity log

**Behavior:**
- Runs Claude CLI with your prompt file for up to `max-iterations` times
- Tracks and displays per-iteration and cumulative token usage and costs
- Exits with code 0 if Claude outputs `<promise>COMPLETE</promise>`
- Exits with code 1 if max iterations reached without completion

**Examples:**
```bash
# Run loop for up to 10 iterations
ral run -m 10

# Run loop in specific directory
ral run -m 5 -w ./my-project

# Typical workflow
ral scaffold -w ./my-project
cd ./my-project
# Edit plan.md and prompt.md
ral run -m 20

# Feature development workflow - run from project root, point at feature folder
# Claude runs in project root (can edit source files), but @ references point to feature folder
ral scaffold -w features/auth
ral run -w features/auth -m 10

# Multiple features in parallel
ral scaffold -w features/api-v2
ral scaffold -w features/dashboard
ral run -w features/api-v2 -m 5
ral run -w features/dashboard -m 5
```

**Output:**
```
Iteration 1/10
Input tokens: 15234
Output tokens: 2341
Cache read tokens: 0
Cost this iteration: $0.123
Cumulative cost: $0.123

Iteration 2/10
...
```

## Typical Workflow

1. **Create a new project**
   ```bash
   mkdir my-ai-project
   cd my-ai-project
   ```

2. **Scaffold the Ralph loop structure**
   ```bash
   ral scaffold
   ```

3. **Configure Claude and MCP (optional)**
   ```bash
   ral create-settings
   ```

4. **Edit your project plan**
   - Open `plan.md` and define your tasks in the JSON structure
   - Each task should have: category, description, steps, and `passes: false`

5. **Customize the prompt**
   - Edit `prompt.md` with specific instructions for Claude
   - The default prompt instructs Claude to:
     - Read activity.md to understand current state
     - Find next task with `passes: false` in plan.md
     - Complete all steps for that task
     - Verify the task works
     - Update activity.md with what was done
     - Change task's `passes` to `true` in plan.md
     - Make a git commit

6. **Run the loop**
   ```bash
   ral run -m 20
   ```

7. **Monitor progress**
   - Check `activity.md` for detailed logs of what Claude accomplished
   - Review `plan.md` to see which tasks have `passes: true`
   - Examine git commits to see incremental changes

## Writing a Spec (spec.md)

Before creating your plan, consider writing a `spec.md` file to serve as a comprehensive specification document for your project or feature. This acts as a Product Requirements Document (PRD) that describes what you're building.

### Purpose

The spec.md file provides detailed context that Claude needs to complete tasks effectively, while keeping plan.md focused on the task breakdown. By referencing `@spec.md` in your plan.md or prompt.md, Claude receives the full requirements context without cluttering the task list.

### What to Include in a Spec

Your spec.md should contain:

- **Project overview**: High-level description of what you're building
- **Requirements**: Functional and non-functional requirements
- **Constraints**: Technical limitations, dependencies, or standards to follow
- **API contracts**: Expected interfaces, function signatures, or data structures
- **Examples**: Sample inputs/outputs, use cases, or user flows
- **Technical details**: Architecture decisions, libraries to use, coding patterns
- **Testing criteria**: How to verify the implementation works

### Example Spec Structure

```markdown
## Project Overview
Brief description of the feature or project

## Requirements
- Must support X, Y, and Z
- Should integrate with existing A component
- Performance: Must handle N requests per second

## Technical Constraints
- Use TypeScript with strict mode
- Follow existing codebase patterns
- Dependencies: Prefer well-known libraries, minimize new dependencies

## API Design
```typescript
interface MyFeature {
  doSomething(input: string): Promise<Result>
}
```

## Examples
```typescript
// Expected usage
const result = await feature.doSomething("input")
// result should be { success: true, data: ... }
```

## Testing & Verification
- Unit tests must pass
- Integration tests for X scenario
- Manual verification: Run Y and check Z
```

### Using the Spec with Your Plan

Reference the spec in your plan.md using the `@` syntax:

```markdown
# Project Plan

## Project Overview

Building a new authentication system for the application.

@spec.md

---

## Task List
...
```

This pattern ensures:
- **plan.md stays focused** on task breakdown and execution steps
- **spec.md holds the detailed requirements** that inform how tasks should be completed
- **Claude has full context** when working on each task
- **Requirements are centralized** and easy to update without modifying tasks

### Benefits

- **Separation of concerns**: Requirements (spec) vs. execution plan (tasks)
- **Better context**: Claude understands the "why" behind each task
- **Easier maintenance**: Update requirements once in spec.md instead of across multiple tasks
- **Clearer communication**: Team members can review spec.md to understand the feature
- **Reusability**: Same spec can inform multiple plan iterations or approaches

## Setting Up Your Plan

Once you have your spec (or a clear idea of what you want to build), you need to create a `plan.md` file that breaks down the work into actionable tasks. While you can write this by hand, using an AI assistant to help generate the task breakdown is highly effective.

### AI-Assisted Plan Generation

Rather than manually creating every task and step, leverage an AI agent (Claude, ChatGPT, or similar) to help translate your requirements into a structured plan. This approach:

- Helps identify tasks you might overlook
- Suggests logical task ordering and dependencies
- Creates consistent task descriptions and verification steps
- Saves time on the initial planning phase

### Example Prompts for Generating Plans

When asking an AI to generate your plan, provide clear context:

**From a spec file:**
```
I have a spec.md file that describes a new feature I want to build.
Please read @spec.md and generate a plan.md with a task list in the required JSON format.
Break down the implementation into 5-8 tasks, each with clear steps and verification criteria.
```

**From requirements:**
```
I need to add user authentication to my web app with the following requirements:
- JWT-based authentication
- Login and registration endpoints
- Password hashing with bcrypt
- Protected route middleware
- Unit tests for all components

Please generate a plan.md file with tasks broken down into implementable steps.
Each task should be verifiable and include specific steps for implementation and testing.
```

**For refactoring:**
```
I want to refactor the error handling in my Express API to use a centralized error handler.
The refactoring should:
- Create a custom error class
- Add error handling middleware
- Update all routes to use the new pattern
- Ensure error responses are consistent

Generate a plan.md with tasks that can be completed one at a time.
```

### Reviewing and Refining the Generated Plan

IMPORTANT: Always manually review and refine the AI-generated plan before running the Ralph loop.

**Check for:**
- **Task clarity**: Each task description should be specific and unambiguous
- **Step completeness**: Steps should cover implementation AND verification
- **Realistic scope**: Tasks shouldn't be too large (multiple files, complex changes) or too small (single line changes)
- **Proper ordering**: Dependencies should be respected (e.g., create function before writing tests for it)
- **Verification criteria**: Each task should specify how to verify it works (run tests, check build, manual verification)

**Good task example:**
```json
{
  "category": "implementation",
  "description": "Create JWT authentication middleware",
  "steps": [
    "Install jsonwebtoken and @types/jsonwebtoken dependencies",
    "Create middleware/auth.ts file",
    "Implement verifyToken middleware function that validates JWT from Authorization header",
    "Add error handling for expired, invalid, or missing tokens",
    "Export middleware for use in route protection",
    "Write unit tests in tests/middleware/auth.test.ts",
    "Run npm test to verify tests pass"
  ],
  "passes": false
}
```

**Too vague (bad example):**
```json
{
  "description": "Add authentication",
  "steps": ["Implement auth"],
  "passes": false
}
```

**Too granular (bad example):**
```json
{
  "description": "Import jsonwebtoken on line 1 of auth.ts",
  "steps": ["Add import statement"],
  "passes": false
}
```

### Tips for Effective Plans

**Task Granularity:**
- Aim for tasks that take 5-15 minutes for an experienced developer
- If a task feels like it would take more than 30 minutes, break it down further
- Combine trivial changes (like adding one import) into larger, cohesive tasks

**Clear Verification Steps:**
- Always include a verification step in the task (run tests, check build, manual test)
- Be specific: "Run npm test and verify UserService tests pass" rather than "Test the code"
- Include both automated checks (tests, linting) and manual verification when needed

**Writing Good Task Descriptions:**
- Use action verbs: "Implement", "Create", "Refactor", "Add", "Update"
- Be specific about what changes: "Create UserRepository class" not "Add database stuff"
- Include context when helpful: "Update login route to use JWT middleware" clarifies the scope

**Handling Dependencies:**
- Order tasks so dependencies come first (e.g., create utility functions before using them)
- Make dependencies explicit in task steps: "Requires auth middleware from previous task"
- Consider creating foundational tasks first (types, interfaces, base classes)

### The plan.md Format

Your plan.md should follow this structure:

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
    "description": "Task description here",
    "steps": [
      "Step 1 with specific action",
      "Step 2 with specific action",
      "Verification: Run tests and check output"
    ],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Next task",
    "steps": ["..."],
    "passes": false
  }
]
```
```

The `passes` field starts as `false` and Claude will change it to `true` when the task is complete.

## Working Directory Behavior

The `-w, --working-directory` option allows you to organize multiple Ralph loops within your project:

**How it works:**
- Claude always runs from the **project root** (so it can edit source files)
- The working directory specifies where loop files (`plan.md`, `activity.md`, `prompt.md`) are located
- File references with `@` in your prompt (like `@plan.md`) are automatically resolved relative to the working directory

**Use case - Feature development:**
```bash
# Project structure:
my-app/
├── src/               # Source code
├── features/
│   ├── auth/
│   │   ├── plan.md
│   │   ├── activity.md
│   │   └── prompt.md
│   └── dashboard/
│       ├── plan.md
│       ├── activity.md
│       └── prompt.md

# Run from project root, but use feature-specific loop files
cd my-app
ral run -w features/auth -m 10

# prompt.md contains: @plan.md @activity.md
# Claude receives: @features/auth/plan.md @features/auth/activity.md
# Claude can still edit files in src/ because it runs from project root
```

This pattern lets you:
- Keep feature-specific plans and logs organized in subdirectories
- Run multiple Ralph loops in parallel for different features
- Have Claude work on the entire codebase while tracking progress per-feature

## Ralph Loop Philosophy

The Ralph loop is designed for iterative, autonomous AI development:

- **Structured Planning**: Tasks are broken down into clear steps with pass/fail states
- **Activity Logging**: Every change is documented with verification results
- **Incremental Progress**: One task at a time, with git commits for each
- **Self-Verification**: Claude tests its own work before marking tasks complete
- **Cost Tracking**: Token usage and costs are tracked per-iteration and cumulatively
- **Early Exit**: Loop completes when Claude outputs the completion promise

## File Structure

```
my-project/
├── .claude/
│   └── settings.json       # Claude configuration (optional)
├── .mcp.json               # MCP server config (optional)
├── activity.md             # Activity log (required for run)
├── plan.md                 # Project plan (required for run)
├── prompt.md               # Claude instructions (required for run)
└── screenshots/            # Screenshots directory
```

## Error Handling

The CLI provides clear error messages and suggestions:

- **Missing files**: If required files are missing for `ral run`, you'll get a helpful message suggesting to run `ral scaffold`
- **Invalid directory**: Working directory validation ensures paths exist
- **Claude CLI errors**: Errors from the Claude CLI are caught and reported clearly
- **JSON parsing**: Invalid JSON responses from Claude are handled gracefully

## Testing

The project includes comprehensive unit tests using Vitest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:run
```

Test coverage includes:
- File operations and utilities (21 tests)
- create-settings command (6 tests)
- scaffold command (7 tests)
- run command (7 tests)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm test` to verify all tests pass
5. Submit a pull request

## License

MIT

## Support

For issues, questions, or contributions, please visit the project repository.
