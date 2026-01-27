#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('ral')
  .description('Ralph loop CLI - A tool for managing Claude-based development loops')
  .version('1.0.0');

// Commands will be registered here

program.parse();
