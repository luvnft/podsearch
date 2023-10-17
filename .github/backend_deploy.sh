#!/bin/bash

# Set environment variables
export PATH="$PATH:/root/.nvm/versions/node/v20.3.1/bin:/root/.nvm/versions/node/v20.3.1/bin/node:/root/.nvm/versions/node/v20.3.1/bin/pm2:/root/.nvm"
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh  # This loads NVM

echo "Deploying backend!"
git clean -f -d
nvm use 20
cd /home/poddley/backend || exit 1  # Exit if the directory is not found
git pull origin master
npm install
echo "Finished deploying PoddleyBackend" 