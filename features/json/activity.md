# Project Build - Activity Log

## Current Status
**Last Updated:** 2026-01-28
**Tasks Completed:** 3
**Current Task:** Task 3 complete - scaffold-json templates added

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
