#!/usr/bin/env node

const args = process.argv.slice(2);

function displayHelp(): void {
  console.log(`
Math CLI - Perform basic math operations

Usage:
  math <command> <a> <b>
  math --help

Commands:
  add <a> <b>       Add two numbers
  subtract <a> <b>  Subtract b from a
  multiply <a> <b>  Multiply two numbers
  divide <a> <b>    Divide a by b

Options:
  --help, -h        Display this help message

Examples:
  math add 5 3
  math subtract 10 4
  math multiply 6 7
  math divide 20 5
`);
}

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  displayHelp();
  process.exit(0);
}

console.log("Command not implemented yet");
