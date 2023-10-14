#!/bin/bash

# Set environment variables
export PATH="$PATH:/root/.nvm/versions/node/v20.3.1/bin:/root/.nvm/versions/node/v20.3.1/bin/node:/root/.nvm/versions/node/v20.3.1/bin/pm2:/root/.nvm"
export PODDLEY_CLIENT_DIR="/home/poddley/poddley_client"

echo "Hello!!!!"
nvm use 20
cd /home/poddley/poddley_client || exit 1  # Exit if the directory is not found
git pull origin master
npm install
npm run build
pm2 restart client
echo "Finished deploying PoddleyClient" 