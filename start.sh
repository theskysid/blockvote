#!/bin/bash

echo "=========================================="
echo "  BlockVOTE - Starting Application"
echo "=========================================="

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17 or higher."
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Java version: $(java -version 2>&1 | head -n 1)"
echo "✅ Node version: $(node -v)"
echo ""

# Start Backend
echo "🚀 Starting Backend (Spring Boot)..."
cd backend
mvn clean install -DskipTests
mvn spring-boot:run &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Start Frontend
echo "🚀 Starting Frontend (React)..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "=========================================="
echo "  ✅ Application Started Successfully!"
echo "=========================================="
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo "H2 Console: http://localhost:8080/h2-console"
echo ""
echo "Sample Credentials:"
echo "  Admin:   9999999999 / 123456"
echo "  Voter 1: 8888888888 / 123456"
echo "  Voter 2: 7777777777 / 123456"
echo "  Voter 3: 6666666666 / 123456"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================="

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
