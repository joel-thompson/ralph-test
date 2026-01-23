# Math API

A TypeScript-based REST API built with Hono that performs basic mathematical operations (addition, subtraction, multiplication, and division).

## Features

- Built with [Hono](https://hono.dev/) - Fast, lightweight web framework
- TypeScript for type safety
- Simple JSON request/response format
- Input validation and error handling
- Health check endpoint

## Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

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

### Running the Server

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:3001/health
```

---

### Addition

Add two numbers together.

**Endpoint:** `POST /math/add`

**Request Body:**
```json
{
  "a": 5,
  "b": 3
}
```

**Success Response:**
```json
{
  "result": 8
}
```

**Error Response (Invalid Input):**
```json
{
  "error": "Invalid input: both a and b must be numbers"
}
```

**Example:**
```bash
# Valid request
curl -X POST http://localhost:3001/math/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 3}'

# Invalid request (non-numeric input)
curl -X POST http://localhost:3001/math/add \
  -H "Content-Type: application/json" \
  -d '{"a": "five", "b": 3}'
```

---

### Subtraction

Subtract one number from another.

**Endpoint:** `POST /math/subtract`

**Request Body:**
```json
{
  "a": 10,
  "b": 3
}
```

**Success Response:**
```json
{
  "result": 7
}
```

**Error Response (Invalid Input):**
```json
{
  "error": "Invalid input: both a and b must be numbers"
}
```

**Example:**
```bash
# Valid request
curl -X POST http://localhost:3001/math/subtract \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 3}'

# Invalid request (non-numeric input)
curl -X POST http://localhost:3001/math/subtract \
  -H "Content-Type: application/json" \
  -d '{"a": "ten", "b": 3}'
```

---

### Multiplication

Multiply two numbers together.

**Endpoint:** `POST /math/multiply`

**Request Body:**
```json
{
  "a": 6,
  "b": 7
}
```

**Success Response:**
```json
{
  "result": 42
}
```

**Error Response (Invalid Input):**
```json
{
  "error": "Invalid input: both a and b must be numbers"
}
```

**Example:**
```bash
# Valid request
curl -X POST http://localhost:3001/math/multiply \
  -H "Content-Type: application/json" \
  -d '{"a": 6, "b": 7}'

# Invalid request (non-numeric input)
curl -X POST http://localhost:3001/math/multiply \
  -H "Content-Type: application/json" \
  -d '{"a": "six", "b": 7}'
```

---

### Division

Divide one number by another.

**Endpoint:** `POST /math/divide`

**Request Body:**
```json
{
  "a": 15,
  "b": 3
}
```

**Success Response:**
```json
{
  "result": 5
}
```

**Error Response (Division by Zero):**
```json
{
  "error": "Division by zero is not allowed"
}
```

**Error Response (Invalid Input):**
```json
{
  "error": "Invalid input: both a and b must be numbers"
}
```

**Example:**
```bash
# Valid request
curl -X POST http://localhost:3001/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 15, "b": 3}'

# Division by zero
curl -X POST http://localhost:3001/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 0}'

# Invalid request (non-numeric input)
curl -X POST http://localhost:3001/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": "ten", "b": 2}'
```

---

## Error Handling

All endpoints validate input and return appropriate error messages:

- **400 Bad Request**: Invalid input (non-numeric values) or division by zero
- **Error format**: `{"error": "Error message here"}`

## Input Validation

All math endpoints require:
- Both `a` and `b` fields in the request body
- Both values must be of type `number`
- For division, `b` cannot be `0`

## Testing

You can test all endpoints using the curl examples provided above. Make sure the server is running before testing.

### Quick Test Suite

```bash
# Start the server first
npm start

# In another terminal, run these tests:

# Test health check
curl http://localhost:3001/health

# Test addition
curl -X POST http://localhost:3001/math/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 3}'

# Test subtraction
curl -X POST http://localhost:3001/math/subtract \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 3}'

# Test multiplication
curl -X POST http://localhost:3001/math/multiply \
  -H "Content-Type: application/json" \
  -d '{"a": 6, "b": 7}'

# Test division
curl -X POST http://localhost:3001/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 15, "b": 3}'

# Test division by zero (should return error)
curl -X POST http://localhost:3001/math/divide \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 0}'

# Test invalid input (should return error)
curl -X POST http://localhost:3001/math/add \
  -H "Content-Type: application/json" \
  -d '{"a": "five", "b": 3}'
```

## Project Structure

```
ralph-test/
├── src/
│   └── index.ts       # Main application file with all endpoints
├── dist/              # Compiled JavaScript (generated by build)
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

## Technologies Used

- **[Hono](https://hono.dev/)** - Web framework
- **[@hono/node-server](https://github.com/honojs/node-server)** - Node.js adapter for Hono
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[tsx](https://github.com/esbuild-kit/tsx)** - TypeScript execution for development

## License

ISC
