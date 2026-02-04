import { describe, it, expect } from "vitest";
import { injectServiceInfo } from "./prompt-helpers.js";

describe("injectServiceInfo", () => {
  const sampleContent = `## Dev Server Management

IMPORTANT: Do not start dev servers directly.

## Other Section`;

  it("should return content unchanged when no services", () => {
    const result = injectServiceInfo(sampleContent, []);
    expect(result).toBe(sampleContent);
  });

  it("should inject single service name and examples", () => {
    const result = injectServiceInfo(sampleContent, ["web"]);
    expect(result).toContain("**Available services:** web");
    expect(result).toContain("ral service start web");
  });

  it("should inject multiple service names", () => {
    const result = injectServiceInfo(sampleContent, ["web", "api", "db"]);
    expect(result).toContain("**Available services:** web, api, db");
  });

  it("should use first service for example commands", () => {
    const result = injectServiceInfo(sampleContent, ["api", "web"]);
    expect(result).toContain("ral service start api");
    expect(result).not.toContain("ral service start web");
  });

  it("should return content unchanged if no Dev Server Management section", () => {
    const noSection = "## Other\n\nSome content";
    const result = injectServiceInfo(noSection, ["web"]);
    expect(result).toBe(noSection);
  });
});
