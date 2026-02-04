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
  return content.replace(
    /(## Dev Server Management\n\n[^\n]+)/,
    `$1${serviceInfo}`
  );
}
