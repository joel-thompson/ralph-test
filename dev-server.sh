#!/bin/bash

# Kill any existing dev server on port 3001
PORT=3001
PID=$(lsof -ti:$PORT 2>/dev/null)
if [ ! -z "$PID" ]; then
  echo "Killing existing server on port $PORT (PID: $PID)"
  kill -9 $PID 2>/dev/null || true
  sleep 1
fi

# Start the dev server
npm run dev
