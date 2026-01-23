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

console.log('Math CLI initialized');
