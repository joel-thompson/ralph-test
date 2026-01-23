#!/usr/bin/env node

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
Math CLI - Basic Math Operations

Usage:
  math <command> <arguments>

Commands:
  add <a> <b>        Add two numbers
  subtract <a> <b>   Subtract b from a
  multiply <a> <b>   Multiply two numbers
  divide <a> <b>     Divide a by b

Options:
  --help             Show this help message

Examples:
  math add 5 3
  math subtract 10 4
  math multiply 6 7
  math divide 20 5
`);
}

// Check for help flag
if (args.includes('--help') || args.length === 0) {
  showHelp();
  process.exit(0);
}

// Parse command and arguments
const command = args[0];
const a = parseFloat(args[1]);
const b = parseFloat(args[2]);

// Handle add command
if (command === 'add') {
  if (isNaN(a) || isNaN(b)) {
    console.error('Error: Invalid input. Please provide two valid numbers.');
    process.exit(1);
  }
  console.log(a + b);
  process.exit(0);
}

// Handle subtract command
if (command === 'subtract') {
  if (isNaN(a) || isNaN(b)) {
    console.error('Error: Invalid input. Please provide two valid numbers.');
    process.exit(1);
  }
  console.log(a - b);
  process.exit(0);
}

console.error(`Error: Unknown command '${command}'`);
process.exit(1);
