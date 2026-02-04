// TODO: i think there's a bug with the settings scaffolding. not sure if these below are correct. need to test and fix.
export const CLAUDE_SETTINGS_TEMPLATE = {
  mcpServers: {
    filesystem: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", process.cwd()],
    },
  },
};

export const MCP_SETTINGS_TEMPLATE = {
  mcpServers: {
    filesystem: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", process.cwd()],
    },
  },
};

export const ACTIVITY_TEMPLATE = `# Project Build - Activity Log

## Current Status
**Last Updated:** ${new Date().toISOString().split("T")[0]}
**Tasks Completed:** 0
**Current Task:** Ready to begin

---

## Session Log

Add dated entries here as you complete tasks. Include:
- Task name and description
- Changes made
- Testing and verification results
- Dependencies installed and why
- Any problems encountered and lessons learned
`;

export const PLAN_TEMPLATE = `# Project Plan

## Project Overview

[Describe your project here]

---

## Task List

IMPORTANT: Only work on one task! Exit the session after finishing a single task!

\`\`\`json
[
  {
    "category": "setup",
    "description": "Example task",
    "steps": [
      "First step",
      "Second step",
      "Third step"
    ],
    "passes": false
  }
]
\`\`\`
`;

export const PROMPT_TEMPLATE = `@plan.md @activity.md

## Instructions

1. Read activity.md to understand current state and what was recently accomplished.
2. Study plan.md thoroughly.
3. Open plan.md and find the next highest leverage task with "passes": false
4. Work on exactly ONE task: complete all steps for that task. Important: ONLY WORK ON A SINGLE TASK.
5. Verify the task is working.
6. Update the activity log.
7. Update that task's passes value in plan.md from false to true. Important: Only modify the passes field. Do not remove or rewrite tasks.
8. Make one git commit for that task only with a clear message. Important: Do not git init, do not change remotes, do not push.

## Dev Server Management

IMPORTANT: Do not start dev servers directly (e.g., \`pnpm dev\`, \`npm run dev\`, \`vite\`, etc.) as these are long-running processes that will hang the agent loop. Instead, use \`ral service start|stop|status|logs\` commands to manage dev servers via Docker Compose.

## Activity Log

After completing a task, append a dated progress entry to activity.md describing what you changed, and the result of verifying the task is working.

If any problems or mistakes are discovered, append a dated entry to activity.md describing what happened, and what should be avoided in the future.

Make note of any dependencies that were installed, and why.

## Task Verification

After implementing, run the cli and/or the tests.

## Dependencies

Reduce dependencies when possible. Use only well known dependencies.

## Plan Completion Criteria Output

IMPORTANT: When ALL tasks have passes true, output <promise>COMPLETE</promise>
`;

// JSON-workflow templates (for scaffold-json command)

export const PLAN_DETAILS_TEMPLATE = `# Project Plan

## Project Overview

[Describe your project here - what you're building and why]

## Goals

[Specific, measurable objectives]
- [Goal 1]
- [Goal 2]

## Non-Goals (Out of Scope)

[What this feature will NOT include - critical for managing scope]
- [Out of scope item 1]
- [Out of scope item 2]

## Technical Considerations

[Known constraints, dependencies, or integration points]
- [Technical constraint or dependency]
- [Performance requirements if applicable]

## Design Considerations

[UI/UX requirements, relevant existing components to reuse, or design decisions]
- [Design decision or component reference]

## Success Metrics

[How will success be measured?]
- [Metric 1]
- [Metric 2]

## Open Questions

[Remaining questions or areas needing clarification]
- [Question 1]
- [Question 2]

## Additional Context

[Add any other design decisions, architectural notes, or relevant details here]
`;

export const TASKS_JSON_TEMPLATE = [
  {
    category: "setup",
    description: "Example task",
    steps: ["First step", "Second step", "Third step"],
    passes: false,
  },
];

export const PROMPT_TASK_PLACEHOLDER =
  "The CLI will insert the current task details here when invoking the agent.";

export const PROMPT_JSON_TEMPLATE = `@plan.md @activity.md @tasks.json

## Instructions

1. Read activity.md to understand current state and what was recently accomplished.
2. Study plan.md for project context and details.
3. Review tasks.json - the CLI will provide you with a single task to work on below.
4. Work on exactly ONE task: complete all steps for that task.
5. Verify the task is working by running tests and/or the CLI.
6. Update activity.md with a dated entry describing your changes and verification results.
7. Make one git commit for that task only with a clear message. Make sure to commit all changes files. Important: Do not git init, do not change remotes, do not push.
8. Output <promise>success</promise> if and only if the task is fully complete and verified.

IMPORTANT: Do NOT edit tasks.json directly. The CLI manages task completion status.

## Dev Server Management

IMPORTANT: Do not start dev servers directly (e.g., \`pnpm dev\`, \`npm run dev\`, \`vite\`, etc.) as these are long-running processes that will hang the agent loop. Instead, use \`ral service start|stop|status|logs\` commands to manage dev servers via Docker Compose.

## Current Task

${PROMPT_TASK_PLACEHOLDER}

## Activity Log

After completing a task, append a dated progress entry to activity.md describing what you changed, and the result of verifying the task is working.

If any problems or mistakes are discovered, append a dated entry to activity.md describing what happened, and what should be avoided in the future.

Make note of any dependencies that were installed, and why.

## Task Verification

After implementing, run the cli and/or the tests to verify the implementation works correctly.

## Dependencies

Reduce dependencies when possible. Use only well known dependencies.

## Success Criteria

Output <promise>success</promise> ONLY when:
- All steps for the current task are complete
- The implementation has been tested and verified to work
- The activity log has been updated
`;
