import { describe, it, expect, beforeEach } from "vitest";
import { createSettings } from "./create-settings.js";
import { FileSystem } from "../utils/file-helpers.js";
import path from "path";

describe("create-settings", () => {
  let mockFs: FileSystem;
  let writtenFiles: Map<string, string>;

  beforeEach(() => {
    writtenFiles = new Map();
    mockFs = {
      exists: async (filePath: string) => {
        // Directories always exist in our mock
        if (!filePath.includes(".")) return true;
        // Files exist if they've been written
        return writtenFiles.has(filePath);
      },
      readFile: async (filePath: string) => {
        const content = writtenFiles.get(filePath);
        if (!content) throw new Error(`File not found: ${filePath}`);
        return content;
      },
      writeFile: async (filePath: string, content: string) => {
        writtenFiles.set(filePath, content);
      },
      mkdir: async () => {},
    };
  });

  it("should create ral.json, .claude/settings.json and .mcp.json in current working directory", async () => {
    const cwd = process.cwd();

    await createSettings({}, mockFs);

    const ralPath = path.join(cwd, "ral.json");
    const claudeSettingsPath = path.join(cwd, ".claude", "settings.json");
    const mcpPath = path.join(cwd, ".mcp.json");

    expect(writtenFiles.has(ralPath)).toBe(true);
    expect(writtenFiles.has(claudeSettingsPath)).toBe(true);
    expect(writtenFiles.has(mcpPath)).toBe(true);
  });

  it("should create valid JSON in settings files", async () => {
    const cwd = process.cwd();

    await createSettings({}, mockFs);

    const ralPath = path.join(cwd, "ral.json");
    const claudeSettingsPath = path.join(cwd, ".claude", "settings.json");
    const mcpPath = path.join(cwd, ".mcp.json");

    const ralSettings = writtenFiles.get(ralPath);
    const claudeSettings = writtenFiles.get(claudeSettingsPath);
    const mcpSettings = writtenFiles.get(mcpPath);

    expect(() => JSON.parse(ralSettings!)).not.toThrow();
    expect(() => JSON.parse(claudeSettings!)).not.toThrow();
    expect(() => JSON.parse(mcpSettings!)).not.toThrow();
  });

  it("should not overwrite existing files when force is false", async () => {
    const cwd = process.cwd();
    const ralPath = path.join(cwd, "ral.json");
    const claudeSettingsPath = path.join(cwd, ".claude", "settings.json");

    // Pre-populate with existing content
    writtenFiles.set(ralPath, '{"existing": "content"}');
    writtenFiles.set(claudeSettingsPath, '{"existing": "content"}');

    await createSettings({ force: false }, mockFs);

    expect(writtenFiles.get(ralPath)).toBe('{"existing": "content"}');
    expect(writtenFiles.get(claudeSettingsPath)).toBe(
      '{"existing": "content"}'
    );
  });

  it("should overwrite existing files when force is true", async () => {
    const cwd = process.cwd();
    const ralPath = path.join(cwd, "ral.json");
    const claudeSettingsPath = path.join(cwd, ".claude", "settings.json");

    // Pre-populate with existing content
    writtenFiles.set(ralPath, '{"existing": "content"}');
    writtenFiles.set(claudeSettingsPath, '{"existing": "content"}');

    await createSettings({ force: true }, mockFs);

    const ralContent = writtenFiles.get(ralPath);
    const claudeContent = writtenFiles.get(claudeSettingsPath);
    expect(ralContent).not.toBe('{"existing": "content"}');
    expect(ralContent).toContain("runner");
    expect(claudeContent).not.toBe('{"existing": "content"}');
    expect(claudeContent).toContain("permissions");
  });
});
