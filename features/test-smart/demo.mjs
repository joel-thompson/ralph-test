import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read input file
const inputPath = join(__dirname, 'demo-input.txt');
const inputText = readFileSync(inputPath, 'utf-8');
const lines = inputText.split('\n').filter(line => line.length > 0);

// Read config file
const configPath = join(__dirname, 'demo-config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));

// Apply filter
const minLength = config.minLineLength || 0;
const filteredLines = lines.filter(line => line.length >= minLength);

// Calculate summary statistics
const totalLines = lines.length;
const filteredCount = filteredLines.length;
const avgLength = filteredLines.length > 0
  ? Math.round(filteredLines.reduce((sum, line) => sum + line.length, 0) / filteredLines.length)
  : 0;

// Print deterministic summary
console.log('=== Demo Script Summary ===');
console.log(`Total lines: ${totalLines}`);
console.log(`Min line length filter: ${minLength}`);
console.log(`Lines passing filter: ${filteredCount}`);
console.log(`Average length of filtered lines: ${avgLength} characters`);
console.log('===========================');

process.exit(0);
