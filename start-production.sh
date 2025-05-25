#!/bin/bash

# AingDesk Backend Production Startup Script

echo "Starting AingDesk Backend Server..."

# Set production environment
export NODE_ENV=production
export PORT=12000

# Ensure required directories exist
mkdir -p dist/electron/data/context
mkdir -p dist/electron/data/logs
mkdir -p build/extraResources/languages

# Build the application
echo "Building TypeScript..."
npm run build-server

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Start the server
echo "Starting server on port $PORT..."
node dist/server.js

echo "Server stopped."