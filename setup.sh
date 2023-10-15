#!/bin/bash

# Client startup process
cd ./client
npm install
npm run build
echo "Done building client!"

# Go to backend and install all its dependencies and build the prisma client
# cd ..
cd ./backend
npm install
prisma generate --schema="./prisma/schema.prisma"
tsc
echo "Done building backend!"

# Then we start the client and the backend using pm2 to keep them persistent
cd ..
npm install dotenv
pm2 install -g
pm2 start ./start.js