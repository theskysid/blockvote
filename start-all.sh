#!/bin/bash

# BlockVOTE - Automated Startup Script
# This script starts all components in the correct order

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${BLUE}🚀 Starting BlockVOTE Project...${NC}"
echo "Project Root: $PROJECT_ROOT"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}⚠️  Port $port is in use. Killing existing process...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Step 1: Check and start PostgreSQL
echo -e "\n${BLUE}📊 Step 1: Checking PostgreSQL...${NC}"
if ! systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    sudo systemctl start postgresql
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Step 2: Start Ganache Blockchain
echo -e "\n${BLUE}⛓️  Step 2: Starting Ganache Blockchain...${NC}"
if check_port 8545; then
    kill_port 8545
fi

# Check if ganache-cli is installed
if ! command -v ganache-cli &> /dev/null; then
    echo -e "${RED}❌ ganache-cli not found. Installing...${NC}"
    npm install -g ganache-cli
fi

echo -e "${BLUE}Starting Ganache on port 8545...${NC}"
ganache-cli --port 8545 --deterministic --accounts 10 --host 0.0.0.0 > /tmp/ganache.log 2>&1 &
GANACHE_PID=$!
echo $GANACHE_PID > /tmp/ganache.pid

# Wait for Ganache to start
echo -e "${YELLOW}Waiting for Ganache to initialize...${NC}"
sleep 5

if check_port 8545; then
    echo -e "${GREEN}✅ Ganache blockchain started (PID: $GANACHE_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start Ganache${NC}"
    exit 1
fi

# Step 3: Start Backend (Spring Boot)
echo -e "\n${BLUE}🔧 Step 3: Starting Backend...${NC}"
if check_port 8080; then
    kill_port 8080
fi

cd "$BACKEND_DIR"

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven not found. Please install Maven first.${NC}"
    exit 1
fi

echo -e "${BLUE}Building and starting Spring Boot backend...${NC}"
mvn clean compile > /tmp/backend-build.log 2>&1 &
BUILD_PID=$!

# Wait for build to complete
wait $BUILD_PID
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend build completed${NC}"
else
    echo -e "${RED}❌ Backend build failed. Check /tmp/backend-build.log${NC}"
    exit 1
fi

# Start the backend
mvn spring-boot:run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > /tmp/backend.pid

echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 15

if check_port 8080; then
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start backend${NC}"
    exit 1
fi

# Step 4: Start Frontend (React)
echo -e "\n${BLUE}🌐 Step 4: Starting Frontend...${NC}"
if check_port 3001; then
    kill_port 3001
fi

cd "$FRONTEND_DIR"

# Check if Node.js and npm are available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm first.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install > /tmp/frontend-install.log 2>&1
fi

echo -e "${BLUE}Starting React frontend...${NC}"
PORT=3001 npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/frontend.pid

echo -e "${YELLOW}Waiting for frontend to start...${NC}"
sleep 10

if check_port 3001; then
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start frontend${NC}"
    exit 1
fi

# Summary
echo -e "\n${GREEN}🎉 BlockVOTE Project Successfully Started!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Ganache Blockchain:${NC} http://localhost:8545 (PID: $GANACHE_PID)"
echo -e "${GREEN}✅ Backend API:${NC}        http://localhost:8080 (PID: $BACKEND_PID)"
echo -e "${GREEN}✅ Frontend Web:${NC}       http://localhost:3001 (PID: $FRONTEND_PID)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 Log files:${NC}"
echo "   Ganache:  /tmp/ganache.log"
echo "   Backend:  /tmp/backend.log"
echo "   Frontend: /tmp/frontend.log"
echo ""
echo -e "${YELLOW}🛑 To stop all services, run:${NC} ./stop-all.sh"
echo ""
echo -e "${BLUE}🔗 Quick Access:${NC}"
echo "   Admin Login:  http://localhost:3001"
echo "   Voter Login:  http://localhost:3001"
echo ""
echo -e "${GREEN}Ready for testing! 🚀${NC}"

# Return to project root
cd "$PROJECT_ROOT"