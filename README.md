# Poddley - Search podcasts like text
## Frontend:
- Nuxt 3 for client-stuff
- [JSON to TypeScript type for types generation based on API response](https://transform.tools/json-to-typescript)
- Pinia for store
- TypeScript
- TailwindCSS for UI adjustments
- Bootstrap + Bootstrap Studio for responsive layout as it provides good UI for modifying design
- Netlify.com for CI/CD of Client code + using them as a DNS-manager for easier setup.
- Tracking is done by Plausible

## Backend:
### API:
- Route-Controller-Service structure for ExpressJS/Node-backends. [Rundown here](https://devtut.github.io/nodejs/route-controller-service-structure-for-expressjs.html#model-routes-controllers-services-code-structure)
- Written in TypeScript
- Prisma ORM, taking use of Optimistic Concurrency with the Prisma Python Client + MySQL as database

### General NGINX reverse proxy setup

``

server {
    listen 80;
    server_name api.poddley.com;

    location / {
        proxy_pass http://localhost:7700/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.poddley.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.poddley.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

``
### Full-text searching
- Automatic indexing of meilisearch indexes based on new data in MySQL database is done using a cron-job that pushes into the meilisearch indexes.
- Runs as an eGPU on a local computer running an RTX 1650 or something I think on my laptop
- Due to limitations on meilisearch and non-existant phrase-searching in combination with typo-tolerance, custom solution was made.
  - Normal key-word based searching with ranking rules:
    - rankingRules: [
        "proximity",
        "typo",
        "words"
      ],
   - Further search was done with 3-n-grams + jaccard string comparison finding the max score, sorting them based on similartScore and selecting the top 5. This has proved like a good solution

### Transcriber-service of podcast audio to text
- Python script using ts-stable (a timestamp improved version of OpenAI's Whisper model)
- Uses Puppeteer to get the top 10 podcasts from certain countries
- Uses feedparser and podcastsindex.com's SQlite database for getting rss-feeds for further parsing
- Express backend images endpoint using sharp to resize, image files stored in /uploads/ folder on backend provided by express
- nginx does the reverse proxy forwarding
  - images.poddley.com => .../api/images/ endpoints
  - api.poddley.com => .../api/ endpoints (transcriptions/search-functionality)
  - meilisearch.poddley.com => meilisearch GUI instance
  
### Other
- HTTPS everywhere done with let's encrypt

### Lighthouse score
![100](https://github.com/lukamo1996/poddley/assets/52632596/73235617-c7d0-4222-8b03-2a5fdbb604c6)

### Cron jobs
- Indexing from db to meilisearch-index
- DeviationCalculator:
  - Positive means the youtube video needs reduction in the time
  - Negative means the youtube video needs the addition of time

## Features planned adding:
### Do maybes
- [ ] Microphone-recording to text search (like Shazam)
- [ ] Login/Sign-up functionality to enable users to save podcasts.
- [ ] Native app?
- [ ] Set up workstation with multiple GPUs for better transcribing.
- [ ] Switch to iGPU, an RTX4090 for improved transcription, use the medium.en model
- [ ] ~~Switch to use the puppeteer script as time ensues~~ (meaningless)
- [ ] - [ ] Start transcriberingen med mini pcen
### Do musts
- [x] Fine-tune the search functionality based on phrase-searching and typo-tolerance
- [x] Fix the indexing bug that causes the entire database to be re-indexed each time
- [x] ~~Joe Rogan Recorder~~(illegal)
- [x] ~~Download all Podcast audio-files to own server to support long-term support~~ (probably illegal)
- [x] Add loading spinner only for firefox/chrome-based audioPlayers
- [x] ~~Create ElasticSearch full text search engine, switch to it from MeiliSearch~~
- [x] ~~Convert the insertionToDb on the TranscriptionService to javascript to take use of the $transaction functionality only available in the javascript client unlike ethe python-prisma-client port and enable multiple gpus to process transcriptions at the same time.~~
- [x] Switch from Whisper OpenAI to https://github.com/guillaumekln/faster-whisper 4x increase in speed 🤩🤩🤩 and that is with the fucking Large-v2 model omg fuck
- [x] Switch to this alignment model: jonatasgrosman/wav2vec2-large-xlsr-53-english
- [x] Stick to MeiliSearch, but use the new MatchingStrategy functionality and see if you can adapt the phrase searching to accomodate your needs
- [x] Use meilisearch as a rough-searching and then use n-gram(3) with jaccard-string-similarity to do the fine-tuned search
- [x] Fix 3x instance return on API
- [x] Add second-hand jaccard highlighting 
- [x] Downscale the pictures retrieved and store them on local
- [x] ~~Use Spotify audioplayer for the spotify podcasts~~ (pointless)
- [x] ~~Create spotify recorder~~ (it's illegal)
- [x] Adjust python transcription script for optimistic concurrency 
- [x] Reindex everything prior to 16. april.
- [x] Indexer alt inn i meilisearch igjen.
- [x] Sjekk om gratis vercel er bedre enn gratis netlify
- [x] Fix segment-area design
- [x] ~~Add embedded YouTube to episode-area??? Mulig i det hele tatt, skal den være også tidsbasert?~~
- [x] Legg til nginx infoen, arkitekturen osv.
- [x] Add bg to selected jutton and route to the buttons
- [x] Fikse loading spinner bug
- [x] We need 3 tabs that show at the top like the buttons:
  - New episodes
  - Trending episodes
  - Info
- [x]  ~~Add info component~~ (part of three tabs task) 
- [x]  ~~Add top 3 most searched podcasts~~ (part of tabs)
- [ ] Make MeiliSearch production probably.
- [ ] Add faceting for episode and podcast
- [ ] Legg til segment id route og episode og podcast
- [ ] Set up CI/CD pipeline for backend
- [ ] Make the types shared between backend and client
- [ ] Segments have to move
- [ ] Add word, by, word, highlighting during playback

