# Ralph Loop CLI (`ral`)

A TypeScript-based CLI tool for managing Claude-based development loops. The Ralph loop is a structured approach to AI-assisted development where Claude iteratively works on tasks following a plan until completion.

## Installation

```bash
npm install -g ral
```

Or use directly with `npx`:

```bash
npx ral <command>
```

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd ralph-test

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev -- <command>
```

## Prerequisites

- Node.js 18+
- Claude CLI installed and configured (`npm install -g @anthropic-ai/claude`)
- Valid Anthropic API key configured for Claude CLI

## Commands

### `ral create-settings`

Generate configuration files for Claude and MCP (Model Context Protocol) settings.

**Usage:**
```bash
ral create-settings [options]
```

**Options:**
- `-w, --working-directory <path>` - Target directory for settings files (default: current directory)
- `-f, --force` - Overwrite existing files if they exist

**Created Files:**
- `.claude/settings.json` - Claude configuration with MCP filesystem server
- `.mcp.json` - MCP server configuration

**Examples:**
```bash
# Create settings in current directory
ral create-settings

# Create settings in specific directory
ral create-settings -w ./my-project

# Overwrite existing settings files
ral create-settings -f
```

---

### `ral scaffold`

Generate the Ralph loop file structure with starter templates.

**Usage:**
```bash
ral scaffold [options]
```

**Options:**
- `-w, --working-directory <path>` - Target directory for scaffold files (default: current directory)
- `-f, --force` - Overwrite existing files if they exist

**Created Files:**
- `activity.md` - Activity log for tracking what the agent accomplishes each iteration
- `plan.md` - Project plan with structured task list
- `prompt.md` - Instructions for Claude to follow during the loop
- `screenshots/` - Directory for storing screenshots

**Examples:**
```bash
# Scaffold in current directory
ral scaffold

# Scaffold in new project directory
ral scaffold -w ./my-new-project

# Overwrite existing scaffold files
ral scaffold -f
```

---

### `ral run`

Execute the Ralph loop by repeatedly calling Claude with your prompt until completion or max iterations.

**Usage:**
```bash
ral run -m <iterations> [options]
```

**Options:**
- `-m, --max-iterations <number>` - Maximum number of iterations (required)
- `-w, --working-directory <path>` - Working directory containing loop files (default: current directory)

**Required Files:**
- `plan.md` - Project plan with tasks
- `prompt.md` - Instructions for Claude
- `activity.md` - Activity log

**Behavior:**
- Runs Claude CLI with your prompt file for up to `max-iterations` times
- Tracks and displays per-iteration and cumulative token usage and costs
- Exits with code 0 if Claude outputs `<promise>COMPLETE</promise>`
- Exits with code 1 if max iterations reached without completion

**Examples:**
```bash
# Run loop for up to 10 iterations
ral run -m 10

# Run loop in specific directory
ral run -m 5 -w ./my-project

# Typical workflow
ral scaffold -w ./my-project
cd ./my-project
# Edit plan.md and prompt.md
ral run -m 20
```

**Output:**
```
Iteration 1/10
Input tokens: 15234
Output tokens: 2341
Cache read tokens: 0
Cost this iteration: $0.123
Cumulative cost: $0.123

Iteration 2/10
...
```

## Typical Workflow

1. **Create a new project**
   ```bash
   mkdir my-ai-project
   cd my-ai-project
   ```

2. **Scaffold the Ralph loop structure**
   ```bash
   ral scaffold
   ```

3. **Configure Claude and MCP (optional)**
   ```bash
   ral create-settings
   ```

4. **Edit your project plan**
   - Open `plan.md` and define your tasks in the JSON structure
   - Each task should have: category, description, steps, and `passes: false`

5. **Customize the prompt**
   - Edit `prompt.md` with specific instructions for Claude
   - The default prompt instructs Claude to:
     - Read activity.md to understand current state
     - Find next task with `passes: false` in plan.md
     - Complete all steps for that task
     - Verify the task works
     - Update activity.md with what was done
     - Change task's `passes` to `true` in plan.md
     - Make a git commit

6. **Run the loop**
   ```bash
   ral run -m 20
   ```

7. **Monitor progress**
   - Check `activity.md` for detailed logs of what Claude accomplished
   - Review `plan.md` to see which tasks have `passes: true`
   - Examine git commits to see incremental changes

## Ralph Loop Philosophy

The Ralph loop is designed for iterative, autonomous AI development:

- **Structured Planning**: Tasks are broken down into clear steps with pass/fail states
- **Activity Logging**: Every change is documented with verification results
- **Incremental Progress**: One task at a time, with git commits for each
- **Self-Verification**: Claude tests its own work before marking tasks complete
- **Cost Tracking**: Token usage and costs are tracked per-iteration and cumulatively
- **Early Exit**: Loop completes when Claude outputs the completion promise

## File Structure

```
my-project/
├── .claude/
│   └── settings.json       # Claude configuration (optional)
├── .mcp.json               # MCP server config (optional)
├── activity.md             # Activity log (required for run)
├── plan.md                 # Project plan (required for run)
├── prompt.md               # Claude instructions (required for run)
└── screenshots/            # Screenshots directory
```

## Error Handling

The CLI provides clear error messages and suggestions:

- **Missing files**: If required files are missing for `ral run`, you'll get a helpful message suggesting to run `ral scaffold`
- **Invalid directory**: Working directory validation ensures paths exist
- **Claude CLI errors**: Errors from the Claude CLI are caught and reported clearly
- **JSON parsing**: Invalid JSON responses from Claude are handled gracefully

## Testing

The project includes comprehensive unit tests using Vitest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:run
```

Test coverage includes:
- File operations and utilities (21 tests)
- create-settings command (6 tests)
- scaffold command (7 tests)
- run command (7 tests)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm test` to verify all tests pass
5. Submit a pull request

## License

MIT

## Support

For issues, questions, or contributions, please visit the project repository.
