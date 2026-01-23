# Math CLI

A TypeScript command-line interface (CLI) application for performing basic math operations.

## Features

- Addition
- Subtraction
- Multiplication
- Division
- Error handling for invalid inputs and division by zero
- Built with TypeScript for type safety

## Installation

1. Clone the repository:
```bash
git clone https://github.com/joel-thompson/ralph-test.git
cd ralph-test
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

The CLI follows the pattern: `math <command> <a> <b>`

### Available Commands

- `add <a> <b>` - Add two numbers
- `subtract <a> <b>` - Subtract b from a
- `multiply <a> <b>` - Multiply two numbers
- `divide <a> <b>` - Divide a by b

### Help

To display help information:
```bash
npm start -- --help
```

### Examples

**Addition:**
```bash
npm start -- add 5 3
# Output: 8
```

**Subtraction:**
```bash
npm start -- subtract 10 4
# Output: 6
```

**Multiplication:**
```bash
npm start -- multiply 6 7
# Output: 42
```

**Division:**
```bash
npm start -- divide 20 5
# Output: 4
```

**Decimal Numbers:**
```bash
npm start -- add 10.5 7.3
# Output: 17.8
```

**Negative Numbers:**
```bash
npm start -- subtract -5 3
# Output: -8
```

## Error Handling

The CLI handles various error cases:

- **Invalid input (non-numeric values):**
```bash
npm start -- add abc 5
# Output: Error: both arguments must be valid numbers
```

- **Missing arguments:**
```bash
npm start -- add 5
# Output: Error: add requires exactly 2 arguments
```

- **Division by zero:**
```bash
npm start -- divide 10 0
# Output: Error: division by zero is not allowed
```

## Development

### Build
```bash
npm run build
```

### Development Mode (with ts-node)
```bash
npm run dev -- add 5 3
```

## Project Structure

```
ralph-test/
├── src/
│   └── index.ts      # Main CLI entry point
├── dist/             # Compiled JavaScript output
├── package.json      # Project dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

## Requirements

- Node.js (v14 or higher recommended)
- npm

## License

ISC
