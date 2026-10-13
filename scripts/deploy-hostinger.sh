#!/bin/bash

# Hostinger Deployment Script
# Usage: ./scripts/deploy-hostinger.sh

set -e

echo "🚀 Deploying to Hostinger..."

# Configuration
HOST=${HOSTINGER_HOST:-"your-host.com"}
USER=${HOSTINGER_USER:-"your-username"}
APP_PATH=${HOSTINGER_PATH:-"/var/www/agency-platform"}
KEY=${HOSTINGER_SSH_KEY:-"~/.ssh/hostinger"}

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if SSH key exists
if [ ! -f "$KEY" ]; then
    echo -e "${RED}❌ SSH key not found: $KEY${NC}"
    exit 1
fi

# Connect and deploy
echo -e "${YELLOW}Connecting to $HOST...${NC}"

ssh -i "$KEY" "$USER@$HOST" << 'EOSSH'
    # Stop old process
    echo "Stopping application..."
    pm2 stop agency-platform || true
    
    # Pull latest code
    cd /var/www/agency-platform
    echo "Pulling latest code..."
    git pull origin main
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
    
    # Run migrations
    echo "Running database migrations..."
    npx prisma db push
    
    # Build
    echo "Building application..."
    npm run build
    
    # Start with PM2
    echo "Starting application..."
    pm2 start "npm start" --name agency-platform
    pm2 save
    
    echo "✅ Deployment complete!"
EOSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Hostinger deployment successful!${NC}"
else
    echo -e "${RED}❌ Hostinger deployment failed!${NC}"
    exit 1
fi
