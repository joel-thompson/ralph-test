# Math CLI

A TypeScript CLI application for performing basic math operations.

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd math-cli
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

Run the CLI using npm start:
```bash
npm start -- <command> <arguments>
```

Or use the dev mode with ts-node:
```bash
npm run dev <command> <arguments>
```

### Available Commands

- `add <a> <b>` - Add two numbers
- `subtract <a> <b>` - Subtract b from a
- `multiply <a> <b>` - Multiply two numbers
- `divide <a> <b>` - Divide a by b

### Options

- `--help` - Display help message with usage instructions

## Examples

### Addition
```bash
npm start -- add 5 3
# Output: 8

npm start -- add 10.5 2.3
# Output: 12.8
```

### Subtraction
```bash
npm start -- subtract 10 4
# Output: 6

npm start -- subtract 15.5 3.2
# Output: 12.3
```

### Multiplication
```bash
npm start -- multiply 6 7
# Output: 42

npm start -- multiply 3.5 2.0
# Output: 7
```

### Division
```bash
npm start -- divide 20 5
# Output: 4

npm start -- divide 15.5 3.1
# Output: 5
```

### Error Handling

The CLI handles invalid inputs gracefully:

```bash
npm start -- add 5 abc
# Output: Error: Invalid numbers provided

npm start -- divide 10 0
# Output: Error: Cannot divide by zero
```

### Help Command
```bash
npm start -- --help
# Displays usage instructions, available commands, and examples
```

## Development

Run in development mode without building:
```bash
npm run dev <command> <arguments>
```

Build the TypeScript project:
```bash
npm run build
```

## License

ISC
