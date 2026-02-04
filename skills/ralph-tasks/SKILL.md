---
name: ralph-tasks
description: "Convert PRDs to tasks.json format for the Ralph autonomous agent system. Use when you have an existing PRD and need to convert it to Ralph's JSON format. Triggers on: convert this prd, turn this into ralph format, create tasks.json from this, ralph json."
user-invocable: true
---

# Ralph PRD Converter

Converts existing PRDs to the tasks.json format that Ralph uses for autonomous execution.

---

## The Job

Take a PRD (markdown file or text) and convert it to `tasks.json` in the feature folder (`features/<feature>/tasks.json`).

---

## Output Format

Convert each user story from the PRD into a task object. The output is an array of tasks:

```json
[
  {
    "category": "setup",
    "description": "[Task description - what needs to be accomplished]",
    "steps": [
      "Step 1: [Specific action to take]",
      "Step 2: [Specific action to take]",
      "Step 3: [Verification step - e.g., 'Run npm test to verify tests pass']",
      "Typecheck passes"
    ],
    "passes": false
  }
]
```

**Task Schema:**
- `category` (string): Task category (e.g., "setup", "implementation", "testing", "refactoring", "verification")
- `description` (string): Clear description of what to accomplish
- `steps` (array): Explicit steps to complete the task, ending with verification
- `passes` (boolean): Always `false` initially (CLI manages completion)

---

## Task Size: The Number One Rule

**Each task must be completable in ONE Ralph iteration (one context window).**

Ralph spawns a fresh instance per iteration with no memory of previous work. If a task is too big, the LLM runs out of context before finishing and produces broken code.

### Right-sized tasks:
- Add a database column and migration
- Add a UI component to an existing page
- Update a server action with new logic
- Add a filter dropdown to a list

### Too big (split these):
- "Build the entire dashboard" - Split into: schema, queries, UI components, filters
- "Add authentication" - Split into: schema, middleware, login UI, session handling
- "Refactor the API" - Split into one task per endpoint or pattern

**Rule of thumb:** If you cannot describe the change in 2-3 sentences, it is too big.

---

## Task Ordering: Dependencies First

Tasks execute in array order. Earlier tasks must not depend on later ones.

**Correct order:**
1. Schema/database changes (migrations)
2. Server actions / backend logic
3. UI components that use the backend
4. Dashboard/summary views that aggregate data

**Wrong order:**
1. UI component (depends on schema that does not exist yet)
2. Schema change

---

## Steps: Must Be Verifiable

Each step must be something Ralph can CHECK, not something vague. Convert acceptance criteria from PRD user stories into explicit steps.

### Good steps (verifiable):
- "Add `status` column to tasks table with default 'pending'"
- "Filter dropdown has options: All, Active, Completed"
- "Clicking delete shows confirmation dialog"
- "Run npm test to verify tests pass"
- "Typecheck passes"

### Bad steps (vague):
- "Works correctly"
- "User can do X easily"
- "Good UX"
- "Handles edge cases"

### Always include as final step:
```
"Typecheck passes"
```

For tasks with testable logic, also include:
```
"Run npm test to verify tests pass"
```

### For tasks that change UI, also include:
```
"Verify in browser using dev-browser skill"
```

Frontend tasks are NOT complete until visually verified. Ralph will use the dev-browser skill to navigate to the page, interact with the UI, and confirm changes work.

---

## Conversion Rules

1. **Each user story becomes one task object** in the array
2. **Category**: Determine from story type (setup, implementation, testing, refactoring, verification)
3. **Description**: Use the story title or a clear summary of what needs to be accomplished
4. **Steps**: Convert acceptance criteria into explicit steps, ending with verification
5. **Order**: Place tasks in dependency order (schema → backend → UI → verification)
6. **All tasks**: `passes: false` initially (CLI manages completion)
7. **Always add**: "Typecheck passes" as the final step for every task

---

## Splitting Large PRDs

If a PRD has big features, split them into multiple tasks:

**Original:**
> "Add user notification system"

**Split into:**
1. Add notifications table to database
2. Create notification service for sending notifications
3. Add notification bell icon to header
4. Create notification dropdown panel
5. Add mark-as-read functionality
6. Add notification preferences page

Each is one focused change that can be completed and verified independently.

---

## Example

**Input PRD:**
```markdown
# Task Status Feature

Add ability to mark tasks with different statuses.

## User Stories

### US-001: Add status field to tasks table
**Description:** As a developer, I need to store task status in the database.

**Acceptance Criteria:**
- Add status column: 'pending' | 'in_progress' | 'done' (default 'pending')
- Generate and run migration successfully
- Typecheck passes

### US-002: Display status badge on task cards
**Description:** As a user, I want to see task status at a glance.

**Acceptance Criteria:**
- Each task card shows colored status badge
- Badge colors: gray=pending, blue=in_progress, green=done
- Typecheck passes
- Verify in browser using dev-browser skill
```

**Output tasks.json:**
```json
[
  {
    "category": "setup",
    "description": "Add status field to tasks table",
    "steps": [
      "Add status column to tasks table: 'pending' | 'in_progress' | 'done' (default 'pending')",
      "Generate and run migration successfully",
      "Typecheck passes"
    ],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Display status badge on task cards",
    "steps": [
      "Each task card shows colored status badge",
      "Badge colors: gray=pending, blue=in_progress, green=done",
      "Typecheck passes",
      "Verify in browser using dev-browser skill"
    ],
    "passes": false
  }
]
```

---

## Output Location

Save `tasks.json` to the feature folder: `features/<feature>/tasks.json`

If the feature folder doesn't exist, create it. The plan.md should already be in the same folder from the PRD skill.

---

## Checklist Before Saving

Before writing tasks.json, verify:

- [ ] Each task is completable in one iteration (small enough)
- [ ] Tasks are ordered by dependency (schema to backend to UI)
- [ ] Every task has "Typecheck passes" as final step
- [ ] UI tasks have "Verify in browser using dev-browser skill" as step
- [ ] Steps are verifiable (not vague)
- [ ] No task depends on a later task
- [ ] Saved to `features/<feature>/tasks.json`
