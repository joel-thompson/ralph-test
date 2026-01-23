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

const command = args[0];

if (command === 'add') {
  if (args.length < 3) {
    console.error("Error: add requires two arguments");
    console.error("Usage: math add <a> <b>");
    process.exit(1);
  }

  const a = parseFloat(args[1]!);
  const b = parseFloat(args[2]!);

  if (isNaN(a) || isNaN(b)) {
    console.error("Error: both arguments must be valid numbers");
    process.exit(1);
  }

  const sum = a + b;
  console.log(sum);
  process.exit(0);
}

if (command === 'subtract') {
  if (args.length < 3) {
    console.error("Error: subtract requires two arguments");
    console.error("Usage: math subtract <a> <b>");
    process.exit(1);
  }

  const a = parseFloat(args[1]!);
  const b = parseFloat(args[2]!);

  if (isNaN(a) || isNaN(b)) {
    console.error("Error: both arguments must be valid numbers");
    process.exit(1);
  }

  const difference = a - b;
  console.log(difference);
  process.exit(0);
}

if (command === 'multiply') {
  if (args.length < 3) {
    console.error("Error: multiply requires two arguments");
    console.error("Usage: math multiply <a> <b>");
    process.exit(1);
  }

  const a = parseFloat(args[1]!);
  const b = parseFloat(args[2]!);

  if (isNaN(a) || isNaN(b)) {
    console.error("Error: both arguments must be valid numbers");
    process.exit(1);
  }

  const product = a * b;
  console.log(product);
  process.exit(0);
}

console.log("Command not implemented yet");
