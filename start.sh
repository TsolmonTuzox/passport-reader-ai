#!/bin/bash

# Passport Reader AI - Start Script

echo "🌐 Starting Passport Reader AI System with Real OCR..."
echo "=================================="

# Check if Python is installed
if command -v python3 &> /dev/null; then
    echo "✅ Python3 found"
    echo "🚀 Starting CORS-enabled server for Tesseract.js"
    echo ""
    python3 server.py
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    echo "🚀 Starting CORS-enabled server for Tesseract.js"
    echo ""
    python server.py
else
    echo "❌ Python not found!"
    echo "Please install Python to run the development server"
    echo ""
    echo "Alternative: Use Node.js http-server"
    echo "npm install -g http-server"
    echo "http-server -p 3000 --cors"
    exit 1
fi