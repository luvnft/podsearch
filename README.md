# Poddley - Shazam for podcasts

## Main Goal:
The main goal of the website/service is to be the Shazam for podcasts. Therefore we are not going to expand upon this further than its overall search functionality and mapping of resource-sources and beyond its main purpose which is to display/hotlink and allow search of podcast transcriptions. 

## Status build
[![cloudflare](https://github.com/lukamo1996/poddley/actions/workflows/cloudflare.yml/badge.svg)](https://github.com/lukamo1996/poddley/actions/workflows/cloudflare.yml)

## Demo
[Demo Link](https://poddley.com)

## Design iterations
<img src="https://github.com/lukamo1996/poddley/assets/52632596/6e4ca29a-6093-481d-b566-39aac740dbf5" width="23%"></img>
<img src="https://github.com/lukamo1996/poddley/assets/52632596/95e34b1c-29f3-40c3-8aed-5caeae92cb28" width="23%"></img>
<img src="https://github.com/lukamo1996/poddley/assets/52632596/ae14c18a-691e-43c6-8c07-079818eebf34" width="23%"></img>
<img src="https://github.com/lukamo1996/poddley/assets/52632596/fac49f03-2f1b-45f6-b870-3dafbffc23b6" width="23%"></img>
<img src="https://github.com/lukamo1996/poddley/assets/52632596/56327a71-be18-4046-962f-46411554239c" width="23%"></img>
<img src="https://github.com/lukamo1996/poddley/assets/52632596/91629802-afb1-4770-8f66-4214b8a28d71" width="23%"></img>
<img src="https://github.com/lukamo1996/poddley/assets/52632596/31b170c6-1dd6-439a-8853-bb948fbdce1c" width="23%"></img>
<img src="https://github.com/lukamo1996/poddley/assets/52632596/21a0014e-1abc-4165-a8e9-575a19547235" width="23%"></img>


## Realizations
- I don't like apps.
- Don't optimize too early
- Too much caching is bad
- Debouncing API should be (human reaction time in ms - API latency).
- No amount of time optimizing backend will save you from long TTFB (Time To First Byte). After spending a week optimizing backend, testing out Vercel and Netlify (Pro and Free tier) trying to get speed-index below 2 seconds. Most was futile. Finally decided to try Cloudflare, went straight to 1.2 seconds.
- Unused CSS and third-party script/services can be a pain in the ass to deal with.
- CDN's are awesome
- Lazy-loading is king.
- Assets compression:
  - Decided to use Brotli Compression to improve transfer time.
    *Since Brotli was designed to compress streams on the fly, it is faster at both compressing content on the server and decompressing it in the browser than in gzip. In some cases the overall front-end decompression is up to 64% faster than gzip.* [Source](https://eu.siteground.com/blog/brotli-vs-gzip-compression/#:~:text=Since%20Brotli%20was%20designed%20to,to%2064%25%20faster%20than%20gzip.)
  - Only using webp on website due to faster loading speed and better compression during transfer [Source](https://developers.google.com/speed/webp/docs/webp_study#:~:text=From%20the%20tables%20above%2C%20we%20can%20observe%20that%20WebP%20gives%20additional%2025%25%2D34%25%20compression%20gains%20compared%20to%20JPEG%20at%20equal%20or%20slightly%20better%20SSIM%20index.)
  - Also using gzip as they apparrntly arent mutually exclusive
## Frontend:
- Nuxt 3 for client-stuff:
	- SSR enabled
	- Pages-structure
	- Nitro-server with gzip- and brotli-compression and minified assets
- [JSON to TypeScript type for types generation based on API response](https://transform.tools/json-to-typescript)
- TypeScript everywhere.
- Cloudflare page for CI/CD of Client code + using them as a DNS-manager for easier setup.
- Tracking was done by ~~[Plausible](https://plausible.io/)~~ Switched to Cloudflare as it was free
- ServiceWorker for offloading the main-thread from the frequest API-calls to the backend-API. There are multiple ways to solve this. Throttling + Debouncing on user-input (during instantSearch) is a possibility, but it often causes laggy ui and mucky logic (as in the first 1 second API calls should be instantaneous, but the ones after shan't). Offloading it all to a ServiceWorker showed much better results in spite of it being tricky to implement.
- Nuxt 3 modules used:
	- TailwindCSS module (integrated PurgeCSS and fast design development)
	- Supabase module
	- NuxtImage module
	- HeadlessUI module
	- SVG-sprite-module (for reducing SVG-requests to server)
	- Nuxt Delayed Hydration module (for improved Lighthouse score and loading time)
	- Lodash module (for _Debounce-function)
	- Device module (for iPhone-device detection)
	- Pinia Nuxt Module (for global storage across components)
 	- NuxtJS Ionic module (for fast Android/iOS development)
  	- Nightwind Tailwind plugin (for deep automatic nightmode)

## Backend:
### Services:
The services are running primarily as pm2-processes. With daemon-autorestart on server-shutdown, which are:
- Express-API: Does the full-text search functionality as an API querying the Meilisearch-instance
- Indexer: Pushes the segments, transcription, episode and podcast data to the meilisearch-instance
- Transcriber:
  - Transcriber_main: Does pessimistic locking of rows and sends them to the transcriber
  - Transcriber_transcribe: Does the transcribing using WhispherX and saves it like a json + does the deviationCalculation and Youtube-information-getting
  - Transcriber_dbinserter: Does the inserting of the json to the db
- Meilisearch-instance: Does the full-text search functionality

### API:
- Route-Controller-Service architecture for ExpressJS/Node-backends. [Rundown here](https://devtut.github.io/nodejs/route-controller-service-structure-for-expressjs.html#model-routes-controllers-services-code-structure)
- The backend is written in TypeScript
- Prisma Object Relational Mapper is used for database querying and modeling. Used with MySQL as database.

### Indexer 
Contunously fetches from database and pushing in new transcriptions to Meilisearch instance.

### Meilisearch instance
A meilisearch instance running with the following settings (all indexes use the default settings), besides what's specified in the backend scripts.
##### Indexes
```

// 20230811100148
// https://meilisearch.poddley.com/indexes

{
  "results": [
    {
      "uid": "episodes",
      "createdAt": "2023-07-16T09:34:08.17973422Z",
      "updatedAt": "2023-07-16T16:08:47.711337274Z",
      "primaryKey": "id"
    },
    {
      "uid": "podcasts",
      "createdAt": "2023-07-16T09:34:08.151876845Z",
      "updatedAt": "2023-07-16T16:08:46.805978082Z",
      "primaryKey": "id"
    },
    {
      "uid": "segments",
      "createdAt": "2023-07-16T09:34:08.099810144Z",
      "updatedAt": "2023-07-16T16:25:23.740301301Z",
      "primaryKey": "id"
    },
    {
      "uid": "transcriptions",
      "createdAt": "2023-07-16T09:34:08.05460293Z",
      "updatedAt": "2023-07-16T16:10:23.650756332Z",
      "primaryKey": "id"
    }
  ],
  "offset": 0,
  "limit": 20,
  "total": 4
}
```
##### Episodes:
```
{
  "uid": "episodes",
  "createdAt": "2023-07-16T09:34:08.17973422Z",
  "updatedAt": "2023-07-16T16:08:47.711337274Z",
  "primaryKey": "id"
}

{
  "displayedAttributes": [
    "*"
  ],
  "searchableAttributes": [
    "*"
  ],
  "filterableAttributes": [
    "episodeGuid"
  ],
  "sortableAttributes": [
    "addedDate"
  ],
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness"
  ],
  "stopWords": [
    
  ],
  "synonyms": {
    
  },
  "distinctAttribute": null,
  "typoTolerance": {
    "enabled": true,
    "minWordSizeForTypos": {
      "oneTypo": 5,
      "twoTypos": 9
    },
    "disableOnWords": [
      
    ],
    "disableOnAttributes": [
      
    ]
  },
  "faceting": {
    "maxValuesPerFacet": 100
  },
  "pagination": {
    "maxTotalHits": 1000
  }
}

```
##### Transcriptions:
```
{
  "uid": "transcriptions",
  "createdAt": "2023-07-16T09:34:08.05460293Z",
  "updatedAt": "2023-07-16T16:10:23.650756332Z",
  "primaryKey": "id"
}

{
  "displayedAttributes": [
    "*"
  ],
  "searchableAttributes": [
    "transcription"
  ],
  "filterableAttributes": [
    
  ],
  "sortableAttributes": [
    
  ],
  "rankingRules": [
    "exactness",
    "proximity",
    "typo",
    "words"
  ],
  "stopWords": [
    
  ],
  "synonyms": {
    
  },
  "distinctAttribute": null,
  "typoTolerance": {
    "enabled": true,
    "minWordSizeForTypos": {
      "oneTypo": 5,
      "twoTypos": 9
    },
    "disableOnWords": [
      
    ],
    "disableOnAttributes": [
      
    ]
  },
  "faceting": {
    "maxValuesPerFacet": 100
  },
  "pagination": {
    "maxTotalHits": 1000
  }
}
```

##### Segments:
```
{
  "uid": "segments",
  "createdAt": "2023-07-16T09:34:08.099810144Z",
  "updatedAt": "2023-07-16T16:25:23.740301301Z",
  "primaryKey": "id"
}

{
  "displayedAttributes": [
    "*"
  ],
  "searchableAttributes": [
    "text"
  ],
  "filterableAttributes": [
    "belongsToEpisodeGuid",
    "belongsToPodcastGuid",
    "belongsToTranscriptGuid",
    "end",
    "id",
    "start"
  ],
  "sortableAttributes": [
    "start"
  ],
  "rankingRules": [
    "exactness",
    "sort",
    "proximity",
    "typo",
    "words"
  ],
  "stopWords": [
    
  ],
  "synonyms": {
    
  },
  "distinctAttribute": null,
  "typoTolerance": {
    "enabled": true,
    "minWordSizeForTypos": {
      "oneTypo": 5,
      "twoTypos": 9
    },
    "disableOnWords": [
      
    ],
    "disableOnAttributes": [
      
    ]
  },
  "faceting": {
    "maxValuesPerFacet": 100
  },
  "pagination": {
    "maxTotalHits": 1000
  }
}
```

##### Podcasts:
```
{
  "uid": "podcasts",
  "createdAt": "2023-07-16T09:34:08.151876845Z",
  "updatedAt": "2023-07-16T16:08:46.805978082Z",
  "primaryKey": "id"
}

{
  "displayedAttributes": [
    "*"
  ],
  "searchableAttributes": [
    "*"
  ],
  "filterableAttributes": [
    "podcastGuid"
  ],
  "sortableAttributes": [
    
  ],
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness"
  ],
  "stopWords": [
    
  ],
  "synonyms": {
    
  },
  "distinctAttribute": null,
  "typoTolerance": {
    "enabled": true,
    "minWordSizeForTypos": {
      "oneTypo": 5,
      "twoTypos": 9
    },
    "disableOnWords": [
      
    ],
    "disableOnAttributes": [
      
    ]
  },
  "faceting": {
    "maxValuesPerFacet": 100
  },
  "pagination": {
    "maxTotalHits": 1000
  }
}
```

### Transcriber/Re-alignment-service
- The transcriber is a python script that grabs a selection of podcast names from a json.
- Queries a SQLite database downloaded daily from PodcastIndex.
- Uses feedparser to get episode-names, audiofiles, titles etc. from the rss-feeds for further parsing
- ~~Uses the original whisper AI to transcribe data~~ Uses WhispherX to transcribe and align the segments. This implementation is better than the original Whisper due to it using faster-whisper under the hood which supports batching among other performance-improvements.
- Then uses WhisperX to re-align the timestamps in accordance with the audio file (using the large [wav2vec](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-english) model.
- Then finds the youtube video that fits to that audio file and updates the episode in the database.
- Downloads the youtube video and finds the offset in seconds between the audio-podcast and video-podcast to save time and avoid having to re-transcribe audio from youtube video as well. This implementation uses [British Broadcasting Channel's](https://github.com/bbc/audio-offset-finder) own implementation. This value is then added or subtracted from the "start"-value that accompanies all segments.
- DeviationCalculator:
  - Positive means the youtube video needs reduction in the time
  - Negative means the youtube video needs the addition of time
- ~~If a new podcast is added, express backend images endpoint uses sharp-package to resize image to webp-format and stores it in /uploads/ folder on digitalocean backend.~~
- We upload the images directly to cloudflare images which does all the resizing and it does it dynamically and on the go in accordance to the image size on all devices.

# For meilisearch.poddley.com

```
server {
    listen 80;
    listen [::]:80;

    server_name meilisearch.poddley.com;

    location / {
        proxy_pass http://localhost:7700;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/meilisearch.poddley.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meilisearch.poddley.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```
# For all other routes (default server)

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name api.poddley.com;

    # Add this line to increase max upload size
    client_max_body_size 30M;

    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.poddley.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.poddley.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

```

### Full-text searching (this idea was dumped due to it ruining backend functionality and making further id-implementations gunk)
- Rust based full-text search engine called Meilisearch is used to create fast full-text search of transcription data indexed from the MySQL database.
- Due to limitations on meilisearch and non-existant phrase-searching with typo-tolerance, custom solution was made.
  - Custom solution consisted of the following search-ranking score:
    - rankingRules: [
        "proximity",
        "typo",
        "words"
      ],
   - ...and the server search was done with 3-n-grams + jaccard string comparison finding the max score, sorting them based on similarityScore and selecting the top 5. This has proved to be a good solution.

### Current running nginx reverse proxies for easier usage and https-setup:
  - api.poddley.com => .../api/ endpoints (transcriptions/search-functionality)
  - meilisearch.poddley.com => meilisearch GUI instance
  
### Other
- HTTPS everywhere done with let's encrypt. Free https certificates

### Lighthouse score
Has to be a live version auto

### AI services
- All AI services run 24/7 on this machine:
![image](https://github.com/lukamo1996/poddley/assets/52632596/db542c41-922b-4057-ac3f-a7b23ede4a6a)

- I used to run and do tests on runpod.io due to their cheap prices, but realized quickly that long term use would quickly become expensive. Paperspace was even more expensive. Deepgram was ridiculous expensive.

- The AI models were initially running on my local computer running an RTX 1650, but it was crashing frequently and had insufficient GPU memory (would terminate sporadically). I also tried running an RTX3060 using ADT-Link connected to my Legion 5 AMD Lenovo gaming laption through the M.2 NVME as an eGPU. That was deeply unsuccessful due to frequent crashes. All solutions were unsatisfactory so splurged for a workstation in the end.

## Features planned adding:
### Do-es
- [ ] ~~Covert search to multiseach to speed up search time~~
- [ ] ~~Enable teksting on all iframes~~ (Youtube api doesn't support/allow this.
- [ ] ~~Create ElasticSearch full text search engine, switch to it from MeiliSearch~~
- [x] ~~Convert the insertionToDb on the TranscriptionService to javascript to take use of the $transaction functionality only available in the javascript client unlike ethe python-prisma-client port and enable multiple gpus to process transcriptions at the same time.~~
- [x] ~~Joe Rogan Recorder~~(illegal)
- [x] ~~Download all Podcast audio-files to own server to support long-term support~~ (probably illegal)
- [x] ~~Use Spotify audioplayer for the spotify podcasts~~ (pointless)
- [x] ~~Create spotify recorder~~ (it's illegal)
- [x] ~~Use Spotify audioplayer for the spotify podcasts~~ (pointless)
- [x] ~~Create spotify recorder~~ (it's illegal)
- [ ] ~~Add faceting for episode and podcast (route for episode og podcast)~~
- [ ] ~~Make the types shared between backend and client~~
- [x] ~~We need 3 tabs that show at the top like the buttons:~~
      - [ ] ~~New episodes~~
      - [ ] ~~Trending episodes~~
      - [ ] ~~Info~~
- [x] ~~Add embedded YouTube to episode-area??? Mulig i det hele tatt, skal den være også tidsbasert?~~
- [x]  ~~Add info component~~ (part of three tabs task) 
- [x]  ~~Add top 3 most searched podcasts~~ (part of tabs)
- [x] ~~Switch to use the puppeteer script as time ensues~~ (meaningless)
- [ ] ~~Implement https://github.com/GoogleChromeLabs/quicklink and Instant.page~~
- [ ] ~~Set up CI/CD pipeline for backend (here: https://medium.com/@fredrik.burmester/nuxt-3-website-with-cloudflare-workers-and-github-actions-336411530aa1)~~
- [x] ~~Try Workes on Cloudflare just in case, with the nitro template~~ (using cloudflare images and pages)
- [ ] ~~Lag desktop moden~~
- [ ] ~~Lag iPhone moden~~
- [ ] ~~Lag Android moden~~
- [ ]  ~~Add audio noise denoising on backend to clean up safari audio recordings as they are very muddy due to Safari being restrictive~~ (Was implemented primarily to address the issues associated with Safari and it's horrible audio-recording issues, but it didn't really solve much. The audio was denoised and clean, but the muffled speech was unavoidable. This was the main reason to create an app).
- [ ] ~~Disable animation button~~ (nah)
- [ ] ~~Skal være mulig å paste en link til youtube/tiktok/ehatever side og få svarer på hvilken episode det kommer fra~~
- [ ] ~~Add word, by, word, highlighting during playback. and ..The animate.css text shall be only one liners so it needs to be split but for this to work we need to get the word-token-times, which isn't yet implemented~~
- [ ] ~~Download all podcats (should be)...~~
- [ ] ~~Move navbar to bottom~~ (bad idea, so no)
- [ ] ~~Brul en annen audio player kanskje som er bedre til å ferche metadata???~~
- [ ] ~~Add the firefox colors as the nuxt progress bar bar color  and find out why loding indicator doesnt work~~ (This is meaningless as the NuxtLoadingIndicator is only present on SPAs not SSR apps.
- [ ] ~~Fix so the home button doesn't wait for the api response but rather has same behaviour as NavLogo~~
- [ ] ~~Legg til navbar i toppen hvor det står hvor mange podcaster episoder er transcriba+ current listerens~~
- [ ] ~~Increase zoom further to 25% or 10%??~~ (not necessary, enough screen hagging)
- [ ] ~~Binary tree subs cache object needs to be available~~ (unnecessary)
- [x] ~~Record knappen skal være der doneringsknappen er nå~~
- [ ] ~~Add dark mode icon to the button~~
- [ ] ~~Logo color?~~
- [ ] ~~Add share buttons to moreLink~~
- [ ] ~~Sett default til å alltid være darkMode~~ (Nah use system)
- [ ] ~~Flytt subsene inn i den modda spilleren~~ (no subs)
- [ ] ~~Grab transcriptionsne til anthony for lex for å spare tid~~ (no, he doesnt have the necessary info
- [ ] ~~Legg til sjekk som blokker flere audioplayere fra å spille samtidig + make the audioPlayer not visible until someone starts playing~~
- [x] ~~Convert play-button too say Play podcast~~
- [ ] ~~Bytt audioPlayer til howler.js til designet som er ønsket~~
- [ ] ~~When someone clicks on the button, it should set the global playing value to true and it should set the link of the audioLink that is being played. If the audioPlayer has that enclosure it should continue playing, if not it shant. The audioPlayer should also show up if the it has a chosen audio-file. If not, it shant be shown.~~
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
- [x] Use lowest db cpu
- [x] Possible idea: nuxt generate all static files => serve on bunnyCDN all as static => create CI/CD pipeline to bunnyCDN, kinda want to avoid cloudflare tbh
- [x] Write me an about page contact page and donate page
- [x] Disable plausible, netlify, vercel and images.poddley.com. Cloudflare literally does all that for free..
- [x] Login/Sign-up functionality.
- [x] Setup up multisearch for the search-service on the backend. Should give some slight performance benefits
- [x] Don't have debouncing on client side, but do have throttling + cancellable promises
- [x] Add helmet and add rate-limiting
- [x] Light refactoring of backend and frontend to support SeachQuery and filter/sort parameteres + refactor ServiceWorker + change all APIs to POST requests.
- [x] Find out why worker is slow on new backend. Json parsing? Filter setting on the meilisearch api?
- [x] Fix the buttons
- [x] Segments have to move
- [x] Add segment search functionality route so it can be shared.
- [x] Search button index redirect
- [x] Time location needs to update if livesubs are enabled.
- [x] Livesubs button is needed
- [x] Drop usage of hq720
- [x] Start delayed hydratipn again
- [x] Fix donation page
- [x] Fix nav buttons
- [x] Fix the layout shitfs on the image downloading time…
- [x] Add esc listener to non-headless ui stuff
- [x] Use vueUse instead of vlickoutside
- [x] Øk margin på search oxen og marginBottom
- [x] Set logo to be nuxtlink not href
- [x] Skal kun blinke hvis man starter play
- [x] Audio to text transformation search
- [x] Add dark mode... toggle button + functionality.
- [x] Fix device issue
- [x] Fix home button not reflecting same behaviour as home button
- [x] Added animate to the text changing section
- [x] Fjern overflødig respons fra API-et
- [x] Fullfør respons
- [x] Improve dark mode colors
- [x] Fiks svart bakgrunn
- [x] Fjern overflødig møkkatekst fra responsen
- [x] Fjern profile of push mikroen dit
- [x] Fix extreme build time due to tailwind
- [x] Fix SSR dark mode not being preloaded => (found a hack, contribute to the repo?)
- [x] Convert entire Nuxt3 app to an iOS/Android app using capacitor https://dev.to/daiquiri_team/how-to-create-android-and-ios-apps-from-the-nuxtjs-application-using-capacitorjs-134h (was possible to implement)
- [x] Fix the favicons to look good, and to support darkmode
- [x] Remove useDevice as we have no use for it on the web-version
- [x] Se over about og contact siden
- [x] Make emails
- [x] Fix darkMode doubleClick bug
- [x] Fix issue with description meta-tag on poddley
- [x] Add "x"-cleanSearchString functionality like google
- [x] Subtitles toast enabled/disabled
- [x] Fix spinner wiggle bug
- [x] Youtube DarkMode button
- [x] Align RemoveButtons
- [x] Remove shade and border on audioPlayer on iPhones
- [x] Move expand more text all the way to the right even when text is short
- [x] MoreLinks buttonen har forsvunnet fiks det
- [x] Fix hover fill on rss icon
- [x] Add icons to burgerMenu
- [x] Hr bug about
- [x] Gray-100 text sb
- [x] Fix darkmode issue on audioplayer
- [x] Fix wrong reload thing on navlogo
- [x] Fix size issue on triple dot menu
- [x] Expand icon padding
- [x] Fix toast-issues
- [x] Returner 3 ascending fra query pick last npt full fjern expand
- [x] Legg til custom tailwindUI toast-engine/service
- [x] Refaktorerer transcriberen
- [x] Fiks desktop searchbar
- [x] Microphone-functionality on phones will redirect to app to stimulate users + better audio-quality which is needed for the transcriptions.
- [x] Halve the amount of text returned and the height of the textField component
- [x] Use the native audio player as far as you can embeeded into each entry if someone clicks on the playing button.
- [x] Style all of them accordingly, for chrome a certain way, for firefox a certain way and for opera another way.
- [x] Are the about page and contact page good looking, different font?
- [ ] Start transcriberen og bruk large
- [ ] Make MeiliSearch production version.
- [ ] Start up all pm2-services.
- [ ] Modify the backend so the first segment is always what was searched for. Don't show anything before the searchSegment. And reduce the size of the response as it's too big.
- [ ] Add the "getEntireTranscript"-button. The button shall...???
- [ ] So essentially, when someone clicks on the button it should fetch the transcript associated with that podcast
- [ ] Android / Apple app button where the microphone is, like a "pod-it" symbol.
- [ ] Make design for android and apple

After finish:
- [ ] Medlemskap: API usage, full transcript downloads, no ads,
- [ ] Legg ut som showHN, reddit, contact podcasters + tiktok
- [ ] Skriv et blogginnlegg om prosjektet, skriv om integrering av CloudWorkers med Nuxt3 på medium,
- [ ] Start en egen IT blogg
- [ ] Markedsfør
- [ ] Finskriv githuben

**Later maybe**:
- [ ] En bruker skal kunne se en historikk over poddehistorikken deres ala iPhone shazam, 
- [ ] Slett konto
- [ ] Se lagrede quotes
- [ ] Upload a picture/profile pic using r3
- [ ] External API to sell.
