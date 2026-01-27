## cli for ralph 
cli name: ral 

Typescript project, using the commander library
Jest for unit tests

Must be publishable to npm and installable globally (`npm install -g ral`)

### Templates
All template content should be embedded in code rather than external files. This ensures templates work correctly when installed from npm.
- JSON templates (settings.json, mcp.json): Define as TypeScript objects, use JSON.stringify() when writing
- Markdown templates (activity.md, plan.md, prompt.md): Define as template strings

Three commands, one to create Claude settings and MCP settings file, one to scaffold required files, one to start the Ralph loop

### create-settings
Creates .claude/settings.json and .mcp.json files in the working directory. Based on the .claude/settings.json and .mcp.json files in this project.

Args
1. `-w, --working-directory <path>` - Target directory (defaults to current directory)
2. `-f, --force` - Boolean flag. When set, overwrite existing files

Creates these in the working directory:
1. Claude settings
	1. goes in .claude/settings.json
2. MCP settings 
	1. goes in .mcp.json

Features
1. Creates those settings files
2. If -f flag is not set, skip any existing files (log which files were skipped)
3. Create .claude/ directory if it doesn't exist

#### testing / verification 
Write unit tests
Test the cli by running it, verifying behavior, and then deleting the files output as cleanup

### Scaffold command
Creates the required files/folders for Ralph to run. The activity log should be fresh (no activity logged).

Args 
1. `-w, --working-directory <path>` - Target directory (defaults to current directory)
2. `-f, --force` - Boolean flag. When set, overwrite existing files

Creates the following in the working directory:
1. Activity log (activity.md) - Empty activity log with header only
2. Example plan (plan.md) - Starter template with task list structure
3. Example prompt (prompt.md) - Basic prompt template with instructions for Claude
4. screenshots folder (screenshots/) - Empty folder for future screenshot support

Features
1. Creates the files in the appropriate places
2. If -f flag is not set, skip any existing files (log which files were skipped)
3. Create working directory if it doesn't exist

#### testing / verification 
Write unit tests
Test the cli by running it, verifying behavior, and then deleting the files output as cleanup 

### Run command
Starts the Ralph loop. Reference: ralph.sh in this repo

Call Claude via CLI: `claude -p "$(cat prompt.md)" --output-format json`
Create a function to wrap this call so we can mock it in unit tests

Args
1. `-w, --working-directory <path>` - Target directory (defaults to current directory)
2. `-m, --max-iterations <number>` - Maximum loop iterations (required)

Features
1. Uses the working directory to find the prompt, plan, activity log, and screenshots
2. Aborts if any of the required files do not exist (plan.md, prompt.md, activity.md). Prints helpful message suggesting to run `ral scaffold`
3. Parse JSON response for: result, usage.input_tokens, usage.output_tokens, usage.cache_read_input_tokens, total_cost_usd
4. Track cumulative totals across iterations
5. Print per-iteration and cumulative stats (tokens in/out, cache read, cost)
6. Check for `<promise>COMPLETE</promise>` in response to exit early with code 0
7. Exit code 1 if max iterations reached without completion

#### testing / verification 
Do not try to test the run command by running it. Rely only on unit tests. Make sure to mock the function to call claude

### Error Handling
All commands should follow these error handling patterns:
1. Exit with code 1 and descriptive message on file system errors (permissions, disk full, etc.)
2. Validate working directory exists before operations (or create it for scaffold)
3. For run command: if Claude CLI returns invalid JSON or errors, log the error and exit with code 1
4. All error messages should be user-friendly and suggest corrective action when possible

### Code Style
Write handlers for the CLI command
Validate all user input is usable before continuing 
Use dependency injection 
Create reusable functions that can be unit tested
Don't repeat yourself (dry) when possible 

### Examples
```bash
# create settings in current directory
ral create-settings

# create settings in ./feature1, overwriting existing
ral create-settings -w ./feature1 -f

# scaffold into ./feature1 folder
ral scaffold -w ./feature1

# scaffold and overwrite files in ./feature
ral scaffold -w feature -f

# run the loop in feature folder with 10 iterations 
ral run -w feature -m 10
```

### Future Features 
Not to implement right away, but later and keep in mind. Don't read these files into context unless we are working on features related to them

#### improve the base / example prompt
There's some good examples in here. 
https://github.com/snarktank/ralph/blob/main/prompt.md

#### use the Anthropic agents sdk
https://platform.claude.com/docs/en/agent-sdk/overview#subagents
Instead of calling Claude via CMD line do it via the agents sdk. Would remove the need for sandbox settings and mcp settings

Leave this open by making a function to call Claude from the command line that could be swapped out (dependency injection)
