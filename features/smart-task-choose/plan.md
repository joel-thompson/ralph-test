# Project Plan: Smart Task Selection

## Project Overview

Implement intelligent task selection for the `run-json` command using Vercel AI SDK v6. Instead of always selecting the first incomplete task, the system will use AI to analyze all incomplete tasks and select the most important one to work on next. This feature will be configurable via `ral.json` with options to enable/disable and select the AI provider (OpenAI or Anthropic).

## Goals

1. Replace simple "first incomplete task" selection with AI-powered priority selection
2. Add configuration options in `ral.json` to control the feature
3. Implement graceful fallback to original behavior if AI selection fails
4. Support both OpenAI and Anthropic providers via Vercel AI SDK v6

## Technical Approach

### Architecture

```
run-json command
    │
    ├─> Load config (ral.json)
    │   └─> Check smartTaskSelection.enabled
    │
    ├─> Load tasks.json
    │
    ├─> Select next task:
    │   ├─> If smartTaskSelection.enabled:
    │   │   ├─> Call AI service (OpenAI/Anthropic via Vercel AI SDK)
    │   │   │   └─> Provide: plan.md, activity.md, incomplete tasks
    │   │   │   └─> Request: Most important task to work on next
    │   │   ├─> Parse AI response (task index or task identifier)
    │   │   └─> Fallback to selectNextTask() if:
    │   │       - AI request fails
    │   │       - AI response is invalid
    │   │       - Network error
    │   │
    │   └─> Else:
    │       └─> Use existing selectNextTask() (first incomplete)
    │
    └─> Continue with selected task...
```

### Configuration Schema

Extend `ral.json` with optional `smartTaskSelection` object:

```json
{
  "runner": "claude",
  "smartTaskSelection": {
    "enabled": true,
    "provider": "anthropic"
  }
}
```

**Configuration Fields:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `smartTaskSelection.enabled` | `boolean` | `false` | Enable AI-powered task selection |
| `smartTaskSelection.provider` | `"openai"` \| `"anthropic"` | `"anthropic"` | AI provider to use for task selection |

**Notes:**
- Feature is opt-in (disabled by default)
- If `smartTaskSelection` is not present, behavior is unchanged
- If `enabled: false`, uses original `selectNextTask()` logic
- Provider selection only matters when `enabled: true`

### Implementation Components

1. **Config Extension** (`src/utils/config.ts`)
   - Extend `RalConfig` interface with optional `smartTaskSelection` field
   - Add validation for new config fields
   - Maintain backward compatibility (all fields optional)

2. **Smart Task Selector** (`src/commands/run-json.ts` or new utility)
   - New function: `selectSmartTask(tasks, config, workingDirectory)`
   - Uses Vercel AI SDK v6 to call OpenAI or Anthropic
   - Constructs prompt with:
     - plan.md content (project context)
     - activity.md content (recent progress)
     - List of incomplete tasks with descriptions
   - Requests AI to return the index or identifier of the most important task
   - Parses and validates AI response
   - Returns `{ task, index }` or `null` (falls back to original logic)

3. **Task Selection Logic** (`src/commands/run-json.ts`)
   - Modify `runJson()` function to check config
   - If `smartTaskSelection.enabled === true`:
     - Call `selectSmartTask()` with try/catch
     - On any error, fall back to `selectNextTask()`
     - Log which method was used (for debugging)
   - Otherwise, use existing `selectNextTask()`

4. **Dependencies**
   - Add `ai` package (Vercel AI SDK v6)
   - Add `@ai-sdk/openai` for OpenAI provider
   - Add `@ai-sdk/anthropic` for Anthropic provider

### AI Prompt Design

The prompt sent to the AI for task selection should include:

```
You are helping prioritize tasks for a development project.

Project Context:
[Content from plan.md]

Recent Activity:
[Content from activity.md]

Available Tasks:
[Formatted list of incomplete tasks with index, category, description, and steps]

Please analyze these tasks and select the most important one to work on next. Consider:
- Dependencies between tasks
- Logical progression of work
- Current project state and recent progress
- Task complexity and prerequisites

Return ONLY the task index (0-based) as a number, or the task description if you cannot determine an index.
```

### Error Handling

The smart selection must gracefully handle:
- **Network errors**: Fall back to `selectNextTask()`
- **API errors**: Fall back to `selectNextTask()`
- **Invalid responses**: Fall back to `selectNextTask()`
- **Missing API keys**: Fall back to `selectNextTask()` (with warning)
- **Timeout**: Fall back to `selectNextTask()`

All fallbacks should log a warning but not fail the command.

### Environment Variables

The AI providers will need API keys:
- OpenAI: `OPENAI_API_KEY`
- Anthropic: `ANTHROPIC_API_KEY`

These should be read from environment variables (standard practice for Vercel AI SDK).

**Implementation Notes:**
- Access via `process.env.OPENAI_API_KEY` and `process.env.ANTHROPIC_API_KEY`
- If API key is missing when smart selection is enabled, throw clear error:
  - OpenAI: "OPENAI_API_KEY environment variable is required for smart task selection with OpenAI provider"
  - Anthropic: "ANTHROPIC_API_KEY environment variable is required for smart task selection with Anthropic provider"
- Error should be thrown from `selectSmartTask()` and caught in `runJson()` for fallback
- Don't check for API keys if smart selection is disabled (avoid unnecessary validation)

## Implementation Steps

**Task Dependencies:** Complete tasks in this order:
1. Dependencies → 2. Configuration → 3. Config Tests → 4a-4d. Implementation Helpers → 5. Integration → 6-8. Testing → 9. Scaffold → 10. Documentation

1. **Install Dependencies**
   - Add `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic` to package.json
   - Verify Vercel AI SDK v6 API documentation for exact import paths and `generateText()` signature
   - Run `pnpm install`

2. **Extend Configuration**
   - Update `RalConfig` interface in `src/utils/config.ts`
   - Add validation for `smartTaskSelection` fields
   - Update default config handling

3. **Add Config Tests**
   - Add unit tests for config loading with new fields
   - Verify backward compatibility

4. **Create Implementation Helpers** (can be done in parallel)
   - 4a. Create `buildTaskSelectionPrompt()` helper
   - 4b. Create `parseTaskIndex()` and `mapIncompleteIndexToOriginal()` helpers
   - 4c. Create `readFileOrEmpty()` helper
   - 4d. Create `selectSmartTask()` function (uses helpers from 4a-4c)

5. **Integrate into runJson()**
   - Modify `runJson()` to check config
   - Add conditional logic for smart vs. simple selection
   - Implement fallback mechanism with error handling
   - Add logging for which selection method was used

6. **Unit Tests for selectSmartTask**
   - Create test file `src/commands/run-json-smart-select.test.ts`
   - Test all helper functions and main function
   - Mock Vercel AI SDK responses

7. **Integration Tests**
   - Add tests to `src/commands/run-json.test.ts`
   - Test fallback behavior
   - Test with both providers (OpenAI and Anthropic)
   - Test with feature disabled

8. **Error Handling Tests**
   - Test all error scenarios
   - Verify fallback always works

9. **Scaffold Updates**
   - Update scaffold templates to include smart task selection
   - Update scaffold tests

10. **Documentation**
    - Update README.md with new config options
    - Add examples of `ral.json` with smart task selection enabled
    - Document environment variable requirements

## Detailed Implementation Specifications

### Type Definitions

```typescript
// In src/utils/config.ts
export interface SmartTaskSelectionConfig {
  enabled: boolean;
  provider: "openai" | "anthropic";
}

export interface RalConfig {
  runner: "claude" | "cursor";
  model?: string;
  smartTaskSelection?: SmartTaskSelectionConfig;
}
```

### Function Signatures

```typescript
// In src/commands/run-json.ts

/**
 * Select the most important task using AI analysis.
 * @param tasks - All tasks from tasks.json
 * @param config - Configuration including smartTaskSelection settings
 * @param workingDirectory - Path to feature directory
 * @param fs - FileSystem instance for reading plan.md and activity.md
 * @returns Selected task and index, or null if no incomplete tasks
 * @throws Error if AI call fails (caller should catch and fallback)
 */
export async function selectSmartTask(
  tasks: Task[],
  config: RalConfig,
  workingDirectory: string,
  fs: FileSystem = new DefaultFileSystem()
): Promise<{ task: Task; index: number } | null>

/**
 * Build the prompt for AI task selection.
 * @param planContent - Content from plan.md (may be truncated)
 * @param activityContent - Content from activity.md (may be truncated)
 * @param incompleteTasks - Array of incomplete tasks with their original indices
 * @returns Formatted prompt string
 */
function buildTaskSelectionPrompt(
  planContent: string,
  activityContent: string,
  incompleteTasks: Array<{ task: Task; originalIndex: number }>
): string {
  const MAX_CONTENT_LENGTH = 2000;
  
  // Truncate plan if too long (keep last portion)
  const truncatePlan = (content: string): string => {
    if (content.length <= MAX_CONTENT_LENGTH) return content;
    return content.slice(-MAX_CONTENT_LENGTH) + '\n\n[Content truncated - showing last portion]';
  };
  
  // Drop activity if too long (don't include at all)
  const shouldIncludeActivity = activityContent.length <= MAX_CONTENT_LENGTH;
  
  const truncatedPlan = truncatePlan(planContent);
  const finalActivity = shouldIncludeActivity ? activityContent : '';
  
  // Format tasks list
  const tasksList = incompleteTasks.map((item, idx) => {
    const steps = item.task.steps.map((step, i) => `  ${i + 1}. ${step}`).join('\n');
    return `Task ${idx} (Original Index: ${item.originalIndex}):
  Category: ${item.task.category}
  Description: ${item.task.description}
  Steps:
${steps}`;
  }).join('\n\n');
  
  // Build prompt with conditional activity section
  let prompt = `You are helping prioritize tasks for a development project.

Project Context:
${truncatedPlan}
`;

  if (shouldIncludeActivity) {
    prompt += `
Recent Activity:
${finalActivity}
`;
  }

  prompt += `
Available Tasks:
${tasksList}

Please analyze these tasks and select the most important one to work on next. Consider:
- Dependencies between tasks
- Logical progression of work
- Current project state and recent progress
- Task complexity and prerequisites

Return ONLY the task index (0-based) as a single number. Do not include any explanation or additional text.`;

  return prompt;
}
```

### Prompt Template

The prompt should follow this structure:

```
You are helping prioritize tasks for a development project.

Project Context:
{plan.md content}

Recent Activity:
{activity.md content}

Available Tasks:
{For each incomplete task, formatted as:}
Task {index} (Original Index: {originalIndex}):
  Category: {category}
  Description: {description}
  Steps:
  {numbered list of steps}

Please analyze these tasks and select the most important one to work on next. Consider:
- Dependencies between tasks
- Logical progression of work
- Current project state and recent progress
- Task complexity and prerequisites

Return ONLY the task index (0-based) as a single number. Do not include any explanation or additional text.
```

### Vercel AI SDK Integration

**Model Selection:** Use default models from Vercel AI SDK:
- OpenAI: `gpt-4o-mini` (cost-effective default)
- Anthropic: `claude-3-5-haiku-20241022` (cost-effective default)

Models are hardcoded in a constants file (`src/utils/ai-constants.ts` or similar) for easy editing. Future enhancement could make this configurable.

```typescript
// Example implementation pattern
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// Validate API key exists before creating model
const apiKey = config.smartTaskSelection.provider === 'openai'
  ? process.env.OPENAI_API_KEY
  : process.env.ANTHROPIC_API_KEY;

if (!apiKey || apiKey.trim() === '') {
  const keyName = config.smartTaskSelection.provider === 'openai' 
    ? 'OPENAI_API_KEY' 
    : 'ANTHROPIC_API_KEY';
  throw new Error(`${keyName} environment variable is required for smart task selection with ${config.smartTaskSelection.provider} provider`);
}

// Import model names from constants file
import { OPENAI_MODEL, ANTHROPIC_MODEL } from '../utils/ai-constants.js';

const model = config.smartTaskSelection.provider === 'openai' 
  ? openai(OPENAI_MODEL, { apiKey })
  : anthropic(ANTHROPIC_MODEL, { apiKey });

const { text } = await generateText({
  model,
  prompt: taskSelectionPrompt,
  temperature: 0.3, // Lower temperature for more deterministic selection
  maxRetries: 2, // Retry on transient errors
});
```

**Note:** Vercel AI SDK v6 API will be verified during implementation using MCP server (context7) to fetch actual API documentation. The above is an example pattern - adjust based on actual API.

### Response Parsing

**Robust Parsing Strategy:** Extract the first valid number from the response, handling various formats the AI might return.

```typescript
/**
 * Parse AI response to extract task index.
 * Handles various formats: "2", "Task 2", "Index: 2", "2.", "The second task (index 2)", etc.
 * @param response - Raw AI response text
 * @param maxIndex - Maximum valid index (exclusive, length of incomplete tasks array)
 * @returns Parsed index (0-based) or null if parsing fails
 */
function parseTaskIndex(response: string, maxIndex: number): number | null {
  if (!response || typeof response !== 'string') return null;
  
  // Extract all numbers from the response
  const numbers = response.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  
  // Try each number until we find a valid index
  for (const numStr of numbers) {
    const index = parseInt(numStr, 10);
    if (!isNaN(index) && index >= 0 && index < maxIndex) {
      return index;
    }
  }
  
  // No valid index found
  return null;
}
```

**Edge Cases Handled:**
- Empty or non-string responses
- Responses with no numbers
- Numbers outside valid range
- Multiple numbers (uses first valid one)
- Negative numbers (rejected)

### Error Types to Handle

1. **Network Errors**: Connection timeout (30s), DNS failure, network unreachable
   - Catch and re-throw with clear message
   - runJson() catches and falls back

2. **API Errors**: Invalid API key (401), rate limiting (429), service unavailable (500)
   - Vercel SDK may throw these as errors
   - Catch and re-throw with original error message
   - runJson() catches and falls back

3. **Parsing Errors**: Invalid response format, non-numeric response, out-of-bounds index
   - parseTaskIndex() returns null
   - selectSmartTask() returns null (not an error)
   - runJson() treats null as fallback trigger

4. **File Errors**: 
   - Missing plan.md or activity.md: Use empty string, log warning, continue
   - Permission errors: Throw error, runJson() catches and falls back

5. **Missing Environment Variables**: Missing or empty API key
   - Check in selectSmartTask() before creating model
   - Throw clear error: `${keyName} environment variable is required...`
   - runJson() catches and falls back

6. **Timeout Errors**: AI call exceeds 30 seconds
   - AbortController triggers timeout
   - Throw error with "Timeout" message
   - runJson() catches and falls back

## Testing Strategy

### Unit Testing Approach

#### Config Tests (`src/utils/config.test.ts`)

Test cases to add:
- ✅ Config with `smartTaskSelection.enabled: true` and `provider: "openai"`
- ✅ Config with `smartTaskSelection.enabled: true` and `provider: "anthropic"`
- ✅ Config with `smartTaskSelection.enabled: false`
- ✅ Config without `smartTaskSelection` (backward compatibility)
- ✅ Invalid provider value (not "openai" or "anthropic")
- ✅ Invalid enabled value (not boolean)
- ✅ Partial smartTaskSelection object (missing enabled or provider)
- ✅ Empty smartTaskSelection object

#### Smart Task Selection Tests (`src/commands/run-json-smart-select.test.ts`)

**Mocking Strategy:**
```typescript
import { generateText } from 'ai';
vi.mock('ai', () => ({
  generateText: vi.fn(),
}));
```

**Test Cases:**

1. **Successful Selection**
   - Mock `generateText` to return valid numeric response
   - Verify correct task is selected
   - Verify FileSystem.readFile is called for plan.md and activity.md
   - Test with both OpenAI and Anthropic providers

2. **No Incomplete Tasks**
   - Pass array with all tasks having `passes: true`
   - Should return `null` without calling AI

3. **Network Errors**
   - Mock `generateText` to throw network error
   - Verify error is propagated (not caught internally)

4. **API Errors**
   - Mock `generateText` to throw API error (401, 429, 500)
   - Verify error is propagated with appropriate message

5. **Invalid Response Format**
   - Mock `generateText` to return non-numeric response
   - Should return `null` (parsing failure)

6. **Out of Bounds Index**
   - Mock `generateText` to return index >= incompleteTasks.length
   - Should return `null` (validation failure)

7. **Missing Files**
   - Mock FileSystem.readFile to throw ENOENT for plan.md
   - Should use empty string for plan content and continue
   - Same for activity.md (should use empty string, which means it won't be included if empty)
8. **Content Truncation**
   - Test that activity.md over 2000 chars is dropped completely (Recent Activity section not in prompt)
   - Test that plan.md over 2000 chars is truncated to last 2000 chars with truncation note
   - Test that plan.md under 2000 chars is included fully (no truncation)
   - Test that activity.md under 2000 chars is included fully (Recent Activity section present)
   - Test combination: activity > 2000 chars (dropped) + plan < 2000 chars (included)
   - Test combination: activity < 2000 chars (included) + plan > 2000 chars (truncated)

9. **Prompt Construction**
   - Verify prompt includes required sections (Project Context, Available Tasks always present)
   - Verify Recent Activity section only included if activity.md <= 2000 chars
   - Verify task formatting is correct (category, description, steps)
   - Verify original indices are preserved in task list
   - Verify truncation works correctly: activity dropped if > 2000 chars, plan truncated if > 2000 chars
   - Assert prompt length is reasonable (< 5000 characters typical)

9. **Provider Selection**
   - Verify correct provider is called based on config
   - Test OpenAI path
   - Test Anthropic path

10. **Environment Variables**
    - Test behavior when API key is missing
    - Should throw clear error about missing key

#### Integration Tests (`src/commands/run-json.test.ts`)

**Test Cases:**

1. **Smart Selection Enabled - Success**
   - Mock selectSmartTask to return valid task
   - Verify selected task is used in loop
   - Verify logging indicates smart selection was used: assert console.log called with "Using smart task selection (provider: anthropic)"

2. **Smart Selection Enabled - Failure Fallback**
   - Mock selectSmartTask to throw error (e.g., network error)
   - Verify fallback to selectNextTask()
   - Verify logging indicates fallback occurred: assert console.warn called with message containing "Smart task selection failed, falling back"
   - Verify loop continues normally with fallback task

3. **Smart Selection Disabled**
   - Config has `smartTaskSelection.enabled: false`
   - Verify selectNextTask() is used (not selectSmartTask)
   - Verify all existing behavior unchanged

4. **No Smart Selection Config**
   - Config without smartTaskSelection field
   - Verify selectNextTask() is used
   - Verify backward compatibility

5. **Multiple Tasks with Smart Selection**
   - Multiple incomplete tasks
   - Mock AI to select different task than first
   - Verify correct task is selected and processed

### Mock File System Pattern

Use existing `MockFileSystem` class pattern from `run-json.test.ts`:

```typescript
class MockFileSystem implements FileSystem {
  private files: Map<string, string> = new Map();
  
  setFile(filePath: string, content: string): void {
    this.files.set(filePath, content);
  }
  
  async readFile(filePath: string): Promise<string> {
    const content = this.files.get(filePath);
    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    }
    return content;
  }
  
  // ... other methods
}
```

### Mocking Vercel AI SDK

```typescript
import { generateText } from 'ai';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

// In tests:
vi.mocked(generateText).mockResolvedValue({
  text: '2', // Task index
  // ... other response properties
});
```

### Test Data Examples

**Sample tasks.json:**
```json
[
  {
    "category": "setup",
    "description": "Install dependencies",
    "steps": ["Run pnpm install"],
    "passes": false
  },
  {
    "category": "implementation",
    "description": "Implement feature",
    "steps": ["Create file", "Add tests"],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Add tests",
    "steps": ["Write tests", "Run tests"],
    "passes": true
  }
]
```

**Sample plan.md:**
```
# Project Plan

## Overview
Build a new feature with smart task selection.

## Context
This feature will improve task prioritization.
```

**Sample activity.md:**
```
# Activity Log

## 2026-01-29
Completed initial setup tasks.
```

### Testing Checklist

- [ ] All config tests pass
- [ ] All selectSmartTask unit tests pass
- [ ] All runJson integration tests pass
- [ ] Existing tests still pass (no regressions)
- [ ] Tests cover both OpenAI and Anthropic providers
- [ ] Tests cover all error scenarios
- [ ] Tests verify fallback behavior
- [ ] Tests verify backward compatibility
- [ ] No tests actually call real AI APIs (all mocked)
- [ ] Test coverage is comprehensive (>90% for new code)

## Design Decisions

1. **Opt-in Feature**: Disabled by default to maintain backward compatibility (when no config exists)
2. **Scaffold Default**: When scaffold commands generate `ral.json`, include `smartTaskSelection.enabled: true` and `provider: "anthropic"` by default so users can try the feature immediately. This is opt-out behavior (enabled by default in new projects), but the feature itself is opt-in (disabled when no config exists for backward compatibility).
3. **Graceful Fallback**: Always falls back to original behavior on any error - never fails the command
4. **Provider Selection**: User chooses provider in config, allowing flexibility and cost optimization. Default provider in scaffolded config is "anthropic"
5. **Simple Response Format**: AI returns just the task index to minimize parsing complexity
6. **No Task Reordering**: AI selects from existing tasks, doesn't modify tasks.json order
7. **Separate Test File**: Create dedicated test file for selectSmartTask to keep tests organized
8. **Temperature Setting**: Use lower temperature (0.3) for more deterministic task selection
9. **Error Propagation**: selectSmartTask throws errors, runJson catches and falls back (separation of concerns)

## Edge Cases and Considerations

### Task Index Mapping

**Important:** When filtering to incomplete tasks, preserve the original index from the full tasks array. The AI response will be an index into the incomplete tasks array, but we need to map it back to the original tasks array index.

**Helper Function:**
```typescript
/**
 * Map an index from the incomplete tasks array back to the original tasks array index.
 * @param incompleteIndex - Index into the incomplete tasks array (0-based)
 * @param incompleteTasks - Array of incomplete tasks with their original indices
 * @returns Original index in the full tasks array, or null if invalid
 */
function mapIncompleteIndexToOriginal(
  incompleteIndex: number,
  incompleteTasks: Array<{ task: Task; originalIndex: number }>
): number | null {
  if (incompleteIndex < 0 || incompleteIndex >= incompleteTasks.length) {
    return null;
  }
  return incompleteTasks[incompleteIndex].originalIndex;
}
```

**Example:**
```typescript
// Original tasks: [task0 (complete), task1 (incomplete), task2 (incomplete)]
// Incomplete tasks: [{task: task1, originalIndex: 1}, {task: task2, originalIndex: 2}]
// AI selects index 0 (first incomplete task) = task1
// mapIncompleteIndexToOriginal(0, incompleteTasks) returns 1
// Return { task: task1, index: 1 } (original index)
```

### File Reading Errors

**Strategy:** Gracefully handle missing files with warnings, but continue execution.

```typescript
async function readFileOrEmpty(filePath: string, fs: FileSystem, fileName: string): Promise<string> {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.warn(`Warning: ${fileName} not found, using empty context for smart task selection`);
      return '';
    }
    // Re-throw other errors (permission errors, etc.)
    throw error;
  }
}
```

**Implementation:**
- If `plan.md` doesn't exist, use empty string and log warning
- If `activity.md` doesn't exist, use empty string and log warning
- If file exists but is unreadable (permission error), throw error (will trigger fallback)
- This allows the feature to work even in minimal setups

### Response Parsing Edge Cases

- AI might return: "2", "Task 2", "Index: 2", "2.", "The second task (index 2)"
- Parse should extract first number found
- Validate number is within bounds
- If parsing fails, return null (triggers fallback)

### Concurrent Task Selection

- Each iteration calls selectSmartTask independently
- No caching of AI responses (always fresh analysis)
- This allows AI to reconsider priorities as project progresses

### Cost Considerations

- Each task selection = 1 AI API call
- Prompt includes plan.md + activity.md + task list
- Use cost-effective models: `gpt-4o-mini` for OpenAI, `claude-3-5-haiku-20241022` for Anthropic
- **Content Truncation:** To prevent excessive token usage and costs, truncate file contents strategically:
  - If `activity.md` is over 2000 characters: drop it completely (don't include in prompt)
  - If `plan.md` is over 2000 characters: truncate to last 2000 characters (keeps most recent context)
  - Add note in truncated plan content: "[Content truncated - showing last portion]"
  - This happens in `buildTaskSelectionPrompt()` before constructing the full prompt
  - Strategy: Activity is less critical than plan, so drop it if too long. Plan is essential, so truncate if needed.
- Consider adding model selection to config in future if needed

### Performance Considerations

- AI call adds latency (network + API processing)
- Fallback should be fast (no delay if AI fails)
- **Timeout:** Set 30-second timeout for AI calls to avoid hanging
  - Use `AbortController` with `signal` option in `generateText()`
  - On timeout, throw error that triggers fallback
- Log timing information for debugging (optional, can be added later)

### Logging Strategy

**Exact Log Messages:**

1. **First use of smart selection (once per runJson() call):**
   ```typescript
   console.log(`Using smart task selection (provider: ${config.smartTaskSelection.provider})`);
   ```

2. **Fallback on error:**
   ```typescript
   console.warn(`Smart task selection failed, falling back to simple selection: ${error.message}`);
   ```

3. **Missing file warning:**
   ```typescript
   console.warn(`Warning: ${fileName} not found, using empty context for smart task selection`);
   ```

**Guidelines:**
- Use `console.warn()` for fallback warnings and missing files
- Use `console.log()` for normal operation info (first use only)
- Don't log on every iteration (too verbose), only on first use or errors
- Track if we've logged "first use" to avoid duplicate messages

## Additional Context

- The existing `selectNextTask()` function will remain unchanged and serve as the fallback
- This feature only affects task selection, not task execution or completion logic
- The AI call for task selection is separate from the main agent runner (Claude/Cursor) used for task execution
- Cost consideration: Each task selection adds one AI API call, but this should be minimal compared to task execution costs
- The feature is designed to be completely optional - if disabled or if it fails, the CLI works exactly as before
- No changes to tasks.json format or structure are required

## Implementation Decisions

**Confirmed:**
1. **Vercel AI SDK v6 API**: Will be researched during implementation using MCP server (context7) to fetch actual API documentation
2. **Model Selection**: Models are hardcoded in a constants file (`src/utils/ai-constants.ts`) for easy editing:
   - OpenAI: `gpt-4o-mini`
   - Anthropic: `claude-3-5-haiku-20241022`
3. **Content Truncation**: 
   - If `activity.md` is over 2000 characters: drop it completely (don't include in prompt)
   - If `plan.md` is over 2000 characters: truncate to last 2000 characters (keeps most recent context)
   - Truncation happens in `buildTaskSelectionPrompt()`
4. **Timeout Duration**: 30 seconds (hardcoded)
5. **Temperature Setting**: 0.3 (hardcoded)
6. **Test File Organization**: Separate test file `run-json-smart-select.test.ts` will be created
