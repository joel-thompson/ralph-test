# Hono Math API

A TypeScript-based REST API built with [Hono](https://hono.dev/) that performs basic mathematical operations.

## Features

- Addition
- Subtraction
- Multiplication
- Division (with zero-division protection)
- Power/Exponentiation
- Health check endpoint
- Input validation with error handling

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

1. Build the project:

```bash
npm run build
```

2. Start the server:

```bash
npm start
```

The server will start on `http://localhost:3002`.

## API Endpoints

### Health Check

Check if the server is running.

**Endpoint:** `GET /health`

**Example:**

```bash
curl http://localhost:3002/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-23T19:35:21.938Z"
}
```

---

### Addition

Add two numbers together.

**Endpoint:** `POST /math/add`

**Request Body:**

```json
{
  "a": number,
  "b": number
}
```

**Example:**

```bash
curl -X POST http://localhost:3002/math/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 3}'
```

**Response:**

```json
{
  "operation": "add",
  "a": 5,
  "b": 3,
  "result": 8
}
```

**Error Response (Invalid Input):**

```bash
curl -X POST http://localhost:3002/math/add \
  -H "Content-Type: application/json" \
  -d '{"a": "five", "b": 3}'
```

```json
{
  "error": "Invalid input: both 'a' and 'b' must be numbers"
}
```

---

### Subtraction

Subtract one number from another.

**Endpoint:** `POST /math/subtract`

**Request Body:**

```json
{
  "a": number,
  "b": number
}
```

**Example:**

```bash
curl -X POST http://localhost:3002/math/subtract \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 3}'
```

**Response:**

```json
{
  "operation": "subtract",
  "a": 10,
  "b": 3,
  "result": 7
}
```

---

### Multiplication

Multiply two numbers together.

**Endpoint:** `POST /math/multiply`

**Request Body:**

```json
{
  "a": number,
  "b": number
}
```

**Example:**

```bash
curl -X POST http://localhost:3002/math/multiply \
  -H "Content-Type: application/json" \
  -d '{"a": 6, "b": 7}'
```

**Response:**

```json
{
  "operation": "multiply",
  "a": 6,
  "b": 7,
  "result": 42
}
```

---

### Division

Divide one number by another.

**Endpoint:** `POST /math/divide`

**Request Body:**

```json
{
  "a": number,
  "b": number
}
```

**Example:**

```bash
curl -X POST http://localhost:3002/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 20, "b": 4}'
```

**Response:**

```json
{
  "operation": "divide",
  "a": 20,
  "b": 4,
  "result": 5
}
```

**Error Response (Division by Zero):**

```bash
curl -X POST http://localhost:3002/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 0}'
```

```json
{
  "error": "Division by zero is not allowed"
}
```

---

### Power/Exponentiation

Raise a base number to an exponent power.

**Endpoint:** `POST /math/power`

**Request Body:**

```json
{
  "base": number,
  "exponent": number
}
```

**Example:**

```bash
curl -X POST http://localhost:3002/math/power \
  -H "Content-Type: application/json" \
  -d '{"base": 2, "exponent": 8}'
```

**Response:**

```json
{
  "operation": "power",
  "base": 2,
  "exponent": 8,
  "result": 256
}
```

**Error Response (Invalid Input):**

```bash
curl -X POST http://localhost:3002/math/power \
  -H "Content-Type: application/json" \
  -d '{"base": "two", "exponent": 8}'
```

```json
{
  "error": "Invalid input: both 'base' and 'exponent' must be numbers"
}
```

---

## Error Handling

All endpoints validate input and return appropriate error messages:

- **400 Bad Request**: Invalid input types (non-numeric values)
- **400 Bad Request**: Division by zero

## Testing

You can test all endpoints using the provided curl examples above. Make sure the server is running before testing.

### Quick Test Script

```bash
# Health check
curl http://localhost:3002/health

# Test addition
curl -X POST http://localhost:3002/math/add \
  -H "Content-Type: application/json" \
  -d '{"a": 15, "b": 27}'

# Test subtraction
curl -X POST http://localhost:3002/math/subtract \
  -H "Content-Type: application/json" \
  -d '{"a": 50, "b": 18}'

# Test multiplication
curl -X POST http://localhost:3002/math/multiply \
  -H "Content-Type: application/json" \
  -d '{"a": 9, "b": 8}'

# Test division
curl -X POST http://localhost:3002/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 100, "b": 5}'

# Test power
curl -X POST http://localhost:3002/math/power \
  -H "Content-Type: application/json" \
  -d '{"base": 5, "exponent": 3}'

# Test division by zero error
curl -X POST http://localhost:3002/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 42, "b": 0}'
```

## Technology Stack

- **Framework**: [Hono](https://hono.dev/) - Ultrafast web framework
- **Runtime**: Node.js with [@hono/node-server](https://github.com/honojs/node-server)
- **Language**: TypeScript
- **Build Tool**: TypeScript Compiler (tsc)

## Project Structure

```
.
├── src/
│   └── index.ts       # Main application file with all endpoints
├── dist/              # Compiled JavaScript output
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## License

ISC
