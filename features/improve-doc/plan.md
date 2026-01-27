# Project Plan

## Project Overview

Improve the README documentation by adding comprehensive example workflows that demonstrate real-world usage of the Ralph loop. These examples should help users understand how to effectively use the tool for different development scenarios.

@spec.md

---

## Task List

```json
[
  {
    "category": "documentation",
    "description": "Add 'Local Development Setup' section for contributors/coworkers",
    "steps": [
      "Add section explaining how to clone and set up the project locally",
      "Include clear step-by-step commands: git clone, pnpm install, pnpm build",
      "Document multiple options for making 'ral' command available globally:",
      "  Option 1: pnpm link --global - one-liner, auto-updates on rebuild",
      "  Option 2: Shell alias - simple, explicit path, add to .zshrc/.bashrc",
      "  Option 3: Add dist folder to PATH",
      "For each option: show exact commands to run, keep explanation to 1-2 sentences",
      "Add note that npm install -g will work once published to npm",
      "Use code blocks liberally - readers should be able to copy-paste and go",
      "Place this section near the top of README, after Installation"
    ],
    "passes": true
  },
  {
    "category": "documentation",
    "description": "Add 'Writing a Spec (spec.md)' section",
    "steps": [
      "Explain the purpose of spec.md as a PRD/specification document that describes the project or feature",
      "Document the pattern of referencing @spec.md in plan.md so Claude has full context",
      "Include guidance on what to put in a spec: requirements, constraints, examples, API contracts, etc.",
      "Show example spec.md structure/template",
      "Explain the benefit: keeps plan.md focused on tasks while spec.md holds the detailed requirements",
      "Place this section before 'Setting Up Your Plan'"
    ],
    "passes": true
  },
  {
    "category": "documentation",
    "description": "Add 'Setting Up Your Plan' section",
    "steps": [
      "Document the workflow of creating a plan.md for a new feature/task",
      "Explain the AI-assisted approach: use an agent (Claude, ChatGPT, etc.) to help break down requirements into tasks",
      "Include example prompts for asking AI to generate task lists from a spec or requirements",
      "Emphasize the importance of manually reviewing and refining the generated plan before running the loop",
      "Cover how to write good task descriptions and steps that are verifiable",
      "Add tips on task granularity (not too big, not too small)",
      "Place this section before the workflow examples"
    ],
    "passes": true
  },
  {
    "category": "documentation",
    "description": "Add 'Building a New Feature from Scratch' workflow example",
    "steps": [
      "Create a detailed example showing: setting up a new feature folder, writing a plan.md with multiple related tasks, customizing prompt.md, running the loop, and reviewing results",
      "Include realistic task definitions in the example plan.md",
      "Show expected activity.md output after a few iterations",
      "Add this section after the 'Typical Workflow' section in README.md"
    ],
    "passes": true
  },
  {
    "category": "documentation",
    "description": "Add 'Refactoring Existing Code' workflow example",
    "steps": [
      "Create an example workflow for using Ralph to refactor code (e.g., extracting functions, improving error handling)",
      "Show how to structure tasks that depend on each other",
      "Include tips for breaking down refactoring into verifiable steps",
      "Add to the workflows section in README.md"
    ],
    "passes": true
  },
  {
    "category": "documentation",
    "description": "Add 'Debugging/Bug Fix' workflow example",
    "steps": [
      "Show how to set up a Ralph loop to investigate and fix a bug",
      "Include example plan with investigation, fix, and verification tasks",
      "Demonstrate how activity.md captures the debugging process",
      "Add to the workflows section in README.md"
    ],
    "passes": false
  },
  {
    "category": "documentation",
    "description": "Add 'Tips and Best Practices' section",
    "steps": [
      "Document best practices for writing effective plans (task granularity, clear steps)",
      "Include tips for prompt.md customization",
      "Add guidance on choosing max-iterations",
      "Include common pitfalls and how to avoid them",
      "Add after the workflow examples in README.md"
    ],
    "passes": false
  }
]
```
