#!/bin/bash

# BlockVOTE - Status Check Script
# This script checks the status of all services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 BlockVOTE Project Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Function to check if a port is in use
check_port_status() {
    local port=$1
    local service_name=$2
    local url=$3
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name:${NC} Running on port $port"
        if [ -n "$url" ]; then
            echo -e "   🔗 Access: $url"
        fi
    else
        echo -e "${RED}❌ $service_name:${NC} Not running on port $port"
    fi
}

# Function to check service by PID file
check_pid_status() {
    local pidfile=$1
    local service_name=$2
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✅ $service_name PID:${NC} $pid (running)"
        else
            echo -e "${RED}❌ $service_name PID:${NC} $pid (not running)"
            rm -f "$pidfile"
        fi
    else
        echo -e "${YELLOW}⚠️  $service_name:${NC} No PID file found"
    fi
}

# Check PostgreSQL
echo -e "\n${BLUE}🗄️  Database (PostgreSQL):${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL:${NC} Running (systemctl)"
else
    echo -e "${RED}❌ PostgreSQL:${NC} Not running"
fi

# Check Ganache
echo -e "\n${BLUE}⛓️  Blockchain (Ganache):${NC}"
check_port_status 8545 "Ganache" "http://localhost:8545"
check_pid_status "/tmp/ganache.pid" "Ganache"

# Check Backend
echo -e "\n${BLUE}🔧 Backend (Spring Boot):${NC}"
check_port_status 8080 "Backend API" "http://localhost:8080"
check_pid_status "/tmp/backend.pid" "Backend"

# Check Frontend
echo -e "\n${BLUE}🌐 Frontend (React):${NC}"
check_port_status 3001 "Frontend Web" "http://localhost:3001"
check_pid_status "/tmp/frontend.pid" "Frontend"

# Check log files
echo -e "\n${BLUE}📝 Log Files:${NC}"
for log in ganache backend frontend; do
    if [ -f "/tmp/$log.log" ]; then
        size=$(du -h "/tmp/$log.log" | cut -f1)
        echo -e "${GREEN}✅ $log.log:${NC} $size"
    else
        echo -e "${YELLOW}⚠️  $log.log:${NC} Not found"
    fi
done

# Quick health checks
echo -e "\n${BLUE}🏥 Health Checks:${NC}"

# Test backend API
if curl -s http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API:${NC} Responding"
else
    echo -e "${RED}❌ Backend API:${NC} Not responding"
fi

# Test blockchain connection
if curl -s -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}' http://localhost:8545 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Blockchain:${NC} Responding"
else
    echo -e "${RED}❌ Blockchain:${NC} Not responding"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Commands:${NC}"
echo "   Start all:  ./start-all.sh"
echo "   Stop all:   ./stop-all.sh"
echo "   Status:     ./status.sh"