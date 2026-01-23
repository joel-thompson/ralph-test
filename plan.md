# Project Plan

## Project Overview

Typescript hono api which performs basic math operations.

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Initialize TypeScript Hono project",
    "steps": [
      "Initialize package.json with TypeScript support",
      "Install Hono and required dependencies",
      "Configure tsconfig.json",
      "Create project directory structure (src/)",
      "Set up dev scripts for running the server"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Create base Hono app with health check",
    "steps": [
      "Create main app entry point (src/index.ts)",
      "Initialize Hono application",
      "Add GET /health endpoint",
      "Verify server starts and responds"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement addition endpoint",
    "steps": [
      "Create POST /math/add endpoint",
      "Accept two numbers in request body",
      "Return sum in response",
      "Handle invalid input with error response"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement subtraction endpoint",
    "steps": [
      "Create POST /math/subtract endpoint",
      "Accept two numbers in request body",
      "Return difference in response",
      "Handle invalid input with error response"
    ],
    "passes": true
  },
  {
    "category": "feature",
    "description": "Implement multiplication endpoint",
    "steps": [
      "Create POST /math/multiply endpoint",
      "Accept two numbers in request body",
      "Return product in response",
      "Handle invalid input with error response"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement division endpoint",
    "steps": [
      "Create POST /math/divide endpoint",
      "Accept two numbers in request body",
      "Return quotient in response",
      "Handle division by zero error",
      "Handle invalid input with error response"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Verify all math endpoints work correctly",
    "steps": [
      "Test addition with valid inputs",
      "Test subtraction with valid inputs",
      "Test multiplication with valid inputs",
      "Test division with valid inputs",
      "Test division by zero returns error",
      "Test invalid input handling for all endpoints"
    ],
    "passes": false
  },
  {
    "category": "documentation",
    "description": "Create API documentation",
    "steps": [
      "Create README.md file",
      "Document all available endpoints",
      "Include request/response examples for each endpoint",
      "Add setup and running instructions",
      "Include curl examples for testing"
    ],
    "passes": false
  }
]
```

## Agent Instructions

1. Read activity.md first to understand current state
2. Find next task with "passes": false
3. Complete all steps for that task
4. Verify with curl
5. Update task to "passes": true
6. Log completion in activity.md

Important: Only modify the passes field. Do not remove or rewrite tasks.

## Completion Criteria
All tasks marked with "passes": true