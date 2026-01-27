# Project Plan

## Project Overview

Switch package manager from bun to pnpm. Update lockfile, documentation, and any bun-specific references.

---

## Task List

```json
[
  {
    "category": "migration",
    "description": "Replace bun lockfile with pnpm lockfile",
    "steps": [
      "Delete bun.lock from project root",
      "Run pnpm install to generate pnpm-lock.yaml",
      "Verify all dependencies install correctly"
    ],
    "passes": true
  },
  {
    "category": "documentation",
    "description": "Update README.md to use pnpm instead of bun",
    "steps": [
      "Update Development Setup section: change 'bun install' to 'pnpm install'",
      "Update 'bun run build' to 'pnpm run build'",
      "Update 'bun run lint' to 'pnpm run lint'",
      "Update 'bun run dev' to 'pnpm run dev'",
      "Update Prerequisites section: remove 'Bun 1.0+' reference",
      "Update Package Manager section to describe pnpm instead of bun",
      "Remove the 'switch back to npm' instructions that reference bun.lockb"
    ],
    "passes": true
  },
  {
    "category": "cleanup",
    "description": "Update .gitignore if needed",
    "steps": [
      "Check if bun.lock is in .gitignore (it shouldn't be)",
      "Ensure pnpm-lock.yaml is not in .gitignore (lockfiles should be committed)"
    ],
    "passes": false
  },
  {
    "category": "verification",
    "description": "Verify pnpm setup works correctly",
    "steps": [
      "Run pnpm install (clean install)",
      "Run pnpm run build to verify TypeScript compiles",
      "Run pnpm test to verify tests pass",
      "Run pnpm run lint to verify linting works"
    ],
    "passes": false
  }
]
```
