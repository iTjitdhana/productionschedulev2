#!/bin/bash

# Production Schedule System Deployment Script
# สำหรับ Linux Server

set -e

echo "🚀 Starting Production Schedule System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=3020
BACKEND_PORT=3110
DB_HOST=192.168.0.96
DB_PORT=3306

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "Frontend Port: $FRONTEND_PORT"
echo "Backend Port: $BACKEND_PORT"
echo "Database Host: $DB_HOST:$DB_PORT"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Check if ports are available
check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln | grep -q ":$port "; then
        echo -e "${YELLOW}⚠️  Port $port is already in use. Please stop the service using this port.${NC}"
        echo "To check what's using the port: sudo netstat -tulpn | grep :$port"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available for $service${NC}"
        return 0
    fi
}

echo -e "${BLUE}🔍 Checking port availability...${NC}"
check_port $FRONTEND_PORT "Frontend" || exit 1
check_port $BACKEND_PORT "Backend" || exit 1

# Check database connectivity
echo -e "${BLUE}🔍 Checking database connectivity...${NC}"
if command -v mysql &> /dev/null; then
    if mysql -h $DB_HOST -P $DB_PORT -u jitdhana -pJitdana@2025 -e "SELECT 1;" &> /dev/null; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot connect to database. Please check:${NC}"
        echo "  - Database server is running"
        echo "  - Network connectivity to $DB_HOST:$DB_PORT"
        echo "  - User credentials (jitdhana)"
        echo "  - Firewall settings"
        echo ""
        echo "Continuing with deployment (database will be checked when containers start)..."
    fi
else
    echo -e "${YELLOW}⚠️  MySQL client not installed. Skipping database connectivity check.${NC}"
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans || true

# Remove old images (optional)
echo -e "${BLUE}🧹 Cleaning up old images...${NC}"
docker image prune -f || true

# Build and start containers
echo -e "${BLUE}🔨 Building and starting containers...${NC}"
docker-compose up --build -d

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 10

# Check if containers are running
echo -e "${BLUE}🔍 Checking container status...${NC}"
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Containers are running${NC}"
else
    echo -e "${RED}❌ Some containers failed to start${NC}"
    echo "Container logs:"
    docker-compose logs
    exit 1
fi

# Test API endpoints
echo -e "${BLUE}🧪 Testing API endpoints...${NC}"

# Test backend health
if curl -f http://localhost:$BACKEND_PORT/api/health &> /dev/null; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API is not responding yet${NC}"
fi

# Test frontend
if curl -f http://localhost:$FRONTEND_PORT &> /dev/null; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend is not responding yet${NC}"
fi

# Show container status
echo -e "${BLUE}📊 Container Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo -e "${BLUE}📱 Access URLs:${NC}"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend API: http://localhost:$BACKEND_PORT"
echo "API Health: http://localhost:$BACKEND_PORT/api/health"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo "Restart services: docker-compose restart"
echo "Update services: docker-compose pull && docker-compose up -d"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "- Make sure MySQL is running on $DB_HOST:$DB_PORT"
echo "- Check firewall settings for ports $FRONTEND_PORT and $BACKEND_PORT"
echo "- Monitor logs for any errors: docker-compose logs -f"
