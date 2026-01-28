# Project Build - Activity Log

## Current Status
**Last Updated:** 2026-01-28
**Tasks Completed:** 4
**Current Task:** Task 4 complete - scaffold-json command implemented

---

## Session Log

### 2026-01-28 - Task 1: Extended AgentRunner to accept prompt content

**Task Description:** Extend AgentRunner to accept prompt content (string) in addition to prompt path (keep existing run behavior)

**Changes Made:**
1. Added `RunClaudeOptions` interface to `src/utils/claude-runner.ts` with three fields:
   - `promptPath?: string`
   - `promptContent?: string`
   - `workingDirectory: string`
2. Updated `AgentRunner` interface method signature from `runClaude(promptPath, workingDirectory)` to `runClaude(options: RunClaudeOptions)`
3. Updated `DefaultClaudeRunner.runClaude()` implementation:
   - Validates exactly one of promptPath or promptContent is provided
   - Reads from file if promptPath is provided
   - Uses promptContent directly if provided
   - Applies @ reference transformation to both cases
4. Updated `CursorRunner.runClaude()` implementation with the same logic
5. Updated `src/commands/run.ts` to call runner with new signature: `runner.runClaude({ promptPath, workingDirectory })`
6. Updated all unit tests in `src/utils/claude-runner.test.ts`:
   - Modified existing tests to use new options object signature
   - Added test for promptContent usage (verifies readFile is not called)
   - Added test for error when both promptPath and promptContent provided
   - Added test for error when neither provided
7. Updated all unit tests in `src/utils/cursor-runner.test.ts` with same changes
8. Updated `src/commands/run.test.ts` to call mockRunner with new signature

**Testing and Verification:**
- Ran `npm test` - all 102 tests passed across 11 test files
- Ran `npm run build` - TypeScript compilation successful with no errors
- Existing `run` command behavior preserved (backward compatible)
- New promptContent parameter works correctly and skips file reading
- @ reference transformation works for both promptPath and promptContent modes

**Dependencies:**
No new dependencies installed.

**Problems and Lessons:**
- None - implementation went smoothly
- Key insight: The validation logic (exactly one of promptPath or promptContent) prevents ambiguous cases and makes the API clear

### 2026-01-28 - Task 2: Extended @ reference rewriting to support .json files

**Task Description:** Extend @ reference rewriting to support .json files (in addition to .md)

**Changes Made:**
1. Updated `transformFileReferences` in `src/utils/claude-runner.ts`:
   - Changed regex from `/@(\S+\.md)/g` to `/@(\S+\.(?:md|json))/g`
   - Updated comment to reflect that both .md and .json files are transformed
2. Updated `transformFileReferences` in `src/utils/cursor-runner.ts`:
   - Applied the same regex change and comment update
3. Updated tests in `src/utils/claude-runner.test.ts`:
   - Modified existing test "should only transform .md file references" to "should transform .md and .json file references"
   - Updated test to verify both @config.json and @tasks.json are transformed
   - Added new test "should not transform @ references that are not .md or .json files"
   - Verified that package scopes (@anthropic/sdk), emails (@user@example.com), and other @ references are NOT transformed
4. Updated tests in `src/utils/cursor-runner.test.ts`:
   - Added new test "should transform .md and .json file references"
   - Added new test "should not transform @ references that are not .md or .json files"
   - Ensured consistent coverage with claude-runner tests

**Testing and Verification:**
- Ran `npm test` - all 105 tests passed (3 new tests added)
- Ran `npm run build` - TypeScript compilation successful with no errors
- Verified .md files are still transformed correctly
- Verified .json files are now transformed correctly
- Verified other @ references (package scopes, emails) are NOT transformed
- Regex pattern `(?:md|json)` correctly matches only .md and .json extensions

**Dependencies:**
No new dependencies installed.

**Problems and Lessons:**
- None - implementation went smoothly
- Key insight: Using non-capturing group `(?:md|json)` in regex keeps the pattern clean and avoids extra capture groups

### 2026-01-28 - Task 3: Added scaffold-json templates

**Task Description:** Add scaffold-json templates (plan details, tasks.json, prompt) embedded in code

**Changes Made:**
1. Added `PLAN_DETAILS_TEMPLATE` in `src/templates/index.ts`:
   - Markdown template for details-only plan.md (no embedded tasks)
   - Contains Project Overview and Additional Context sections
2. Added `TASKS_JSON_TEMPLATE` in `src/templates/index.ts`:
   - TypeScript array/object with example task structure
   - Will be serialized to tasks.json via JSON.stringify
   - Includes category, description, steps[], and passes boolean fields
3. Added `PROMPT_JSON_TEMPLATE` in `src/templates/index.ts`:
   - Markdown template for run-json workflow prompt
   - References @plan.md @activity.md @tasks.json
   - Explicitly instructs agent NOT to edit tasks.json (CLI owns that)
   - Requires <promise>success</promise> output for task completion
   - Includes placeholder for CLI to insert current task details
4. Created comprehensive test suite in `src/templates/index.test.ts`:
   - Tests that all templates are exported with correct types
   - Validates TASKS_JSON_TEMPLATE structure (category, description, steps, passes)
   - Verifies JSON serializability of TASKS_JSON_TEMPLATE
   - Checks that PROMPT_JSON_TEMPLATE includes required @ references
   - Confirms agent is instructed not to edit tasks.json
   - Validates success criteria section exists

**Testing and Verification:**
- Ran `npm test` - all 112 tests passed (7 new tests added)
- Ran `npm run build` - TypeScript compilation successful with no errors
- Verified PLAN_DETAILS_TEMPLATE is a valid markdown string
- Verified TASKS_JSON_TEMPLATE is a valid JS array that can be serialized to JSON
- Verified PROMPT_JSON_TEMPLATE contains all required @ references and instructions
- Templates follow the same embedding conventions as existing templates

**Dependencies:**
No new dependencies installed.

**Problems and Lessons:**
- None - implementation went smoothly
- Key insight: Storing TASKS_JSON_TEMPLATE as a JS object/array allows type checking and makes it easy to serialize with JSON.stringify(..., null, 2)
- Design decision: PROMPT_JSON_TEMPLATE explicitly tells the agent not to edit tasks.json, which prevents conflicts with the CLI's task management

### 2026-01-28 - Task 4: Implemented scaffold-json command

**Task Description:** Implement scaffold-json command to create plan.md (details), tasks.json (tasks), prompt.md, activity.md, screenshots/, ral.json

**Changes Made:**
1. Created `src/commands/scaffold-json.ts`:
   - Mirrored structure of existing `scaffold.ts` command
   - Created function that writes activity.md, plan.md (details-only using PLAN_DETAILS_TEMPLATE), tasks.json, prompt.md, ral.json, and screenshots/
   - Honored -w/--working-directory and -f/--force behaviors consistent with scaffold
   - Used JSON.stringify with 2-space indentation and trailing newline for tasks.json
2. Created comprehensive test suite in `src/commands/scaffold-json.test.ts`:
   - Added 11 tests covering all scaffold-json behaviors
   - Verified all files are created correctly (activity.md, plan.md, tasks.json, prompt.md, ral.json, screenshots/)
   - Verified plan.md contains details-only content (no embedded tasks)
   - Verified tasks.json is valid JSON array with required fields (category, description, steps, passes)
   - Verified tasks.json has trailing newline for consistent formatting
   - Verified prompt.md contains @tasks.json reference and instructions
   - Verified force behavior (skip vs overwrite)
   - Verified working directory behavior (explicit vs current directory)
   - Verified partial file creation when some files already exist

**Testing and Verification:**
- Ran `npm test -- scaffold-json.test.ts` - all 11 new tests passed
- Ran `npm test` - all 123 tests passed (added 11 new tests)
- Ran `npm run build` - TypeScript compilation successful with no errors
- Verified scaffold-json command structure matches existing scaffold command
- Verified plan.md uses PLAN_DETAILS_TEMPLATE (no embedded tasks)
- Verified tasks.json is properly formatted JSON with trailing newline
- Verified all file creation, force, and working directory behaviors work correctly

**Dependencies:**
No new dependencies installed.

**Problems and Lessons:**
- None - implementation went smoothly
- Key insight: Following the exact pattern of the existing scaffold.ts command made implementation straightforward and consistent
- Design decision: tasks.json serialization includes trailing newline for consistent git diffs and standard formatting

### 2026-01-28 - Task 5: Registered new CLI commands: scaffold-json and run-json

**Task Description:** Register new CLI commands: scaffold-json and run-json

**Changes Made:**
1. Updated `src/index.ts`:
   - Added import for `scaffoldJson` from './commands/scaffold-json.js'
   - Added import for `runJson` from './commands/run-json.js'
   - Registered `scaffold-json` command with description, -w/--working-directory and -f/--force options
   - Registered `run-json` command with description, -w/--working-directory and -m/--max-iterations options
   - Both commands follow the exact same pattern as existing scaffold and run commands
   - Error handling with try/catch and process.exit(1) matches existing patterns
2. Created stub for `src/commands/run-json.ts`:
   - Added `RunJsonOptions` interface with workingDirectory and maxIterations fields
   - Added `runJson` function that throws "not yet implemented" error
   - This stub allows the CLI to register the command and compile successfully
   - Full implementation will be completed in tasks 6 and 7

**Testing and Verification:**
- Ran `npm run build` - TypeScript compilation successful with no errors
- Ran `npm test` - all 123 tests passed
- Verified scaffold-json command is registered with correct flags (-w, -f)
- Verified run-json command is registered with correct flags (-w, -m)
- Verified existing commands (create-settings, scaffold, run) remain unchanged
- Command descriptions clearly differentiate between scaffold/run and scaffold-json/run-json workflows

**Dependencies:**
No new dependencies installed.

**Problems and Lessons:**
- None - implementation went smoothly
- Key insight: Creating a stub for run-json allows the command registration to compile while deferring implementation to the next tasks
- Design decision: Used consistent flag names across all commands for better UX (-w for working directory, -m for max iterations)

### 2026-01-28 - Task 6: Implemented run-json helpers

**Task Description:** Implement run-json helpers (tasks.json parsing/validation, selection, prompt builder, persistence)

**Changes Made:**
1. Extended `src/commands/run-json.ts` with comprehensive helper functions:
   - Added `Task` interface defining the task structure with required fields (category, description, steps, passes)
   - Created `loadTasks()` function for loading and validating tasks.json:
     - Validates JSON syntax and array structure
     - Validates each task has required fields: category (string), description (string), steps (array), passes (boolean)
     - Allows additional optional fields (e.g., id) for future extensions
   - Created `selectNextTask()` function implementing selection rule:
     - Picks first task in array order where passes !== true
     - Returns null when all tasks are complete
   - Created `markTaskComplete()` function implementing update rule:
     - Marks task as complete by array index (not by description matching)
     - Returns new array without mutating original
     - Preserves all other task properties
   - Created `buildPromptContent()` function for building prompt:
     - Reads prompt.md from working directory or uses PROMPT_JSON_TEMPLATE as fallback
     - Injects current task details (JSON, index, category, description, numbered steps list)
     - Replaces placeholder text with formatted task section
   - Created `saveTasks()` function for persisting tasks.json:
     - Uses JSON.stringify with 2-space indentation
     - Adds trailing newline for consistent git diffs
2. Created comprehensive test suite in `src/commands/run-json.test.ts`:
   - Created MockFileSystem class for testing file operations
   - Added 21 tests covering all helper functions and edge cases:
     - loadTasks: valid JSON, invalid JSON, not an array, missing fields, additional fields (7 tests)
     - selectNextTask: first incomplete, all complete, empty array, false vs !== true (4 tests)
     - markTaskComplete: mark by index, preserve properties, invalid index (3 tests)
     - buildPromptContent: with prompt.md, with fallback template, numbered steps (3 tests)
     - saveTasks: JSON formatting, trailing newline, preserve additional fields (2 tests)
   - Fixed initial import to use "vitest" instead of "@jest/globals" (project uses vitest)

**Testing and Verification:**
- Ran `npm test -- run-json.test.ts` - all 21 new tests passed
- Ran `npm test` - all 144 tests passed (added 21 new tests)
- Ran `npm run build` - TypeScript compilation successful with no errors
- Verified loadTasks properly validates tasks.json structure and required fields
- Verified selectNextTask correctly selects first incomplete task by array order
- Verified markTaskComplete updates by index without mutating original array
- Verified buildPromptContent properly formats task details and injects into prompt
- Verified saveTasks produces stable JSON formatting with trailing newline

**Dependencies:**
No new dependencies installed.

**Problems and Lessons:**
- Initial mistake: Used "@jest/globals" import instead of "vitest", quickly corrected after first test run failure
- Key insight: Using array index for task updates (not description matching) prevents issues with duplicate descriptions and makes the logic simpler
- Key insight: The Task interface uses index signature `[key: string]: unknown` to allow optional fields like `id` for future stable task identity
- Design decision: buildPromptContent falls back to PROMPT_JSON_TEMPLATE if prompt.md doesn't exist, making the helpers more resilient
- Design decision: markTaskComplete returns a new array rather than mutating, following functional programming best practices
