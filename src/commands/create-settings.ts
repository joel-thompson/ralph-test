import path from "path";
import {
  CLAUDE_SETTINGS_TEMPLATE,
  MCP_SETTINGS_TEMPLATE,
  RAL_JSON_TEMPLATE,
} from "../templates/index.js";
import {
  FileSystem,
  DefaultFileSystem,
  ensureDirectory,
  writeFileIfNotExists,
} from "../utils/file-helpers.js";

export interface CreateSettingsOptions {
  force?: boolean;
}

export async function createSettings(
  options: CreateSettingsOptions = {},
  fs: FileSystem = new DefaultFileSystem()
): Promise<void> {
  const workingDir = process.cwd();
  const force = options.force || false;

  // Ensure .claude directory exists
  const claudeDir = path.join(workingDir, ".claude");
  await ensureDirectory(claudeDir, fs);

  // Create .claude/settings.json
  const claudeSettingsPath = path.join(claudeDir, "settings.json");
  const claudeSettingsContent =
    JSON.stringify(CLAUDE_SETTINGS_TEMPLATE, null, 2) + "\n";
  const claudeResult = await writeFileIfNotExists(
    claudeSettingsPath,
    claudeSettingsContent,
    force,
    fs
  );

  if (claudeResult.written) {
    console.log(`Created ${claudeSettingsPath}`);
  } else {
    console.log(
      `Skipped ${claudeSettingsPath} (already exists, use -f to overwrite)`
    );
  }

  // Create .mcp.json
  const mcpPath = path.join(workingDir, ".mcp.json");
  const mcpContent = JSON.stringify(MCP_SETTINGS_TEMPLATE, null, 2) + "\n";
  const mcpResult = await writeFileIfNotExists(mcpPath, mcpContent, force, fs);

  if (mcpResult.written) {
    console.log(`Created ${mcpPath}`);
  } else {
    console.log(`Skipped ${mcpPath} (already exists, use -f to overwrite)`);
  }

  // Create ral.json
  const ralPath = path.join(workingDir, "ral.json");
  const ralContent = JSON.stringify(RAL_JSON_TEMPLATE, null, 2) + "\n";
  const ralResult = await writeFileIfNotExists(ralPath, ralContent, force, fs);

  if (ralResult.written) {
    console.log(`Created ${ralPath}`);
  } else {
    console.log(`Skipped ${ralPath} (already exists, use -f to overwrite)`);
  }
}
