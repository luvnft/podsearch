import os

def main():
    # Remove podcasts.db if it exists, remove podcasts.json if it exists, remove any files starting with audio. if they exist 
    if os.path.exists("podcasts.db"):
        os.remove("podcasts.db")
    for file in os.listdir():
        if file.startswith("audio."):
            os.remove(file)
    if os.path.exists("./podcastindex_feeds.db.tgz"):
        os.remove("./podcastindex_feeds.db.tgz")
    if os.path.exists("./podcasts.db"):
        os.remove("./podcasts.db")
if __name__ == '__main__':
    main()