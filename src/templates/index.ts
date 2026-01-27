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
