#!/bin/bash

# Load NVM
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh  # This loads NVM

# Error Handling Function
handle_error() {
    echo "Error: $1"
    # Add a notification here if you wish e.g., send an email or Slack message.
    exit 1
}

echo "Deploying backend!"

# Switch Node Version
nvm use 20 || handle_error "Failed to switch Node version."

# Navigate to backend directory
cd /home/poddley/backend || handle_error "Directory /home/poddley/backend not found."

# Clean the repo and pull from the specified branch
git clean -fd
git pull origin master || handle_error "Failed to pull from master."

# Install dependencies
npm install || handle_error "npm install failed."

# Restart the backend
pm2 restart backend || handle_error "Failed to restart backend using pm2."

echo "Finished deploying PoddleyBackend."
