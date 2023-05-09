import requests
import feedparser
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import langcodes
import datetime
from prisma import Prisma
from prisma.models import Podcast, Episode
import asyncio
import safe_cast
import pandas as pd

# Global vars
count = 0
prisma = None

# This function retrieves the body response using a GET request from a url
def fetchResponse(session, url):
    # Get the response
    try:
        with session.get(url, timeout=30) as response:
            global count
            count = count +1
            if count % 10 == 0:
                print("Done processing this number of URLs: {} and the current URL is {}".format(
                    count, url))
            return response.text
    except Exception as e:
        pass
        return None

# This function starts a certain number of threads and runs the get_episodes function on each thread
def startThreadsAndReturnResponses(numThreads, urls):
    # Print out the info
    print("Starting threads and returning responses...number of urls process is " + safe_cast.safe_str(len(urls)))

    # Start the threads
    with ThreadPoolExecutor(max_workers=numThreads) as executor:
        # Print the number of threads
        print("Number of threads being used is: {}".format(executor._max_workers))

        # Get the responses as they come in
        responses = []

        # Start the threads
        with requests.Session() as session:
            # Get the responses
            responses = executor.map(
                fetchResponse, [session] * len(urls), urls)

            # Conver the responses to a list
            responses = list(responses)

            # Wait for the threads to finish
            executor.shutdown(wait=True)

            # Return the responses
            return responses

# This function starts a certain number of threads and parses the xmls received previously
def getTheEpisodes(requests, urls, guids):
    # Print out that we are getting the episodes
    print("The urls222: ", urls)
    print("Getting episodes..., number of requests to process is " + safe_cast.safe_str(len(requests)))

    # Episodes
    episodes = []

    # Loop over the requests
    for i, request in enumerate(requests):
        # Get the feed from the podcast url
        feed = ""
        try:
            feed = feedparser.parse(request, sanitize_html=True)
        except:
            pass
            continue

        # If feed is "" then continue
        if feed == "":
            continue

        # Check if bozo is 1, if it is, then there is an error
        if "bozo" in feed and feed["bozo"] == 1:
            continue

        # Check if entries is empty
        if "entries" not in feed or len(feed["entries"]) == 0:
            continue

        # Check if the parser has not been able to parse the feed
        if "status" in feed and feed["status"] != 200:
            continue

        # Check if author and title are truthy if not continue
        if "author" not in feed["feed"] or "title" not in feed["feed"]:
            continue

        # Get some general info from the feed object which in reality is solely related to the podcast itself
        podcastAuthor = feed["feed"]["author"] if "author" in feed["feed"] else ""
        podcastTitle = feed["feed"]["title"] if "title" in feed["feed"] else ""
        podcastSummary = feed["feed"]["summary"] if "summary" in feed["feed"] else ""
        podcastLanguage = feed["feed"]["language"] if "language" in feed["feed"] else ""
        podcastImage = feed["feed"]["image"]["href"] if "image" in feed["feed"] and "href" in feed["feed"]["image"] else None
        podcastRssFeed = urls[i]
        podcastGuid = guids[i]

        # Check if author and title are truthy
        if podcastAuthor == "" and podcastTitle == "":
            continue

        # Loop over the episodes one by one and add them to the episodes list
        for episode in feed.entries:
            episodeEnclosure = []
            if "links" in episode and len(episode["links"]) > 0:
                for link in episode["links"]:
                    if link["rel"] == "enclosure":
                        if "href" in link:
                            episodeEnclosure.append(link["href"])
                        else:
                            continue
            episodeEnclosure = episodeEnclosure[0] if len(
                episodeEnclosure) > 0 else None
            episodeAuthor = episode["author"] if "author" in episode else podcastAuthor
            episodeTitle = episode["title"] if "title" in episode else None
            episodeImage = ""
            if "image" in episode and episode["image"] != None:
                episodeImage = episode["image"]["href"]
            episodeLinkToEpisode = episode["link"] if "link" in episode else None
            episodePublished = datetime.datetime(
                *episode["published_parsed"][:-3]).timestamp() if "published_parsed" in episode else ""
            # The format of duration is usually HH:MM:SS, but can sometimes be in seconds only (e.g. 1234). We need to convert it to seconds, so it's always in the same format
            episodeDuration = episode["itunes_duration"] if "itunes_duration" in episode else None
            if episodeDuration != None:
                if ":" in episodeDuration:
                    splittedDuration = episodeDuration.split(":")
                    if len(splittedDuration) == 3:
                        durationSum = (3600 * int(splittedDuration[0])) + (
                            60 * int(splittedDuration[1])) + int(splittedDuration[2])
                        episodeDuration = durationSum
                    elif len(splittedDuration) == 2:
                        durationSum = (
                            3600 * int(splittedDuration[0])) + (60 * int(splittedDuration[1]))
                        episodeDuration = durationSum
                else:
                    episodeDuration = safe_cast.safe_int(episodeDuration)
            episodeGuid = episode["id"] if "id" in episode else None
            episodeAuthors = []
            if "authors" in episode and len(episode["authors"]) > 0:
                # Remove all the empty objects from the authors list
                episode["authors"] = list(
                    filter(lambda x: x != {}, episode["authors"]))
                for author in episode["authors"]:
                    if "name" in author:
                        episodeAuthors.append(author["name"])
                    else:
                        continue
            if episodeAuthors == []:
                episodeAuthors = [podcastAuthor]
            episodeSummary = episode["summary"] if "summary" in episode else ""
            episodeLanguage = episode["language"] if "language" in episode else podcastLanguage

            # Specific podcast related info passed on from the podcast row
            podcastRssFeed = urls[i]

            # Set all the values of the episode object before appending it to the episodes list
            # If the episodeAuthor, episodeTitle, episodeLinkToEpisode, episodeEnclosure, podcastRssFeed, podcastAuthor, podcastTitle, podcastGuid, episodeGuid are not truthy or == "", then continue
            if episodeAuthor == "" or episodeTitle == "" or episodeLinkToEpisode == "" or episodeEnclosure == "" or podcastRssFeed == "" or podcastAuthor == "" or podcastTitle == "" or podcastGuid == "" or episodeGuid == "":
                continue
            
            if episodeAuthor == "" or episodeAuthor == None: continue
            if episodeTitle == "" or episodeTitle == None: continue
            if episodeLinkToEpisode == "" or episodeLinkToEpisode == None: continue
            if episodeEnclosure == "" or episodeEnclosure == None: continue
            if podcastRssFeed == "" or podcastRssFeed == None: continue
            if podcastAuthor == "" or podcastAuthor == None: continue
            if podcastTitle == "" or podcastTitle == None: continue
            if podcastGuid == "" or podcastGuid == None: continue
            if episodeGuid == "" or episodeGuid == None: continue

            episode = {
                "episodeAuthor": episodeAuthor,
                "episodeTitle": episodeTitle,
                "episodeImage": episodeImage,
                "episodeLinkToEpisode": episodeLinkToEpisode,
                "episodePublished": episodePublished,
                "episodeDuration": episodeDuration,
                "episodeAuthors": ",".join(episodeAuthors),
                "episodeSummary": episodeSummary[:950],
                "episodeEnclosure": episodeEnclosure,
                "episodeLanguage": episodeLanguage,
                "podcastRssFeed": podcastRssFeed,
                "podcastAuthor": podcastAuthor,
                "podcastSummary": podcastSummary[:950],
                "podcastLanguage": podcastLanguage,
                "podcastTitle": podcastTitle,
                "podcastGuid": podcastGuid,
                "podcastImage": podcastImage,
                "episodeGuid": episodeGuid
            }

            # Check if enclosure or title is not truthy
            if episode["episodeEnclosure"] == None or episode["episodeTitle"] == None or episode["episodeGuid"] == None:
                continue
            else:
                episodes.append(episode)

    # Return
    return episodes

# Function that takes a podcast database and gets all the episodes from the feed for every podcast in the db
async def prepareConnectionsEtc():
    # Print out the info
    print("Preparing connections etc...")

    # Connect to the podcastDatabase
    global prisma
    prisma = Prisma()
    await prisma.connect()

    # Get all the podcasts urls and guids first
    urls = []
    guids = []

    # Return the urls and guids
    podcasts = await prisma.podcast.find_many()
    
    print("Length of podcasts is " + safe_cast.safe_str(len(podcasts)))

    # for podcast in podcasts:
    #     podcast = dict(podcast)
        
    #     response = requests.get(podcast["url"], timeout=10)
    #     if response.status_code != 200:
    #         print("Not a rss feed or other error 1")
    #         continue

    #     content_type = response.headers.get('Content-Type', '').lower()
    #     if 'xml' not in content_type and 'rss' not in content_type and 'rdf' not in content_type:
    #         pass
        
    #     response = requests.get(podcast["url"], timeout=10)
        
    for podcast in podcasts:
        podcast = dict(podcast)
        urls.append(podcast["originalUrl"])
        guids.append(podcast["podcastGuid"])
        print("Podcast: ", podcast["title"], "and ==> ", podcast["originalUrl"])
    print("In total there are {} urls and {} guids".format(len(urls), len(guids)))

    return {
        "urls": urls,
        "guids": guids,
    }

# Add episodes to the database
async def addEpisodesToDatabase(episodes):
    # Print out the info
    print("Adding episodes to database...Number of episodes to add is " + safe_cast.safe_str(len(episodes)) + "\n")

    # Add all the episodes to the database episodes table
    requests = []

    for episode in episodes:
        try:
            macroLanguageEpisode = langcodes.standardize_tag(
                episode["episodeLanguage"], macro=True)
            macroLanguageEpisode = macroLanguageEpisode.split("-")[0]
            macroLanguagePodcast = langcodes.standardize_tag(
                episode["podcastLanguage"], macro=True)
            macroLanguagePodcast = macroLanguagePodcast.split("-")[0]
                    
            obj = {
                    "episodeAuthor": safe_cast.safe_str(episode["episodeAuthor"]),
                    "episodeTitle": safe_cast.safe_str(episode["episodeTitle"]),
                    "episodeImage": safe_cast.safe_str(episode["episodeImage"]),
                    "episodeLinkToEpisode": safe_cast.safe_str(episode["episodeLinkToEpisode"]),
                    "episodeAuthors": safe_cast.safe_str(episode["episodeAuthors"]),
                    "episodeSummary": safe_cast.safe_str(episode["episodeSummary"]),
                    "episodeEnclosure": safe_cast.safe_str(episode["episodeEnclosure"]),
                    "episodeLanguage": macroLanguageEpisode,
                    "podcastRssFeed": safe_cast.safe_str(episode["podcastRssFeed"]),
                    "podcastAuthor": safe_cast.safe_str(episode["podcastAuthor"]),
                    "podcastSummary": safe_cast.safe_str(episode["podcastSummary"]), 
                    "podcastLanguage": macroLanguagePodcast if macroLanguagePodcast != None else "", 
                    "podcastTitle": safe_cast.safe_str(episode["podcastTitle"]),
                    "podcastGuid": safe_cast.safe_str(episode["podcastGuid"]),
                    "podcastImage": safe_cast.safe_str(episode["podcastImage"]),
                    "episodeGuid": safe_cast.safe_str(episode["episodeGuid"]),
                    "episodePublished": safe_cast.safe_int(episode["episodePublished"], default=0),
                    "episodeDuration": safe_cast.safe_int(episode["episodeDuration"], default=0),
                }
            
            obj["episodePublished"] = pd.to_datetime(obj["episodePublished"], utc=True, unit='s')
            requests.append(obj)
            
        except Exception as e:
            continue

    try:
        await prisma.episode.create_many(data=requests, skip_duplicates=True)
    except Exception as e:
        print(e)
        print("Error: " + safe_cast.safe_str(e))
    
    # await prisma.episode.create_many(data=requests, skip_duplicates=True)
    print("Done inserting len episodes is " + safe_cast.safe_str(len(requests)) + "\n")
    
    # Print out the info
    print("Done adding this batch of episodes to database...")

# EpisodeGrabber
async def runEpisodeGrabber():
    # Start time of the program
    startTime = time.time()

    # Get the urls and guids
    obj = await prepareConnectionsEtc()

    # Loop over the urls and guids in increments of 20
    for i in range(0, len(obj["urls"]), 20):
        # Get the urls
        urls = obj["urls"][i:i+20]
        guids = obj["guids"][i:i+20]

        print("Urls is " + safe_cast.safe_str(len(urls)))

        # Get the requests
        responses = startThreadsAndReturnResponses(2000, urls)

        # Get the episodes and add them to the database
        episodes = getTheEpisodes(responses, urls, guids)

        print("Now going to add the episodes to the database, number of episodes is " + safe_cast.safe_str(len(episodes)) + "\n")
        
        # Add the episodes to the database
        await addEpisodesToDatabase(episodes)

        # Print out that this is a new iteration
        print("New iteration")

    # End time of the program
    endTime = time.time()

    # Print out the time it took to run the program
    print("Time it took to run the program: " +
          safe_cast.safe_str(endTime - startTime) + " seconds")
    global prisma
    
# Run the program
if __name__ == "__main__":
    asyncio.run(runEpisodeGrabber())
