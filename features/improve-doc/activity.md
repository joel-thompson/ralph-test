# Project Build - Activity Log

## Current Status
**Last Updated:** 2026-01-27
**Tasks Completed:** 7
**Current Task:** Tips and Best Practices section added

---

## Session Log

### 2026-01-27 - Added Local Development Setup Section

**Task:** Add 'Local Development Setup' section for contributors/coworkers

**Changes Made:**
- Added comprehensive "Local Development Setup" section to README.md after the Installation section
- Included step-by-step clone and setup instructions (git clone, pnpm install, pnpm build)
- Documented three options for making the `ral` command available globally:
  1. `pnpm link --global` - Recommended, auto-updates on rebuild
  2. Shell alias - Simple, explicit path
  3. Add dist folder to PATH
- Each option includes exact commands and brief explanations (1-2 sentences)
- Added note about `npm install -g` availability once published to npm
- Used code blocks throughout for easy copy-paste
- Included development commands section (lint, dev mode with examples)

**Verification:**
- Build completed successfully with `pnpm build`
- All tests pass: 66 tests passed across 9 test files
- No errors or warnings during build or test execution
- Documentation changes don't affect functionality

**Problems Encountered:** None

**Dependencies Installed:** None

---

### 2026-01-27 - Added Writing a Spec (spec.md) Section

**Task:** Add 'Writing a Spec (spec.md)' section

**Changes Made:**
- Added comprehensive "Writing a Spec (spec.md)" section to README.md after the "Typical Workflow" section
- Explained the purpose of spec.md as a PRD/specification document that describes the project or feature
- Documented the pattern of referencing @spec.md in plan.md so Claude has full context
- Included guidance on what to put in a spec: requirements, constraints, examples, API contracts, testing criteria, etc.
- Provided example spec.md structure/template with code blocks
- Explained the benefit: keeps plan.md focused on tasks while spec.md holds detailed requirements
- Added "Using the Spec with Your Plan" subsection showing how to reference @spec.md
- Listed key benefits: separation of concerns, better context, easier maintenance, clearer communication, reusability

**Verification:**
- Build completed successfully with `pnpm build`
- All tests pass: 66 tests passed across 9 test files
- No errors or warnings during build or test execution
- Documentation changes don't affect functionality

**Problems Encountered:** None

**Dependencies Installed:** None

---

### 2026-01-27 - Added Setting Up Your Plan Section

**Task:** Add 'Setting Up Your Plan' section

**Changes Made:**
- Added comprehensive "Setting Up Your Plan" section to README.md after "Writing a Spec (spec.md)" section
- Documented the AI-assisted approach for generating plans using Claude, ChatGPT, or similar agents
- Included example prompts for three common scenarios:
  1. Generating plans from a spec file
  2. Generating plans from requirements (authentication example)
  3. Generating plans for refactoring tasks (error handling example)
- Added "Reviewing and Refining the Generated Plan" subsection emphasizing manual review before running loop
- Listed key checks: task clarity, step completeness, realistic scope, proper ordering, verification criteria
- Provided concrete examples of good, too vague, and too granular task definitions
- Created "Tips for Effective Plans" subsection covering:
  - Task Granularity (5-15 minute tasks, avoid too large or too small)
  - Clear Verification Steps (be specific about what to test)
  - Writing Good Task Descriptions (use action verbs, be specific)
  - Handling Dependencies (order tasks properly, make dependencies explicit)
- Included "The plan.md Format" subsection with complete example structure showing Project Overview, @spec.md reference, and Task List JSON format
- Explained the `passes` field convention (starts false, Claude changes to true)

**Verification:**
- Build completed successfully with `pnpm build`
- All tests pass: 66 tests passed across 9 test files
- No errors or warnings during build or test execution
- Documentation changes don't affect functionality

**Problems Encountered:** None

**Dependencies Installed:** None

---

### 2026-01-27 - Added Building a New Feature from Scratch Workflow Example

**Task:** Add 'Building a New Feature from Scratch' workflow example

**Changes Made:**
- Added comprehensive "Example Workflows" section to README.md after "Setting Up Your Plan" section
- Created detailed "Building a New Feature from Scratch" subsection demonstrating complete workflow
- Used realistic example: building a user notification system with email and in-app notifications
- Structured as step-by-step tutorial with 7 steps:
  1. Create the Feature Directory - Shows directory setup commands
  2. Write the Spec - Complete spec.md example with requirements, technical constraints, API design, database schema, testing criteria
  3. Generate the Plan - Example prompts for AI-assisted plan generation
  4. Review and Customize the Generated Plan - Full example plan.md with 8 realistic tasks (setup, implementation, integration, testing, verification)
  5. Customize the Prompt (Optional) - Shows how to add feature-specific instructions to prompt.md
  6. Run the Loop - Command to execute with expected token usage and cost output
  7. Review the Results - What to check after completion
- Included "What This Example Demonstrates" section highlighting key concepts:
  - Complete workflow from requirements to implementation
  - Feature isolation using working directory
  - AI-assisted planning
  - Incremental development
  - Self-verification
  - Cost tracking
  - Activity logging
- Added "Tips for This Workflow" section with practical advice for using the pattern
- Example plan includes realistic tasks with appropriate granularity and verification steps
- Shows expected cost tracking output ($0.634 total for 8 iterations)

**Verification:**
- Build completed successfully with `pnpm build`
- All tests pass: 66 tests passed across 9 test files
- No errors or warnings during build or test execution
- Documentation changes don't affect functionality

**Problems Encountered:** None

**Dependencies Installed:** None

---

### 2026-01-27 - Added Refactoring Existing Code Workflow Example

**Task:** Add 'Refactoring Existing Code' workflow example

**Changes Made:**
- Added comprehensive "Refactoring Existing Code" workflow section to README.md after "Building a New Feature from Scratch" section
- Used realistic example: refactoring Express.js API error handling to use centralized error handling system
- Structured as step-by-step tutorial with 7 steps matching previous workflow format:
  1. Create the Feature Directory - Directory setup commands
  2. Write the Spec - Complete spec.md example covering:
     - Current state vs target state comparison
     - Custom AppError class design
     - Error response format interface
     - Middleware signature
     - Migration strategy (one route at a time)
     - Testing & verification criteria
     - List of files to modify
  3. Generate the Plan - Example prompts for AI-assisted refactoring plan generation
  4. Review the Generated Plan - Full example plan.md with 8 sequential tasks:
     - Create AppError custom error class
     - Create centralized error handling middleware
     - Refactor users.ts routes to use AppError
     - Refactor posts.ts routes to use AppError
     - Refactor comments.ts routes to use AppError
     - Register error middleware in app.ts
     - Run full test suite and integration testing
     - Clean up old error handling code and update documentation
  5. Scaffold and Customize - Shows how to add refactoring-specific instructions to prompt.md
  6. Run the Loop - Command to execute with expected token usage output (8 iterations, $0.523)
  7. Review the Changes - Git commands to review refactoring results
- Included "What This Example Demonstrates" section highlighting key concepts:
  - Sequential dependencies (tasks build on each other)
  - Incremental refactoring (one route file at a time)
  - Test-driven changes
  - Risk mitigation
  - Preserve functionality
  - Complete migration
- Added "Tips for Refactoring with Ralph" section with 7 practical tips:
  - Break it down into manageable chunks
  - Order tasks by dependencies
  - Test continuously
  - One file at a time
  - Keep codebase working after each task
  - Document the "why"
  - Consider rollback with git commits
- Example demonstrates proper task dependency ordering (create base classes before using them)
- Shows realistic refactoring scope with multiple route files to update
- Emphasizes verification at each step (tests, build, manual testing)

**Verification:**
- Build completed successfully with `pnpm build`
- All tests pass: 66 tests passed across 9 test files
- No errors or warnings during build or test execution
- Documentation changes don't affect functionality

**Problems Encountered:** None

**Dependencies Installed:** None

---

### 2026-01-27 - Added Debugging/Bug Fix Workflow Example

**Task:** Add 'Debugging/Bug Fix' workflow example

**Changes Made:**
- Added comprehensive "Debugging and Fixing a Bug" workflow section to README.md after "Refactoring Existing Code" section
- Used realistic example: debugging and fixing intermittent shopping cart persistence bug (items disappearing on navigation/refresh)
- Structured as step-by-step tutorial with 7 steps matching previous workflow format:
  1. Create the Feature Directory - Directory setup commands
  2. Write the Spec - Complete spec.md example covering:
     - Problem statement (intermittent cart item loss)
     - Current implementation details (React Context, localStorage, useEffect)
     - Suspected issues (race conditions, serialization, context timing, quota)
     - Investigation tasks list
     - Proposed solution approaches
     - Testing strategy (unit tests, integration tests, manual scenarios)
     - Success criteria
     - Files to modify
  3. Generate the Plan - Example prompts for AI-assisted debugging plan generation
  4. Review the Generated Plan - Full example plan.md with 9 sequential tasks:
     - Review CartContext implementation and identify issues (investigation)
     - Review storage utilities and test for serialization issues (investigation)
     - Add debugging logs to track cart persistence flow (investigation)
     - Add error handling and validation to storage utilities (bugfix)
     - Fix CartContext initialization race condition (bugfix)
     - Implement debouncing for cart localStorage updates (bugfix)
     - Write comprehensive tests for cart persistence edge cases (testing)
     - Manual testing of all bug scenarios (verification)
     - Final verification and cleanup (verification)
  5. Scaffold the Loop Files - Shows scaffold command and prompt.md customization for debugging
  6. Run the Loop - Command to execute with expected token usage output (9 iterations, $0.587)
  7. Review the Fix - Git commands to review debugging results and check activity.md for root cause analysis
- Included "What This Example Demonstrates" section highlighting key concepts:
  - Structured debugging (investigation before fixes)
  - Root cause analysis
  - Incremental fixes
  - Comprehensive testing
  - Activity logging (debugging trail)
  - Debug instrumentation
- Added "Tips for Debugging with Ralph" section with 8 practical tips:
  - Investigate first (understand root cause before fixing)
  - Add instrumentation (temporary debug logs)
  - Test hypotheses (each investigation task tests a theory)
  - Document findings (capture learnings in activity.md)
  - Small fixes (break into verifiable changes)
  - Reproduce reliably (include reproduction steps)
  - Check related code (bug fixes reveal related issues)
  - Keep debug logs (consider permanent logging)
- Example demonstrates debugging workflow progression: investigation → identification → fixes → verification
- Shows how to structure investigation tasks with specific debugging steps
- Includes realistic manual testing scenarios (5 scenarios: navigate, refresh, close/reopen, many items, localStorage disabled)
- Emphasizes documentation of root cause findings in activity.md
- Example plan separates investigation, bugfix, testing, and verification categories

**Verification:**
- Build completed successfully with `pnpm build`
- All tests pass: 66 tests passed across 9 test files
- No errors or warnings during build or test execution
- Documentation changes don't affect functionality

**Problems Encountered:** None

**Dependencies Installed:** None

---

### 2026-01-27 - Added Tips and Best Practices Section

**Task:** Add 'Tips and Best Practices' section

**Changes Made:**
- Added comprehensive "Tips and Best Practices" section to README.md after "Debugging and Fixing a Bug" workflow section
- Created four major subsections covering all aspects of effective Ralph loop usage:

1. **Writing Effective Plans** subsection:
   - Task Granularity: Explained optimal task size (5-15 minutes), provided examples of too large, too small, and just right tasks
   - Task Categories: Listed standard categories (setup, implementation, refactoring, testing, verification, cleanup, documentation)
   - Clear Steps: Guidance on using action verbs, being specific about files, including verification
   - Verification is Critical: Emphasized combining automated and manual verification with specific examples
   - Handle Dependencies: Explained proper task ordering and making dependencies explicit
   - Avoid These Pitfalls: Four common pitfalls with ❌/✅ examples (vague descriptions, missing verification, too ambitious, duplicate work)

2. **Customizing prompt.md** subsection:
   - Add Project-Specific Context: Example showing TypeScript/Express/PostgreSQL context
   - Add Coding Standards: Example with variable naming, JSDoc, async/await preferences, [debug] prefix
   - Add Testing Requirements: Example with unit test structure, mocking, coverage goals
   - Add Technology-Specific Guidance: React/Next.js example with hooks, Context API, Tailwind, react-hook-form
   - Keep It Concise: Explained token usage impact and focusing on what's different from standard practices

3. **Choosing max-iterations** subsection:
   - How to Choose the Right Number: Provided formula (number_of_tasks + buffer) with examples for 5, 10, 20 tasks
   - Why Add a Buffer: Listed 4 reasons (test failures, build errors, complexity, investigation)
   - Too Few Iterations: Explained exit code 1, progress preservation, resuming
   - Too Many Iterations: Explained early completion, unused iterations don't cost anything
   - Cost Considerations: Typical per-iteration costs ($0.05-$0.15), example calculations, monitoring advice
   - Iterative Approach: Showed conservative start pattern with progress checking and continuation
   - When to Use Higher Limits: Three scenarios (complex features, exploratory work, critical path)

4. **Common Pitfalls and Solutions** subsection:
   - Documented 11 common pitfalls with symptoms and solutions:
     1. Tasks too large (solution: break into smaller pieces, <3 files/<100 lines)
     2. Missing file context (solution: add review task or include file paths in steps)
     3. Unclear success criteria (solution: explicit measurable verification with examples)
     4. Tests don't exist (solution: proper task ordering)
     5. Dependencies not installed (solution: include installation in task steps)
     6. Git commit messages unclear (solution: descriptive commits with task description)
     7. Task passes set to true prematurely (solution: emphasize verification)
     8. Context grows too large (solution: keep plan.md focused, passes field helps)
     9. Loop gets stuck (solution: 4 strategies to handle stuck loops)
     10. No spec.md for complex features (solution: write spec with requirements, constraints, examples)
   - Each pitfall includes symptom, solution, and often an example

5. **Workflow Tips** subsection:
   - 9 practical tips for using Ralph effectively:
     1. Start Small: Begin with 3-5 task projects, gradually increase complexity
     2. Review Frequently: Check activity.md after iterations, pause if needed
     3. Use Git Effectively: Leverage incremental commits, git revert for mistakes
     4. Iterate on Your Plan: Refine task writing skills over time
     5. Leverage AI for Planning: Use Claude/ChatGPT to generate plans, always review
     6. Monitor Costs: Track spending, optimize plan.md/prompt.md
     7. Parallel Features: Work on multiple features with different working directories
     8. Document Learnings: Use activity.md for insights, root causes, patterns discovered
   - Each tip includes practical guidance and context

**Verification:**
- Build completed successfully with `pnpm build`
- All tests pass: 66 tests passed across 9 test files
- No errors or warnings during build or test execution
- Documentation changes don't affect functionality
- Section is comprehensive, well-organized, and provides actionable guidance
- Content flows logically from planning → customization → execution → troubleshooting

**Problems Encountered:** None

**Dependencies Installed:** None

---

### 2026-01-27 - Simplified README Structure and Created EXAMPLES.md

**Task:** Simplify README structure and reduce redundancy

**Changes Made:**
- **Created EXAMPLES.md**: Moved all three detailed workflow examples from README to a new EXAMPLES.md file:
  - Building a New Feature from Scratch (notification system example)
  - Refactoring Existing Code (error handling refactor example)
  - Debugging and Fixing a Bug (cart persistence bug example)
  - Each example retained full detail: step-by-step instructions, code samples, expected output
  - Added brief "Key Takeaways" summaries to replace long "What This Example Demonstrates" sections
  - Kept examples self-contained and comprehensive

- **Simplified README.md**: Reduced from 1867 lines to 438 lines (76% reduction):
  - Added new "Quick Start" section at the top with 6-step getting started flow
  - Consolidated "Core Concepts" section explaining Ralph loop, key files, and working directory pattern
  - Streamlined "Commands" section (scaffold, run, create-settings) with concise descriptions
  - Consolidated "Writing Your Plan" section combining spec.md, AI-assisted planning, and plan review guidance
  - Replaced three detailed workflow examples (800+ lines) with brief reference to EXAMPLES.md and one quick example
  - Consolidated "Tips and Best Practices" into concise subsections (removed verbose explanations)
  - Converted "Common Pitfalls and Solutions" from verbose list to compact table format
  - Kept "Local Development Setup" section but moved to near end (for contributors)
  - Removed redundant "Typical Workflow" section (replaced by Quick Start)
  - Removed Installation section (package not yet published to npm)
  - Maintained all critical information but in more concise format

- **Improved Content Organization**:
  - Logical flow: Quick Start → Prerequisites → Core Concepts → Commands → Writing Plans → Pitfalls → Examples → Tips → Development
  - Quick Start section gets users going immediately without overwhelming detail
  - Core Concepts explains key ideas before diving into commands
  - Writing Your Plan section consolidates spec.md, AI planning, and review guidance
  - Examples section provides brief overview and link to EXAMPLES.md for details
  - Local Development Setup moved near end (relevant mainly for contributors)

- **Reduced Repetition**:
  - Eliminated duplicate explanations of spec.md (was in multiple sections)
  - Consolidated overlapping "Setting Up Your Plan" and "Tips and Best Practices" content
  - Removed redundant explanations of working directory pattern (consolidated to one section)
  - Streamlined prompt.md customization guidance (removed repetitive examples)
  - Condensed max-iterations guidance from verbose explanation to formula + concise tips

- **Enhanced Readability**:
  - Added table format for common pitfalls (easier to scan)
  - Used more concise bullet points instead of long paragraphs
  - Kept code examples but removed excessive commentary
  - Maintained practical guidance while removing verbose explanations
  - Better section hierarchy with clear subsections

**Verification:**
- README.md reduced to 438 lines (goal was <500 lines) ✓
- Build completed successfully with `pnpm build` ✓
- All tests pass: 66 tests passed across 9 test files ✓
- No errors or warnings during build or test execution ✓
- Documentation changes don't affect functionality ✓
- EXAMPLES.md created with all three detailed workflow examples ✓
- README maintains all essential information in more accessible format ✓
- Quick Start section provides clear path for new users ✓
- Logical flow from getting started through advanced usage ✓

**Problems Encountered:** None

**Dependencies Installed:** None
