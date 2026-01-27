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

## Example Workflows

### Building a New Feature from Scratch

This example demonstrates using Ralph to build a complete new feature: a user notification system.

**Scenario:** You want to add a notification system to your Node.js application that can send emails and in-app notifications to users.

#### Step 1: Create the Feature Directory

```bash
# From your project root
mkdir -p features/notifications
cd features/notifications
```

#### Step 2: Write the Spec

Create `spec.md` with your requirements:

```markdown
# User Notification System

## Project Overview

Build a flexible notification system that supports multiple delivery methods (email, in-app) and can be easily extended for future notification types (SMS, push).

## Requirements

- Send notifications via email using nodemailer
- Store in-app notifications in database (PostgreSQL)
- Mark notifications as read/unread
- Support notification templates
- Handle notification preferences per user
- Queue notifications for async delivery

## Technical Constraints

- Use TypeScript with strict mode
- Follow repository pattern for data access
- Use existing database connection pool
- Minimize dependencies (only add nodemailer)
- Must work with existing User model

## API Design

```typescript
interface NotificationService {
  send(userId: string, notification: NotificationInput): Promise<void>
  markAsRead(notificationId: string): Promise<void>
  getUserNotifications(userId: string): Promise<Notification[]>
}

interface NotificationInput {
  type: 'email' | 'in-app'
  subject: string
  body: string
  template?: string
}
```

## Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing & Verification

- Unit tests for NotificationService (mock email sending)
- Unit tests for NotificationRepository (database operations)
- Integration test: Create notification and verify in database
- Manual test: Send test email and verify delivery
- Build must complete with no TypeScript errors
```

#### Step 3: Generate the Plan

Ask an AI assistant to create your plan:

```
Please read @spec.md and generate a plan.md file for implementing this notification system.
Break it down into 6-10 tasks with specific, actionable steps.
Include verification steps for each task.
Use the Ralph loop plan.md format with JSON task list.
```

#### Step 4: Review and Customize the Generated Plan

Edit `plan.md` to ensure tasks are appropriately sized:

```markdown
# Project Plan

## Project Overview

Implement a user notification system with email and in-app delivery.

@spec.md

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Set up database schema and install dependencies",
    "steps": [
      "Install nodemailer and @types/nodemailer dependencies",
      "Create database migration file for notifications table",
      "Run migration to create notifications table in development database",
      "Verify table exists with: psql -c '\\d notifications'",
      "Run npm run build to ensure no TypeScript errors"
    ],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Create Notification entity and types",
    "steps": [
      "Create src/entities/Notification.ts with Notification interface matching database schema",
      "Create src/types/notifications.ts with NotificationInput, NotificationType types",
      "Add type exports to src/types/index.ts",
      "Run npm run build and fix any TypeScript errors",
      "Verify types are properly exported"
    ],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Implement NotificationRepository for database operations",
    "steps": [
      "Create src/repositories/NotificationRepository.ts",
      "Implement create() method to insert notifications into database",
      "Implement findByUserId() to get user's notifications",
      "Implement markAsRead() to update read status",
      "Add proper error handling and database connection usage",
      "Write unit tests in tests/repositories/NotificationRepository.test.ts",
      "Run npm test and verify NotificationRepository tests pass"
    ],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Create EmailService for sending emails",
    "steps": [
      "Create src/services/EmailService.ts",
      "Configure nodemailer transport with SMTP settings from environment variables",
      "Implement sendEmail() method with error handling",
      "Add email template rendering support",
      "Write unit tests with mocked nodemailer in tests/services/EmailService.test.ts",
      "Run npm test and verify EmailService tests pass"
    ],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Implement NotificationService orchestration layer",
    "steps": [
      "Create src/services/NotificationService.ts",
      "Implement send() method that handles both email and in-app notifications",
      "Use NotificationRepository for in-app notifications",
      "Use EmailService for email notifications",
      "Implement getUserNotifications() and markAsRead() methods",
      "Add proper error handling and logging",
      "Write unit tests in tests/services/NotificationService.test.ts",
      "Run npm test and verify NotificationService tests pass"
    ],
    "passes": false
  },
  {
    "category": "integration",
    "description": "Add API routes for notifications",
    "steps": [
      "Create src/routes/notifications.ts",
      "Add POST /api/notifications route to send notification",
      "Add GET /api/notifications route to get user notifications",
      "Add PATCH /api/notifications/:id/read route to mark as read",
      "Add authentication middleware to protect routes",
      "Register routes in src/app.ts",
      "Run npm run build and verify no TypeScript errors"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write integration tests",
    "steps": [
      "Create tests/integration/notifications.test.ts",
      "Test creating in-app notification and verifying it's stored in database",
      "Test sending email notification (mock SMTP)",
      "Test retrieving user notifications",
      "Test marking notification as read",
      "Run npm test and verify all integration tests pass"
    ],
    "passes": false
  },
  {
    "category": "verification",
    "description": "Manual testing and documentation",
    "steps": [
      "Start the application in development mode",
      "Send a test email notification via API and verify email delivery",
      "Send a test in-app notification and verify it appears in GET endpoint",
      "Test marking notification as read",
      "Update API documentation with new notification endpoints",
      "Run npm run build and npm test to verify everything still works"
    ],
    "passes": false
  }
]
```
```

#### Step 5: Customize the Prompt (Optional)

The default `prompt.md` works well, but you can add feature-specific instructions:

```bash
ral scaffold -w features/notifications
```

Edit `features/notifications/prompt.md` to add:

```markdown
## Additional Instructions

- Follow the existing code style in src/repositories/ and src/services/
- Use the connection pool from src/database/pool.ts
- For email configuration, use environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- Add [debug] prefix to debug log statements
- Write tests that can run without external dependencies (mock email sending)
```

#### Step 6: Run the Loop

```bash
# From project root
ral run -w features/notifications -m 15
```

#### Expected Output

```
Iteration 1/15
[Claude sets up database schema and installs nodemailer]
Input tokens: 12453
Output tokens: 1876
Cost this iteration: $0.089
Cumulative cost: $0.089

Iteration 2/15
[Claude creates Notification entity and types]
Input tokens: 14231
Output tokens: 1234
Cost this iteration: $0.078
Cumulative cost: $0.167

...

Iteration 8/15
[Claude completes final verification task]
Input tokens: 18492
Output tokens: 987
Cost this iteration: $0.091
Cumulative cost: $0.634

<promise>COMPLETE</promise>

✓ Ralph loop completed successfully!
Total iterations: 8
Total cost: $0.634
```

#### Step 7: Review the Results

After completion, check:

- `features/notifications/activity.md` - Detailed log of what was implemented
- `git log` - Incremental commits for each task
- Run `npm test` - All tests should pass
- Check `src/` - New files: entities/Notification.ts, repositories/NotificationRepository.ts, services/NotificationService.ts, services/EmailService.ts, routes/notifications.ts

#### What This Example Demonstrates

- **Complete workflow**: From requirements to working implementation
- **Feature isolation**: Using working directory for feature-specific loop files
- **AI-assisted planning**: Letting AI help break down the spec into tasks
- **Incremental development**: Each task builds on previous ones
- **Self-verification**: Claude tests its own work at each step
- **Cost tracking**: See exactly how much the implementation costs
- **Activity logging**: Full audit trail of what was built and how

#### Tips for This Workflow

- Start with a detailed spec.md - the better your spec, the better the plan
- Review the AI-generated plan carefully before running the loop
- Set max-iterations higher than you think you need (you can always stop early)
- Check activity.md between iterations if you want to monitor progress
- Use git to review changes incrementally
- If a task fails, you can adjust plan.md and resume

### Refactoring Existing Code

This example demonstrates using Ralph to refactor existing code with dependent tasks that build on each other.

**Scenario:** You have an Express.js API with inconsistent error handling scattered across route handlers. You want to refactor it to use a centralized error handling system.

#### Step 1: Create the Feature Directory

```bash
# From your project root
mkdir -p features/error-handling-refactor
cd features/error-handling-refactor
```

#### Step 2: Write the Spec

Create `spec.md` describing the refactoring goals:

```markdown
# Centralized Error Handling Refactor

## Project Overview

Refactor the Express API to use a consistent, centralized error handling pattern with custom error classes and middleware.

## Current State

- Error handling is inconsistent across routes
- Some routes send raw error messages
- Error responses have different formats
- Stack traces sometimes leak to clients
- No distinction between operational vs programmer errors

## Target State

- Custom AppError class for operational errors
- Centralized error handling middleware
- Consistent error response format
- Proper logging of errors
- Stack traces only in development mode
- All routes use standardized error handling

## Technical Approach

### Custom Error Class

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}
```

### Error Response Format

```typescript
interface ErrorResponse {
  status: 'error'
  statusCode: number
  message: string
  stack?: string  // only in development
}
```

### Middleware Signature

```typescript
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void
```

## Migration Strategy

1. Create custom error class and middleware
2. Update one route file at a time
3. Test each route after migration
4. Remove old error handling code
5. Update tests to match new error format

## Testing & Verification

- Unit tests for AppError class
- Unit tests for error middleware
- Integration tests for error responses
- Manual testing of error scenarios
- All existing tests should still pass
- Build must complete with no TypeScript errors

## Files to Modify

- Create: src/errors/AppError.ts
- Create: src/middleware/errorHandler.ts
- Update: src/routes/users.ts (10 error handling points)
- Update: src/routes/posts.ts (8 error handling points)
- Update: src/routes/comments.ts (6 error handling points)
- Update: src/app.ts (register middleware)
- Update: tests/* (update assertions for new error format)
```

#### Step 3: Generate the Plan

Ask an AI assistant to create a refactoring plan:

```
Please read @spec.md and generate a plan.md for this error handling refactor.
Break it down into tasks that can be completed sequentially.
Each task should refactor a manageable chunk and include verification.
Make sure tasks have proper dependencies (e.g., create error classes before using them).
```

#### Step 4: Review the Generated Plan

Edit `plan.md` to ensure proper task ordering:

```markdown
# Project Plan

## Project Overview

Refactor Express API to use centralized error handling with custom error classes.

@spec.md

---

## Task List

```json
[
  {
    "category": "implementation",
    "description": "Create AppError custom error class",
    "steps": [
      "Create src/errors/AppError.ts file",
      "Implement AppError class extending Error with statusCode, message, and isOperational properties",
      "Add proper TypeScript typing and Error prototype setup",
      "Create error factory functions for common cases: badRequest(), notFound(), unauthorized(), etc.",
      "Write unit tests in tests/errors/AppError.test.ts",
      "Run npm test and verify AppError tests pass",
      "Run npm run build and verify no TypeScript errors"
    ],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Create centralized error handling middleware",
    "steps": [
      "Create src/middleware/errorHandler.ts file",
      "Implement errorHandler function with Express error middleware signature",
      "Handle AppError instances by sending formatted JSON response",
      "Handle unknown errors with 500 status and generic message",
      "Include stack traces only when NODE_ENV !== 'production'",
      "Add error logging with appropriate log levels",
      "Write unit tests in tests/middleware/errorHandler.test.ts",
      "Run npm test and verify errorHandler tests pass"
    ],
    "passes": false
  },
  {
    "category": "refactoring",
    "description": "Refactor users.ts routes to use AppError",
    "steps": [
      "Open src/routes/users.ts and identify all error handling points",
      "Replace res.status().json() error responses with throw new AppError()",
      "Use appropriate error factory functions (notFound, badRequest, etc.)",
      "Remove try-catch blocks that just pass errors to next() (let async errors bubble)",
      "For async routes, ensure errors properly propagate to error middleware",
      "Update tests/routes/users.test.ts to expect new error response format",
      "Run npm test and verify users route tests pass",
      "Manual test: curl user endpoints and verify error responses"
    ],
    "passes": false
  },
  {
    "category": "refactoring",
    "description": "Refactor posts.ts routes to use AppError",
    "steps": [
      "Open src/routes/posts.ts and identify all error handling points",
      "Replace existing error handling with AppError throws",
      "Use appropriate error factory functions",
      "Update tests/routes/posts.test.ts for new error format",
      "Run npm test and verify posts route tests pass",
      "Manual test: curl post endpoints and verify error responses"
    ],
    "passes": false
  },
  {
    "category": "refactoring",
    "description": "Refactor comments.ts routes to use AppError",
    "steps": [
      "Open src/routes/comments.ts and identify all error handling points",
      "Replace existing error handling with AppError throws",
      "Use appropriate error factory functions",
      "Update tests/routes/comments.test.ts for new error format",
      "Run npm test and verify comments route tests pass",
      "Manual test: curl comment endpoints and verify error responses"
    ],
    "passes": false
  },
  {
    "category": "integration",
    "description": "Register error middleware in app.ts and remove old error handling",
    "steps": [
      "Open src/app.ts",
      "Import errorHandler middleware",
      "Register errorHandler as the last middleware (after all routes)",
      "Remove any old error handling middleware or logic",
      "Verify middleware is registered after route handlers but before app.listen",
      "Run npm run build and verify no TypeScript errors"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Run full test suite and integration testing",
    "steps": [
      "Run npm test and verify ALL tests pass (not just new tests)",
      "Check test output for any tests that were skipped or failed",
      "Run npm run build and verify no TypeScript errors or warnings",
      "Start application in development mode: npm run dev",
      "Test error scenarios manually:",
      "  - GET /api/users/invalid-id (should return 404 with proper format)",
      "  - POST /api/posts with invalid data (should return 400)",
      "  - GET /api/protected without auth (should return 401)",
      "Verify error responses match ErrorResponse format from spec",
      "Verify stack traces appear in development but not in production mode"
    ],
    "passes": false
  },
  {
    "category": "cleanup",
    "description": "Clean up old error handling code and update documentation",
    "steps": [
      "Search codebase for any remaining old-style error handling patterns",
      "Remove any unused error handling utilities or functions",
      "Update API documentation to reflect new error response format",
      "Add JSDoc comments to AppError class and errorHandler middleware",
      "Run npm run build one final time to verify everything compiles",
      "Run npm test to ensure all tests still pass"
    ],
    "passes": false
  }
]
```
```

#### Step 5: Scaffold and Customize

```bash
ral scaffold -w features/error-handling-refactor
```

The default prompt works well for refactoring, but you could add specific guidance:

```markdown
## Additional Instructions

- Preserve existing functionality - only change error handling mechanism
- Keep the same HTTP status codes that were used before
- When refactoring routes, update one route handler at a time
- Make sure async errors properly propagate (use express-async-errors or wrap handlers)
- Test each file after refactoring before moving to the next
```

#### Step 6: Run the Loop

```bash
# From project root
ral run -w features/error-handling-refactor -m 12
```

#### Expected Output

```
Iteration 1/12
[Claude creates AppError class]
Cost this iteration: $0.067

Iteration 2/12
[Claude creates errorHandler middleware]
Cost this iteration: $0.071

Iteration 3/12
[Claude refactors users.ts routes]
Cost this iteration: $0.083

...

Iteration 8/12
[Claude completes cleanup and documentation]
Cost this iteration: $0.059
Cumulative cost: $0.523

<promise>COMPLETE</promise>

✓ Ralph loop completed successfully!
Total iterations: 8
Total cost: $0.523
```

#### Step 7: Review the Changes

Check the refactoring results:

```bash
# View what changed
git log --oneline -8

# Review the diff for a specific commit
git show HEAD~3

# Check that tests pass
npm test

# Verify build
npm run build
```

#### What This Example Demonstrates

- **Sequential dependencies**: Tasks build on each other (create classes → create middleware → use in routes)
- **Incremental refactoring**: One route file at a time, not everything at once
- **Test-driven changes**: Update tests alongside code changes
- **Risk mitigation**: Verify each step before moving to the next
- **Preserve functionality**: Change implementation without breaking existing behavior
- **Complete migration**: From initial setup through cleanup and documentation

#### Tips for Refactoring with Ralph

- **Break it down**: Don't try to refactor the entire codebase in one task
- **Dependencies matter**: Order tasks so foundational changes come first
- **Test continuously**: Verify tests pass after each task, not just at the end
- **One file at a time**: When updating multiple files, make each file a separate task
- **Keep it working**: Each task should leave the codebase in a working state
- **Document the "why"**: Include context in the spec about why you're refactoring
- **Consider rollback**: Incremental git commits make it easy to undo if needed

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
