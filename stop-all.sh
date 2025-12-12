#!/bin/bash

# BlockVOTE - Stop All Services Script
# This script stops all running components

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping BlockVOTE Project...${NC}"

# Function to kill process by PID file
kill_by_pidfile() {
    local pidfile=$1
    local service_name=$2
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
            kill "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${RED}Force killing $service_name...${NC}"
                kill -9 "$pid"
            fi
        fi
        rm -f "$pidfile"
        echo -e "${GREEN}✅ $service_name stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  No PID file for $service_name${NC}"
    fi
}

# Function to kill processes on port
kill_port() {
    local port=$1
    local service_name=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Killing processes on port $port ($service_name)...${NC}"
        echo $pids | xargs kill -9
        echo -e "${GREEN}✅ Port $port freed${NC}"
    else
        echo -e "${GREEN}✅ Port $port is already free${NC}"
    fi
}

# Stop Frontend (port 3001)
echo -e "\n${BLUE}🌐 Stopping Frontend...${NC}"
kill_by_pidfile "/tmp/frontend.pid" "Frontend"
kill_port 3001 "Frontend"

# Stop Backend (port 8080)
echo -e "\n${BLUE}🔧 Stopping Backend...${NC}"
kill_by_pidfile "/tmp/backend.pid" "Backend"
kill_port 8080 "Backend"

# Stop Ganache (port 8545)
echo -e "\n${BLUE}⛓️  Stopping Ganache Blockchain...${NC}"
kill_by_pidfile "/tmp/ganache.pid" "Ganache"
kill_port 8545 "Ganache"

# Clean up log files
echo -e "\n${BLUE}🧹 Cleaning up...${NC}"
rm -f /tmp/ganache.log /tmp/backend.log /tmp/frontend.log
rm -f /tmp/backend-build.log /tmp/frontend-install.log
echo -e "${GREEN}✅ Log files cleaned${NC}"

echo -e "\n${GREEN}🎉 All BlockVOTE services stopped successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}To restart the project, run:${NC} ./start-all.sh"