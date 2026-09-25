#!/bin/bash

# AWS EC2 Deployment Script
# Usage: ./scripts/deploy-aws.sh

set -e

echo "🚀 Deploying to AWS..."

# Configuration
INSTANCE_ID=${AWS_INSTANCE_ID:-"i-xxxxxxxxx"}
AWS_REGION=${AWS_REGION:-"us-east-1"}
APP_PATH=${AWS_APP_PATH:-"/home/ec2-user/agency-platform"}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get instance IP
echo -e "${YELLOW}Getting instance IP...${NC}"
IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $AWS_REGION \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

if [ -z "$IP" ] || [ "$IP" = "None" ]; then
    echo -e "${RED}❌ Could not get instance IP${NC}"
    exit 1
fi

echo -e "${YELLOW}Instance IP: $IP${NC}"

# Deploy via SSH
echo "Deploying to $IP..."

ssh -o StrictHostKeyChecking=no -i ~/.ssh/aws-key.pem "ec2-user@$IP" << 'EOSSH'
    # Stop old application
    sudo systemctl stop agency-platform || true
    
    # Pull latest code
    cd /home/ec2-user/agency-platform
    git pull origin main
    
    # Install dependencies
    npm install --legacy-peer-deps
    
    # Run migrations
    npx prisma db push
    
    # Build
    npm run build
    
    # Build Docker image
    docker build -t agency-platform:latest .
    
    # Stop old container
    docker stop agency-platform || true
    docker rm agency-platform || true
    
    # Run new container
    docker run -d \
        --name agency-platform \
        -p 3000:3000 \
        --env-file .env \
        --restart unless-stopped \
        agency-platform:latest
    
    echo "✅ Deployment complete!"
EOSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AWS deployment successful!${NC}"
else
    echo -e "${RED}❌ AWS deployment failed!${NC}"
    exit 1
fi
