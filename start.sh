#!/bin/bash
# Run this to start up everything

# Build Backend
npm run production:buildBackend

# Build Client
npm run production:buildClient

# Start apps with PM2
pm2 start pm2.config.js