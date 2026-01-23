# Project Plan

## Overview

TypeScript CLI application which performs basic math operations.

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Initialize TypeScript CLI project",
    "steps": [
      "Initialize package.json with TypeScript support",
      "Install TypeScript and required dependencies",
      "Configure tsconfig.json",
      "Create project directory structure (src/)",
      "Set up build and run scripts"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Create base CLI with help command",
    "steps": [
      "Create main entry point (src/index.ts)",
      "Parse command-line arguments",
      "Add --help flag to display usage",
      "Verify CLI runs and displays help"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement addition command",
    "steps": [
      "Create add command (math add <a> <b>)",
      "Accept two numbers as arguments",
      "Print sum to stdout",
      "Handle invalid input with error message"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement subtraction command",
    "steps": [
      "Create subtract command (math subtract <a> <b>)",
      "Accept two numbers as arguments",
      "Print difference to stdout",
      "Handle invalid input with error message"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement multiplication command",
    "steps": [
      "Create multiply command (math multiply <a> <b>)",
      "Accept two numbers as arguments",
      "Print product to stdout",
      "Handle invalid input with error message"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement division command",
    "steps": [
      "Create divide command (math divide <a> <b>)",
      "Accept two numbers as arguments",
      "Print quotient to stdout",
      "Handle division by zero error",
      "Handle invalid input with error message"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Verify all math commands work correctly",
    "steps": [
      "Test addition with valid inputs",
      "Test subtraction with valid inputs",
      "Test multiplication with valid inputs",
      "Test division with valid inputs",
      "Test division by zero returns error",
      "Test invalid input handling for all commands"
    ],
    "passes": false
  },
    {
    "category": "documentation",
    "description": "Write README.md",
    "steps": [
      "Write README.md",
      "Include usage instructions",
      "Include examples",
      "Include installation instructions",
      "Include usage instructions",
      "Include examples",
      "Include installation instructions"
    ],
    "passes": false
  }
]
```

## Agent Instructions

1. Read activity.md first to understand current state
2. Find next task with "passes": false
3. Complete all steps for that task
4. Verify by running the CLI
5. Update task to "passes": true
6. Log completion in activity.md

Important: Only modify the passes field. Do not remove or rewrite tasks.

## Completion Criteria
All tasks marked with "passes": true