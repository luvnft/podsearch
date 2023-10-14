#!/bin/bash
# deploy.sh

# Navigate to the project directory
cd /home/poddley/poddley_client

# Pull the latest code
git pull origin master

# Install dependencies
npm install

# Build the project
npm run build

# Reload the PM2 process
pm2 restart client