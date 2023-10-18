#!/bin/bash

# Load NVM
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh  # This loads NVM

# Error Handling Function
handle_error() {
    echo "Error: $1"
    # Add a notification here if you wish e.g., send an email or Slack message.
    exit 1
}

echo "Deploying client!"

# Switch Node Version
nvm use 20 || handle_error "Failed to switch Node version."

# Navigate to client directory
cd /home/poddley/client || handle_error "Directory /home/poddley/client not found."

# Pull from the specified branch
git pull origin master || handle_error "Failed to pull from master."

# Install dependencies
npm install || handle_error "npm install failed."

# Build the project
npm run build || handle_error "npm run build failed."

# Restart the client
pm2 restart client || handle_error "Failed to restart client using pm2."

echo "Finished deploying PoddleyClient."
