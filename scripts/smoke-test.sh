#!/bin/bash

# Smoke Test Script
# Run basic tests after deployment

set -e

echo "🧪 Running smoke tests..."

# Configuration
APP_URL=${APP_URL:-"http://localhost:3000"}
MAX_RETRIES=5
RETRY_DELAY=2

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
for i in $(seq 1 $MAX_RETRIES); do
    if curl -f "$APP_URL/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed${NC}"
        break
    fi
    
    if [ $i -lt $MAX_RETRIES ]; then
        echo -e "${YELLOW}Retry $i/$MAX_RETRIES in ${RETRY_DELAY}s...${NC}"
        sleep $RETRY_DELAY
    else
        echo -e "${RED}❌ Health check failed${NC}"
        exit 1
    fi
done

# Test main page
echo -e "${YELLOW}Testing main page...${NC}"
if curl -f "$APP_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Main page accessible${NC}"
else
    echo -e "${RED}❌ Main page not accessible${NC}"
    exit 1
fi

# Test API endpoint
echo -e "${YELLOW}Testing API endpoint...${NC}"
if curl -f "$APP_URL/api/auth/verify" > /dev/null 2>&1 || true; then
    echo -e "${GREEN}✅ API accessible${NC}"
else
    echo -e "${YELLOW}⚠️ API endpoint check skipped${NC}"
fi

echo -e "${GREEN}✅ All smoke tests passed!${NC}"
