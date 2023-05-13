#!/bin/bash
yes | sudo apt-get update
yes | sudo apt-get upgrade
yes | sudo apt-get install curl
yes | curl -sL https://deb.nodesource.com/setup_19.x | sudo bash -
yes | sudo apt-get install nodejs
yes | sudo apt-get install npm
yes | sudo apt-get install ffmpeg
yes | sudo apt-get install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
yes | npm install
yes | sudo pip install -g -r requirements.txt
yes | sudo apt-get install screen
yes | sudo apt-get install python3-pip