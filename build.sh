#!/bin/bash

# Build script for Vercel deployment
echo "Starting build process..."

# Navigate to client directory
cd client

# Install dependencies
echo "Installing client dependencies..."
npm install

# Build the React app
echo "Building React app..."
npm run build

echo "Build completed successfully!"
