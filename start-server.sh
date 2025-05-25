#!/bin/bash

echo "=== AingDesk Server Setup and Start ==="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file to configure your environment variables."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build-server

# Create public directory if it doesn't exist
if [ ! -d "public" ]; then
    echo "Creating public directory..."
    mkdir -p public
fi

# Build frontend if it exists
if [ -d "frontend" ]; then
    echo "Building frontend..."
    npm run build-frontend
else
    echo "Frontend directory not found, skipping frontend build..."
fi

# Start the server
echo "Starting AingDesk Server..."
echo "Server will be available at: http://localhost:${PORT:-7071}"
echo "Socket.IO will be available at: http://localhost:${SOCKET_PORT:-7070}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start