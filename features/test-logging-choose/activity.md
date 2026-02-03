# Project Build - Activity Log

## Current Status
**Last Updated:** 2026-02-03
**Tasks Completed:** 1
**Current Task:** Setup artifacts created

---

## Session Log

### 2026-02-03 - Task 2/3: Setup Artifacts Created

**Task:** Create the demo input artifacts required by later tasks

**Changes Made:**
- Created `demo-input.txt` with 9 lines of sample text (varying lengths from 2 to 50 characters)
- Created `demo-config.json` with configuration: `{"minLineLength": 3}`

**Files Created:**
- `features/test-logging-choose/demo-input.txt` - Sample text input for the demo script
- `features/test-logging-choose/demo-config.json` - Configuration for line length filtering

**Verification:**
- Both files created successfully in the correct directory
- Config file contains valid JSON with the minLineLength property set to 3
- Input file contains varied line lengths to test filtering logic (includes lines shorter than 3 chars: "Hi!", "OK")

**Dependencies:** None required

**Notes:** Setup artifacts are now ready for the implementation task (Task 3) which will create the demo script that reads these files.

---

### 2026-02-03 - Task 3/3: Demo Script Implementation

**Task:** Implement a tiny demo script that reads demo-input.txt and prints a deterministic summary

**Changes Made:**
- Created `demo.mjs` that reads `demo-input.txt` and `demo-config.json`
- Script filters lines based on the `minLineLength` configuration value
- Calculates and displays deterministic statistics: total lines, filtered lines count, and average line length

**Files Created:**
- `features/test-logging-choose/demo.mjs` - Node.js ESM script that processes input files and prints summary

**Verification:**
Ran `node features/test-logging-choose/demo.mjs` and received the following output:

```
=== Demo Script Summary ===
Total lines: 9
Min line length filter: 3
Lines passing filter: 8
Average length of filtered lines: 45 characters
===========================
```

**Notes:**
- Script successfully reads both input files
- Filters out lines shorter than the configured minimum length (3 characters) - this excludes "Hi!" and "OK"
- Produces deterministic, consistent output
- Exits with code 0 (success)
- All dependencies handled by Node.js built-in modules (fs, path, url)
