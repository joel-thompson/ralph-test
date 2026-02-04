import { DEV_SERVER_MANAGEMENT_SECTION } from "../templates/index.js";

export function injectServiceInfo(
  content: string,
  serviceNames: string[]
): string {
  if (serviceNames.length === 0) return content;

  const examples = serviceNames.slice(0, 2);
  const exampleService = examples[0];

  const serviceInfo = `

**Available services:** ${serviceNames.join(", ")}

**Example commands:**
\`\`\`bash
ral service start ${exampleService}    # Start the service
ral service status ${exampleService}   # Check if running and healthy
ral service logs ${exampleService}     # Fetch recent logs for debugging
ral service stop ${exampleService}     # Stop when done
\`\`\``;

  // Insert after the Dev Server Management section's first paragraph
  // Escape the section header for use in regex
  const escapedSection = DEV_SERVER_MANAGEMENT_SECTION.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const sectionPattern = new RegExp(`(${escapedSection}\\n\\n[^\\n]+)`);
  return content.replace(sectionPattern, `$1${serviceInfo}`);
}
