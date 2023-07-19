# Poddley - Search podcasts like text

## Demo
[Demo Link](https://poddley.com)
## Showcase
![image](https://github.com/lukamo1996/poddley/assets/52632596/789ec1cc-5d10-4f9d-8dbc-4b5cc2c46152)

## Design timeline

## Realizations
- Don't optimize too early
- Too much caching is bad
- Don't debounce API calls as it worses UI and user-experience. Use rate-limiting instead or some kind of dynamic rate-limiting like google does (no debouncing on backend first 10 api calls, then rate-limiting)

## Frontend:
- Nuxt 3 for client-stuff (with SSR for perfect SEO)
- [JSON to TypeScript type for types generation based on API response](https://transform.tools/json-to-typescript)
- Pinia for store
- TypeScript
- Pure TailwindCSS for UI adjustments and also the integrated PurgeCSS
- Bootstrap + Bootstrap Studio for responsive layout as it provides good UI for modifying design
- Cloudflare page for CI/CD of Client code + using them as a DNS-manager for easier setup.
- Tracking is done by ~~[Plausible](https://plausible.io/)~~ Cloudflare was free so...

## Backend:
### API:
- Route-Controller-Service structure for ExpressJS/Node-backends. [Rundown here](https://devtut.github.io/nodejs/route-controller-service-structure-for-expressjs.html#model-routes-controllers-services-code-structure)
- The backend is written in TypeScript
- Prisma Object Relational Mapper is used for database querying and modeling. Used with MySQL as database

### General NGINX reverse proxy setup
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

### Full-text searching
- Rust based full-text search engine called Meilisearch is used to create fast full-text search of transcription data indexed from the MySQL database.
- Due to limitations on meilisearch and non-existant phrase-searching with typo-tolerance, custom solution was made.
  - Custom solution consisted of the following search-ranking score:
    - rankingRules: [
        "proximity",
        "typo",
        "words"
      ],
   - ...and the server search was done with 3-n-grams + jaccard string comparison finding the max score, sorting them based on similarityScore and selecting the top 5. This has proved to be a good solution.

### Transcriber-service of podcast audio to text
- The transcriber is a python script that grabs a selection of podcast names from a json.
- Queries a SqLite database downloaded daily from PodcastIndex.
- Uses feedparser to get episode-names, audiofiles, titles etc. from the rss-feeds for further parsing
- Uses the original whisper AI to transcribe data
- Then uses WhisperX to re-align the timestamps in accordance with the audio file (using the large [wav2vec](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-english) model.
- Then finds the youtube video that fits to that audio file and updates the episode in the database.
- Downloads the youtube video and finds the offset in seconds between the audio-podcast and video-podcast to save time and avoid having to re-transcribe audio from youtube video as well. This implementation uses [British Broadcasting Channel's](https://github.com/bbc/audio-offset-finder) own implementation. This value is then added or subtracted from the "start"-value that accompanies all segments.
- If a new podcast is added, express backend images endpoint uses sharp-package to resize image to webp-format and stores it in /uploads/ folder on digitalocean backend.

### Current running nginx reverse proxies for easier usage and https-setup:
  - images.poddley.com => .../api/images/ endpoints
  - api.poddley.com => .../api/ endpoints (transcriptions/search-functionality)
  - meilisearch.poddley.com => meilisearch GUI instance
  
### Other
- HTTPS everywhere done with let's encrypt /free https certificates

### Lighthouse score
![100](https://github.com/lukamo1996/poddley/assets/52632596/73235617-c7d0-4222-8b03-2a5fdbb604c6)

### Cron jobs
- Indexing from db to meilisearch-index (every hour)
- DeviationCalculator:
  - Positive means the youtube video needs reduction in the time
  - Negative means the youtube video needs the addition of time

### AI services
- All AI services run 24/7 on this machine=>![image](https://github.com/lukamo1996/poddley/assets/52632596/db542c41-922b-4057-ac3f-a7b23ede4a6a). I used to run and do tests on runpod.io due to their cheap prices, but realized quickly that long term use would quickly become expensive. Paperspace was even more expensive. Deepgram was ridiculous expensive.

- The AI models were initially running on my local computer running an RTX 1650, but it was crashing frequently and had insufficient GPU memory (would terminate sporadically). I also tried running an RTX3060 using ADT-Link connected to my Legion 5 AMD Lenovo gaming laption through the M.2 NVME as an eGPU. That was deeply unsuccessful due to frequent crashes. All solutions were unsatisfactory so splurged for a workstation in the end.

### Realizations:
- No amount of time optimizing backend will save you from long TTFB (Time To First Byte). After spending a week optimizing backend, testing out Vercel and Netlify (Pro and Free tier) trying to get speed-index below 2 seconds. Most was futile. Finally decided to try Cloudflare, went straight to 1.2 seconds.
- Unused CSS and third-party script/services can be a pain in the ass to deal with.
- CDN's are awesome
- Binary Search is awesome
- Lazy-loading is king.

### Optimizations:
- Assets compression:
  - Decided to use Brotli Compression to improve transfer time.
    *Since Brotli was designed to compress streams on the fly, it is faster at both compressing content on the server and decompressing it in the browser than in gzip. In some cases the overall front-end decompression is up to 64% faster than gzip.* [Source](https://eu.siteground.com/blog/brotli-vs-gzip-compression/#:~:text=Since%20Brotli%20was%20designed%20to,to%2064%25%20faster%20than%20gzip.)
  - Only using webp on website due to faster loading speed and better compression during transfer [Source](https://developers.google.com/speed/webp/docs/webp_study#:~:text=From%20the%20tables%20above%2C%20we%20can%20observe%20that%20WebP%20gives%20additional%2025%25%2D34%25%20compression%20gains%20compared%20to%20JPEG%20at%20equal%20or%20slightly%20better%20SSIM%20index.)
  
  

## Features planned adding:
### Do-es
- ~~[ ] concert search to multiseach to speed up search time~~
- ~~[ ] Enable teksting on all iframes~~ (Youtube api doesn't support/allow this.
- ~~Create ElasticSearch full text search engine, switch to it from MeiliSearch~~
- [x] ~~Convert the insertionToDb on the TranscriptionService to javascript to take use of the $transaction functionality only available in the javascript client unlike ethe python-prisma-client port and enable multiple gpus to process transcriptions at the same time.~~
- [x] ~~Joe Rogan Recorder~~(illegal)
- [x] ~~Download all Podcast audio-files to own server to support long-term support~~ (probably illegal)
- [x] ~~Use Spotify audioplayer for the spotify podcasts~~ (pointless)
- [x] ~~Create spotify recorder~~ (it's illegal)
- [x] ~~Use Spotify audioplayer for the spotify podcasts~~ (pointless)
- [x] ~~Create spotify recorder~~ (it's illegal)
- ~~[ ] Native app?~~
- ~~[ ] Add faceting for episode and podcast (route for episode og podcast)~~
- ~~[ ] Make the types shared between backend and client~~
- ~~[x] We need 3 tabs that show at the top like the buttons:~~
  ~~- New episodes~~
  ~~- Trending episodes~~
  ~~- Info~~
- [x] ~~Add embedded YouTube to episode-area??? Mulig i det hele tatt, skal den være også tidsbasert?~~
- [x]  ~~Add info component~~ (part of three tabs task) 
- [x]  ~~Add top 3 most searched podcasts~~ (part of tabs)
- [x] ~~Switch to use the puppeteer script as time ensues~~ (meaningless)
- ~~[ ] Implement https://github.com/GoogleChromeLabs/quicklink and Instant.page~~
- ~~[ ] Set up CI/CD pipeline for backend (here: https://medium.com/@fredrik.burmester/nuxt-3-website-with-cloudflare-workers-and-github-actions-336411530aa1)~~
- ~~[x] Try Workes on Cloudflare just in case, with the nitro template~~ (using cloudflare images and pages)
- [x] Fine-tune the search functionality based on phrase-searching and typo-tolerance
- [x] Fix the indexing bug that causes the entire database to be re-indexed each time
- [x] Add loading spinner only for firefox/chrome-based audioPlayers
- [x] Switch from Whisper OpenAI to https://github.com/guillaumekln/faster-whisper 4x increase in speed 🤩🤩🤩 and that is with the fucking Large-v2 model omg fuck
- [x] Switch to this alignment model: jonatasgrosman/wav2vec2-large-xlsr-53-english
- [x] Stick to MeiliSearch, but use the new MatchingStrategy functionality and see if you can adapt the phrase searching to accomodate your needs
- [x] Use meilisearch as a rough-searching and then use n-gram(3) with jaccard-string-similarity to do the fine-tuned search
- [x] Fix 3x instance return on API
- [x] Add second-hand jaccard highlighting 
- [x] Downscale the pictures retrieved and store them on local
- [x] Adjust python transcription script for optimistic concurrency 
- [x] Reindex everything prior to 16. april.
- [x] Indexer alt inn i meilisearch igjen.
- [x] Sjekk om gratis vercel er bedre enn gratis netlify
- [x] Fix segment-area design
- [x] Legg til nginx infoen, arkitekturen osv.
- [x] Add bg to selected jutton and route to the buttons
- [x] Fikse loading spinner bug
- [x] Remove bold tab bar
- [x] Add loading spinner to the audio player as in v-if
- [x] Legg til loading for audio while loading
- [x] Legg til segment id 
- [x] Fix navbar
- [x] Detach logic of searching from navbar
- [x] Fix unique segment issue by modifying triplet
- [x] Refactor the returning logic backend
- [x] Indexer restne av databasen
- [x] Legg til loading indinator når api callet kjører
- [x] Gjør search ikonet til en x når den er nede
- [x] Turn dedigated cpu to api server
- [x] use lowest db cpu
- [x] possible idea: nuxt generate all static files => serve on bunnyCDN all as static => create CI/CD pipeline to bunnyCDN, kinda want to avoid cloudflare tbh
- [x] Write me an about page contact page and donate page
- [x] Disable plausible, netlify, vercel and images.poddley.com. Cloudflare literally does all that for free..
- [x] Login/Sign-up functionality.
- [x] Setup up multisearch for the search-service on the backend. Should give some slight performance benefits
- [x] Dont have debouncing on client side, but do have throttling + cancellable promises
- [x] Add helmet and add rate-limiting

Business Stuff
- [ ] Offer public API through external service
- [ ] Kontogreier, lagre ting og tang, pro konto?
    - [ ] profile upload etc using r3
    - [ ] ipvote downvote
    - [ ] delete accoutn save segments

Cool stuff
- [ ] Record to text thing
- [ ] Add word, by, word, highlighting during playback
- [ ] search filter
- [ ] Legg til navbar i toppen hvor det står hvor mange podcaster episoder er transcriba+ current listerens 

Performance:
- [ ] download all podcats (should be)...

Must
- [x] Light refactoring of backend and frontend to support SeachQuery and filter/sort parameteres + refactor ServiceWorker + change all APIs to POST requests.
- [ ] Find out why worker is slow on new backend. Json parsing? Filter setting on the meilisearch api?
- [ ] Fix the buttons
- [ ] add dark mode...
- [ ] finish the rest of the desktop design and shit
- [ ] Make MeiliSearch production probably.
- [ ] Segments have to move
- [x] Add segment search functionality route so it can be shared.
- [ ] add the firefox colors as the nuxt progress bar bar color  and find out why loding indicator doesnt work
- [x] search button index redirect

Oslo
- [ ] Start opp transcriberen igjen, som da kjører index, aligner, find uoutube find deviation, legg inn i database. Indexeren kjører uavhengig av dette.

Luka egne greier:
- [ ] Create a blog post explaining the project? Wordpress?

- [x] drop usage of hq720
- [x] start delayed hydratipn again
- ~~[ ] increase zoom further to 25% or 10%??~~ (not necessary, enough screen hagging)
- [x] fix donation page
- [x] fix nav buttons
- [x] fix the layout shitfs on the image downloading time…

- [x] Add esc listener to non-headless ui stuff
- [x] use vueUse instead of vlickoutside
- [x] øk margin på search oxen og marginBottom
- [x] set logo to be nuxtlink not href
- ~~[ ] move navbar to bottom~~ (bad idea, so no)
- ~~[ ] bruk en annen audio player kanskje som er bedre til å ferche metadata???~~

OsloGreier:
- 
        Segment ID:
        The segment ID is essentially quite easy to implement. Simply have a copy button in the upper right corner of the segment and when a user clicks on it a link will be appended toeh copy value of the OS. This will point to a simply have search="id" just like normal search as it wouldnt really make any difference as the meilisearch wouldnt find any unique instance of it in the database if some transcription isnt directly referncing that segment, but athats' 0% probable.
        Getting segment time while audio is being played.
        The process for implementing this is to load the first 1 min segments from a given location and then grab the next 1 min segments everytime the time is 10 seconds from the last time of the gotten segments. If someone jumps more than 10 seoconds a 
        head or to a section for which we dont hjave the time like 1 hour ahead, then we just get the time on that spot and 1 min back and worth. However, we want to cache this to avoid re-fetchingsso how would we do that? We need to someone keep a track of the fetched segments and the once we still need to fetch, but this needs to be done elegantly, any ideas?	
