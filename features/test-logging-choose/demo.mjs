#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the input files
const inputText = readFileSync(join(__dirname, 'demo-input.txt'), 'utf8');
const config = JSON.parse(readFileSync(join(__dirname, 'demo-config.json'), 'utf8'));

// Split into lines and filter out empty lines
const lines = inputText.split('\n').filter(line => line.length > 0);

// Apply the min line length filter
const filteredLines = lines.filter(line => line.length >= config.minLineLength);

// Calculate average length of filtered lines
const avgLength = filteredLines.length > 0
  ? Math.round(filteredLines.reduce((sum, line) => sum + line.length, 0) / filteredLines.length)
  : 0;

// Print deterministic summary
console.log('=== Demo Script Summary ===');
console.log(`Total lines: ${lines.length}`);
console.log(`Min line length filter: ${config.minLineLength}`);
console.log(`Lines passing filter: ${filteredLines.length}`);
console.log(`Average length of filtered lines: ${avgLength} characters`);
console.log('===========================');

// Exit successfully
process.exit(0);
