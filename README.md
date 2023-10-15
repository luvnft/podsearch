# Poddley - "*Shazam*" for podcasts

## Main Goal:
The main goal of the website/service is to be the "*Shazam*" for podcasts. Therefore it's main purpose is to be a search engine for all podcast transcriptions and provide a mapping between podcast-resources like youtube, apple podcasts, transcriptions, time-location of quotes, rss-feeds, podcast homepages and episode-links. Additionally, it aims to be a discovery platform, helping people explore and find a wide range of podcast content based on spoken word.

## Status build
[![Frontend CI/CD Pipeline](https://github.com/lukamomc/poddley/actions/workflows/client.yml/badge.svg)](https://github.com/lukamomc/poddley/actions/workflows/client.yml)
[![Backend CI/CD Pipeline](https://github.com/lukamomc/poddley/actions/workflows/backend.yml/badge.svg)](https://github.com/lukamomc/poddley/actions/workflows/backend.yml)

## Project 
[Link to Poddley](https://poddley.com)

## Design iterations
<img src="https://github.com/lukamomc/poddley/assets/52632596/021db789-806d-4822-8621-3df6d737a34d" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/870d5091-f3ce-4d88-8edf-320829f388f3" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/30c84688-69de-4b5a-aa10-b6886d889ebd" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/aab77d06-3100-487f-a3c6-04e977b5f134" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/c4a29bef-0867-43b8-82fb-0fa6cfc9dd31" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/68b94afc-4284-43c3-92ff-6e726e1eed23" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/140c6555-0c35-4517-bd56-a34ff534c3b1" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/c5dad911-8149-4701-8814-3e3b3c7ad972" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/bcc4c1ac-bd0b-4725-b6b2-97947b55d406" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/b7dfb103-2ff8-4cc6-8563-ef26a000b82c" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/32fdc4e9-0fb6-4e09-845c-11d0eb674a5f" width="23%"></img>
<img src="https://github.com/lukamomc/poddley/assets/52632596/bcc4c1ac-bd0b-4725-b6b2-97947b55d406" width="23%"></img>

## Realizations
- Hydration mismatch when using cloudflare as proxy is due to cloudflares automatic html, css and js minifcation plus dns proxy. Disabling it causes hydration blinking to disappear. Als
- Don't optimize too early
- Too much caching is bad
- Debouncing API should be (human reaction time in ms - API latency).
- No amount of time optimizing backend will save you from long TTFB (Time To First Byte). After spending a week optimizing backend, testing out Vercel and Netlify (Pro and Free tier) trying to get speed-index below 2 seconds.
  Finally decided to try Cloudflare, went straight to 1.2 seconds.
- Unused CSS and third-party script/services can be tricky to deal with.
- Lazy-loading is nice.
- Assets compression:
  - Decided to use Brotli Compression to improve transfer time.
    *Since Brotli was designed to compress streams on the fly, it is faster at both compressing content on the server and decompressing it in the browser than in gzip. In some cases the overall front-end decompression is up to 64% faster than gzip.* [Source](https://eu.siteground.com/blog/brotli-vs-gzip-compression/#:~:text=Since%20Brotli%20was%20designed%20to,to%2064%25%20faster%20than%20gzip.)
  - Only using webp on website due to faster loading speed and better compression during transfer [Source](https://developers.google.com/speed/webp/docs/webp_study#:~:text=From%20the%20tables%20above%2C%20we%20can%20observe%20that%20WebP%20gives%20additional%2025%25%2D34%25%20compression%20gains%20compared%20to%20JPEG%20at%20equal%20or%20slightly%20better%20SSIM%20index.)
## Frontend:
- Nuxt 3 for client-stuff:
	- SSR enabled
	- Server-structure (as website can't be generated statically due to dynamic route-params)
	- Nitro-server with gzip- and brotli-compression and minified assets
- [JSON to TypeScript type for types generation based on API response](https://transform.tools/json-to-typescript)
- TypeScript.
- Cloudflare as the DNS-manager for easier setup and automatic image resizing.
- Tracking: ~~[Plausible](https://plausible.io/)~~ Switched to Cloudflare as it was free
- ServiceWorker for offloading the main-thread from the frequest API-calls to the backend-API. There are multiple ways to solve this. Throttling + Debouncing on user-input (during instantSearch) is a possibility, but it often causes laggy ui and mucky logic. Offloading it all to a ServiceWorker showed much better results in spite of it being tricky to implement.
- Nuxt 3 modules used:
	- TailwindCSS module (integrated PurgeCSS and fast design development)
	- NuxtImage module
	- HeadlessUI module
	- SVG-sprite-module (for reducing SVG-requests to server)
	- Nuxt Delayed Hydration module (for improved Lighthouse score and loading time)
	- Lodash module (for _Debounce-function)
	- Device module (for iPhone-device detection)
	- Pinia Nuxt Module (for global storage across components)
  	- Nightwind Tailwind plugin (for deep automaticaally generated tailwind classes for nightmode)
	- Nuxt Image Cloudflare (passes correct image width and height to cloudflare image url causes cloudflare to automatically resize and compress image to be the smallest payload)'
 	- Floating UI + Nuxt3 Headless UI to have automatic flipping of UI when outside of viewport
  	- Nuxt3 Google Fonts module for async fetching of google fonts (probably GDPR breach, but...) 
## Backend:
### Services:
The services are running primarily as pm2-processes. With daemon-autorestart on server-shutdown, which are:
- Express-API: API that queries the meilisearch instance.
- Route-Controller-Service architecture for ExpressJS/Node-backends. [Architecture](https://devtut.github.io/nodejs/route-controller-service-structure-for-expressjs.html#model-routes-controllers-services-code-structure)
- Indexer (runs every 30min): Updates meilisearch indexes based on db-data
- RSS-updater (runs very 30min): Updates db (upsert) based on changes in rss-feeds
- Transcriber/YoutubeGetter (runs continuously) (can be run concurrently due to db-row locking)
- Meilisearch-instance (native rust): Does the full-text search functionality

# Architecture:
Server 1: Very low-end DigitalOcean droplet with 2vCPUs and 4Gigs of RAM run the database consistently. I need the db to be constantly available due to the transcriber and indexer fetching to and from it.
Server 2: Higher end 8vCPUs and 16Gigs of RAM running the Express API, Meilisearch search engine, the indexer and the RSS-updater
Local PC: Runs the Transcriber on an ASUS GeForce RTX 3060 DUAL OC as it's much cheaper than to rent any kind of Server

**Overall Architecture**

| Location       | Specifications                                                 | Responsibilities                                                                                                                    |
|----------------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------               |
| Server 1       | Very low-end DigitalOcean droplet with 2vCPUs and 4Gigs of RAM | Runs the database consistently (needed for transcriber and indexer as I can't have it shut down sporadically for whatever reason)   |
| Server 2       | Higher end 8vCPUs and 16Gigs of RAM                            | Running the Express API, Nuxt3-client code (planning to at least) Meilisearch search engine, the indexer, and the RSS-updater       |
| Local PC       | ASUS GeForce RTX 3060 DUAL OC                                  | Runs the Transcriber                                                                                                                |

| ![Pm2Setup](https://github.com/lukamomc/poddley/assets/52632596/c9f8b6d6-8b20-4896-b044-8eaeea011b0b) | ![Pm2Diagram](https://github.com/lukamomc/poddley/assets/52632596/fb23fee1-7489-4e42-bb1a-5e43fc84d11a)
|:---:|:---|

##### Meilisearch pm2 config 
A meilisearch instance running with the following settings (all indexes use the default settings), besides what's specified in the backend scripts.

<details>
  <summary>Meilisearch pm2 config </summary>

```
	module.exports = {
	  apps: [
	    {
	      name: "meilisearch",
	      script: `./meilisearch --no-analytics`,
	      env: {
	        MEILI_HTTP_ADDR: "0.0.0.0:7700",
	        MEILI_MASTER_KEY: "some key here",
	      },
	    },
	  ],
	};
```
</details>

##### Indexes

<details>
  <summary>All Meilisearch Indexes</summary>

```
	{
	    "results": [
	        {
	            "uid": "episodes",
	            "createdAt": "2023-07-16T09:34:08.17973422Z",
	            "updatedAt": "2023-09-23T11:11:03.374123595Z",
	            "primaryKey": "id"
	        },
	        {
	            "uid": "podcasts",
	            "createdAt": "2023-07-16T09:34:08.151876845Z",
	            "updatedAt": "2023-09-23T11:39:47.029653816Z",
	            "primaryKey": "id"
	        },
	        {
	            "uid": "segments",
	            "createdAt": "2023-07-16T09:34:08.099810144Z",
	            "updatedAt": "2023-10-01T15:16:28.788349424Z",
	            "primaryKey": "id"
	        },
	        {
	            "uid": "transcriptions",
	            "createdAt": "2023-07-16T09:34:08.05460293Z",
	            "updatedAt": "2023-09-23T11:08:48.119600807Z",
	            "primaryKey": "id"
	        }
	    ],
	    "offset": 0,
	    "limit": 20,
	    "total": 4
	}

```
</details>

##### Podcasts:
<details>
  <summary>Podcasts Index Settings</summary>
	
```
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
    "sortableAttributes": [],
    "rankingRules": [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness"
    ],
    "stopWords": [],
    "synonyms": {},
    "distinctAttribute": null,
    "typoTolerance": {
        "enabled": true,
        "minWordSizeForTypos": {
            "oneTypo": 5,
            "twoTypos": 9
        },
        "disableOnWords": [],
        "disableOnAttributes": []
    },
    "faceting": {
        "maxValuesPerFacet": 100,
        "sortFacetValuesBy": {
            "*": "alpha"
        }
    },
    "pagination": {
        "maxTotalHits": 1000
    }
}
```

</details>

##### Episodes:
<details>
  <summary>Episodes Index Settings</summary>
	
```
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
    "stopWords": [],
    "synonyms": {},
    "distinctAttribute": null,
    "typoTolerance": {
        "enabled": true,
        "minWordSizeForTypos": {
            "oneTypo": 5,
            "twoTypos": 9
        },
        "disableOnWords": [],
        "disableOnAttributes": []
    },
    "faceting": {
        "maxValuesPerFacet": 100,
        "sortFacetValuesBy": {
            "*": "alpha"
        }
    },
    "pagination": {
        "maxTotalHits": 1000
    }
}
```

</details>

##### Transcriptions:
<details>
  <summary>Transcriptions Index Settings</summary>
	
```
	{
    "displayedAttributes": [
        "*"
    ],
    "searchableAttributes": [
        "transcription"
    ],
    "filterableAttributes": [],
    "sortableAttributes": [],
    "rankingRules": [
        "exactness",
        "proximity",
        "typo",
        "words"
    ],
    "stopWords": [],
    "synonyms": {},
    "distinctAttribute": null,
    "typoTolerance": {
        "enabled": true,
        "minWordSizeForTypos": {
            "oneTypo": 5,
            "twoTypos": 9
        },
        "disableOnWords": [],
        "disableOnAttributes": []
    },
    "faceting": {
        "maxValuesPerFacet": 100,
        "sortFacetValuesBy": {
            "*": "alpha"
        }
    },
    "pagination": {
        "maxTotalHits": 1000
    }
}
```

</details>

##### Segments:
<details>
  <summary>Segments Index Settings</summary>
	
```
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
    "stopWords": [],
    "synonyms": {},
    "distinctAttribute": null,
    "typoTolerance": {
        "enabled": true,
        "minWordSizeForTypos": {
            "oneTypo": 5,
            "twoTypos": 9
        },
        "disableOnWords": [],
        "disableOnAttributes": []
    },
    "faceting": {
        "maxValuesPerFacet": 200,
        "sortFacetValuesBy": {
            "*": "alpha"
        }
    },
    "pagination": {
        "maxTotalHits": 5000
    }
}
```

</details>

### Transcriber/Re-alignment-service
- The transcriber is a python script that grabs a selection of podcast names from a json.
- Queries a SQLite database downloaded daily from PodcastIndex.com
- Uses feedparser to get episode-names, audiofiles, titles etc. from the rss-feeds for further parsing
- Uses WhispherX to transcribe and align the segments. This implementation is better than the original Whisper due to it using faster-whisper under the hood which supports batching among other performance-improvements.
- Then uses WhisperX to re-align the timestamps in accordance with the audio file (using the large [wav2vec](https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-english) model.
- Then finds the youtube video that fits to that audio file and updates the episode in the database.

# Nginx settings:
| ![NginxSetup](https://github.com/lukamomc/poddley/assets/52632596/ed1ca962-4d28-474c-9d44-b746491851f3) | ![NginxDiagram](https://github.com/lukamomc/poddley/assets/52632596/40259a4c-2f1a-4ee1-8e43-1bd89a0c3875)
|:---:|:---|

<details>
  <summary>Nginx Settings</summary>
	
```
	# For meilisearch.poddley.com
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
	
	# For all other routes (default server)
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
</details>



### Other
- HTTPS everywhere done with let's encrypt. Free https certificates

### AI services
- All AI services run 24/7 on a ASUS GeForce RTX 3060 Dual OC V2
- I used to run and do tests on runpod.io due to their cheap prices, but realized quickly that long term use would quickly become expensive. Paperspace was even more expensive. Deepgram was ridiculous expensive.
- The AI models were initially running on my local computer running an RTX 1650, but it was crashing frequently and had insufficient GPU memory (would terminate sporadically). I also tried running an RTX3060 using ADT-Link connected to my Legion 5 AMD Lenovo gaming laption through the M.2 NVME as an eGPU. That was deeply unsuccessful due to frequent crashes. All solutions were unsatisfactory so splurged for a workstation in the end.

## Stuff to do:
<details>
  <summary>TODO</summary>

- [x] ~~Convert play-button too say Play podcast~~
- [x] ~~Convert the insertionToDb on the TranscriptionService to javascript to take use of the $transaction functionality only available in the javascript client unlike ethe python-prisma-client port and enable multiple gpus to process transcriptions at the same time.~~
- [x] ~~Joe Rogan Recorder~~(illegal)
- [x] ~~Download all Podcast audio-files to own server to support long-term support~~ (probably illegal)
- [x] ~~Use Spotify audioplayer for the spotify podcasts~~ (pointless)
- [x] ~~Create spotify recorder~~ (it's illegal)
- [x] ~~Use Spotify audioplayer for the spotify podcasts~~ (pointless)
- [x] ~~Create spotify recorder~~ (it's illegal)
- [x] ~~Try Workes on Cloudflare just in case, with the nitro template~~ (using cloudflare images and pages)
- [x] ~~We need 3 tabs that show at the top like the buttons:~~
      - [ ] ~~New episodes~~
      - [ ] ~~Trending episodes~~
      - [ ] ~~Info~~
- [x] ~~Add embedded YouTube to episode-area??? Mulig i det hele tatt, skal den være også tidsbasert?~~
- [x]  ~~Add info component~~ (part of three tabs task) 
- [x]  ~~Add top 3 most searched podcasts~~ (part of tabs)
- [x] ~~Switch to use the puppeteer script as time ensues~~ (meaningless)
- [x] ~~Record knappen skal være der doneringsknappen er nå~~
- [ ] ~~Implement https://github.com/GoogleChromeLabs/quicklink and Instant.page~~
- [ ] ~~Set up CI/CD pipeline for backend (here: https://medium.com/@fredrik.burmester/nuxt-3-website-with-cloudflare-workers-and-github-actions-336411530aa1)~~
- [ ] ~~Lag desktop moden~~
- [ ] ~~Lag iPhone moden~~
- [ ] ~~Lag Android moden~~
- [ ] ~~Add faceting for episode and podcast (route for episode og podcast)~~
- [ ] ~~Make the types shared between backend and client~~
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
- [ ] ~~Add dark mode icon to the button~~
- [ ] ~~Logo color?~~
- [ ] ~~Add share buttons to moreLink~~
- [ ] ~~Sett default til å alltid være darkMode~~ (Nah use system)
- [ ] ~~Flytt subsene inn i den modda spilleren~~ (no subs)
- [ ] ~~Grab transcriptionsne til anthony for lex for å spare tid~~ (no, he doesnt have the necessary info
- [ ] ~~Legg til sjekk som blokker flere audioplayere fra å spille samtidig + make the audioPlayer not visible until someone starts playing~~
- [ ] ~~Bytt audioPlayer til howler.js til designet som er ønsket~~
- [ ] ~~When someone clicks on the button, it should set the global playing value to true and it should set the link of the audioLink that is being played. If the audioPlayer has that enclosure it should continue playing, if not it shant. The audioPlayer should also show up if the it has a chosen audio-file. If not, it shant be shown.~~
- [ ] ~~Dockerize entire product on 1 server container (cloudflare workers, it's cheaper than digitalocean, CICD also. This means (client + api/backend + indexer). The transcriber is on my own setup.~~ Not possible due to Cloudflare not supporting custom dbs or express backend
- [ ] ~~Covert search to multiseach to speed up search time~~
- [ ] ~~Enable teksting on all iframes~~ (Youtube api doesn't support/allow this.
- [ ] ~~Create ElasticSearch full text search engine, switch to it from MeiliSearch~~
- [ ] ~~When you click on a section of the text it should start playing.~~
- [ ] ~~Make dropdown lighter in color on darkMode~~
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
- [x] Start up all pm2-services.
- [x] Fix height of text-area
- [x] More padding on the navbar on the mobile phones.
- [x] Add the "getEntireTranscript"-button.	
- [x] Finskriv githuben
- [x] Fix the sceollIntoView bug
- [x] Backend refactor for speed improvemnet
- [x] Fix padding top on contact and about page
- [x] Remove all the gunk from the segments and keep the episode and podcast stuff only on the Hit-object but not on the subhits and dont have any values besides the necessary on the subhits. that should reduce the payload substatially.
- [x] Adapt the api response to be only 5 elements on phone reponse as phones have shit spec
- [x] Fix the search functionality to use jaccard again
- [x] Fix sepia color on audioplayer
- [x] Make MeiliSearch production version.
- [x] Some podcast-streams might have ads when being played and when being transcribed. Solution to this is...??? Save podcast. Legal???...??? Not save  podcast...??? Legal, but lame due to the ads and it fucking with the timestamp so solution is... mini-model on web audio ad killer??? .. How are we going to handle the issue with ads being part of some ppodcast transcription like Logan Paul?? AI to remove them from audio??? Solution is: Download podcast, remove ad from using AI, save audio, stream audio from own R3-bucket. PiHole?? Adsfree VPN? Current AI ad removers for audio suck. Find equivalent on apple podcast and use that instead of audio stream?? ANSWER: Until we develop Audio AI Ads removing model we will just remove them...
- [x] Can we move backend and client closer together? **No.**
- [x] ~~Use <Lazy everywhere~~ Using  UseElementVisibily by vueUse + currentPlayingTime as markers for dom mouting
- [x] Upload sanitized repo stripped of all private-api-keys etc...
- [x] Start up all the pm2 instances in accorance to the written architecture (further up)
- [x] Doublecheck no API's have been leaked (gitguardian will probably be used)
- [x] Upon full load intersectionObserver goes berserker, gotta tweak that a bit I think...
- [x] Also remove "acast"-source podcast from podcasts.json
- [x] Integrate CI/CD somehow when everything is on DigitalOcean for client
- [ ] Integrate CI/CD somehow when everything is on DigitalOcean for backend
- [x] Move Nuxt3 to DigitalOcean from Cloudflare
- [ ] Start up Transcriber on MainPC
- [ ] Refactor the transcriber to support concurrency.
- [ ] Inserter needs to be part of transcriber
- [ ] Make youtube video work with subs and sync too

</details>
