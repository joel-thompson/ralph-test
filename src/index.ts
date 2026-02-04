#!/usr/bin/env node

import { Command } from "commander";
import { createSettings } from "./commands/create-settings.js";
import { scaffold } from "./commands/scaffold.js";
import { scaffoldJson } from "./commands/scaffold-json.js";
import { run } from "./commands/run.js";
import { runJson } from "./commands/run-json.js";
import { serviceStart } from "./commands/service-start.js";
import { serviceStop } from "./commands/service-stop.js";
import { serviceStatus } from "./commands/service-status.js";
import { serviceLogs } from "./commands/service-logs.js";

const program = new Command();

program
  .name("ral")
  .description(
    "Ralph loop CLI - A tool for managing Claude-based development loops"
  )
  .version("1.0.0");

// Register commands
program
  .command("create-settings")
  .description("Create .claude/settings.json and .mcp.json configuration files")
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .option("-f, --force", "Overwrite existing files")
  .action(async (options) => {
    try {
      await createSettings({
        workingDirectory: options.workingDirectory,
        force: options.force,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

program
  .command("scaffold")
  .description(
    "Create activity.md, plan.md, prompt.md files and screenshots/ folder"
  )
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .option("-f, --force", "Overwrite existing files")
  .action(async (options) => {
    try {
      await scaffold({
        workingDirectory: options.workingDirectory,
        force: options.force,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

program
  .command("scaffold-json")
  .description(
    "Create activity.md, plan.md (details), tasks.json, prompt.md files and screenshots/ folder"
  )
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .option("-f, --force", "Overwrite existing files")
  .action(async (options) => {
    try {
      await scaffoldJson({
        workingDirectory: options.workingDirectory,
        force: options.force,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

program
  .command("run")
  .description("Start the Ralph loop")
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .requiredOption(
    "-m, --max-iterations <number>",
    "Maximum loop iterations",
    parseInt
  )
  .action(async (options) => {
    try {
      await run({
        workingDirectory: options.workingDirectory || process.cwd(),
        maxIterations: options.maxIterations,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

program
  .command("run-json")
  .description("Start the Ralph JSON workflow loop")
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .requiredOption(
    "-m, --max-iterations <number>",
    "Maximum loop iterations",
    parseInt
  )
  .option("-v, --verbose", "Verbose logging (smart selection debug)")
  .action(async (options) => {
    try {
      await runJson({
        workingDirectory: options.workingDirectory || process.cwd(),
        maxIterations: options.maxIterations,
        verbose: options.verbose || false,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

// Service management commands
const serviceCommand = program.command("service").description("Manage services");

serviceCommand
  .command("start <name>")
  .description("Start a service using Docker Compose")
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .action(async (name: string, options) => {
    try {
      await serviceStart({
        workingDirectory: options.workingDirectory || process.cwd(),
        serviceName: name,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

serviceCommand
  .command("stop <name>")
  .description("Stop a service using Docker Compose")
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .action(async (name: string, options) => {
    try {
      await serviceStop({
        workingDirectory: options.workingDirectory || process.cwd(),
        serviceName: name,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

serviceCommand
  .command("status <name>")
  .description("Check the status of a service")
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .option("--json", "Output status in JSON format")
  .action(async (name: string, options) => {
    try {
      await serviceStatus({
        workingDirectory: options.workingDirectory || process.cwd(),
        serviceName: name,
        json: options.json,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

serviceCommand
  .command("logs <name>")
  .description("Fetch logs from a service using Docker Compose")
  .option(
    "-w, --working-directory <path>",
    "Working directory (default: current directory)"
  )
  .option("--tail <n>", "Number of lines to fetch (default: 200)", parseInt)
  .option("--json", "Output logs in JSON format")
  .action(async (name: string, options) => {
    try {
      await serviceLogs({
        workingDirectory: options.workingDirectory || process.cwd(),
        serviceName: name,
        tail: options.tail,
        json: options.json,
      });
    } catch (error) {
      console.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

program.parse();
