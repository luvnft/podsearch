#!/bin/bash

cd /home/poddley/poddley_client || exit 1  # Exit if the directory is not found
git pull origin master
npm install
npm run build
pm2 restart client