#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ensure we are in the project directory
cd "$(dirname "$0")"

echo -e "${YELLOW}=== ssKIND Frontend Deployment ===${NC}"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "${YELLOW}[1/5] Pulling latest changes...${NC}"
git pull

echo -e "${YELLOW}[2/5] Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}[3/5] Building the application...${NC}"
npm run build

echo -e "${YELLOW}[4/5] Checking PM2 process...${NC}"
if pm2 describe sskind-frontend > /dev/null 2>&1; then
    echo -e "${GREEN}Process exists, restarting...${NC}"
    pm2 restart ecosystem.config.cjs --update-env
else
    echo -e "${GREEN}Process not found, starting new...${NC}"
    pm2 start ecosystem.config.cjs
fi

echo -e "${YELLOW}[5/5] Saving PM2 process list...${NC}"
pm2 save

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Status:"
pm2 status sskind-frontend
echo ""
echo -e "Commands:"
echo -e "  View logs:    ${YELLOW}pm2 logs sskind-frontend${NC}"
echo -e "  Stop:         ${YELLOW}pm2 stop sskind-frontend${NC}"
echo -e "  Restart:      ${YELLOW}pm2 restart sskind-frontend${NC}"
echo -e "  Monitor:      ${YELLOW}pm2 monit${NC}" 