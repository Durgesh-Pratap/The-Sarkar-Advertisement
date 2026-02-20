#!/bin/bash

echo "================================"
echo "🎯 Sarkar Advertisement System"
echo "================================"
echo ""
echo "Starting the application..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Starting server on http://localhost:3000"
echo ""
echo "📱 Open your browser and go to:"
echo "   Login: http://localhost:3000/login.html"
echo ""
echo "🔐 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

npm start
