import requests
import tarfile
import os
from clint.textui import progress

# Main function upon initial setup
def main():
    # Download the podcastindex_feeds.db.tgz file
    podcastsURL = "https://public.podcastindex.org/podcastindex_feeds.db.tgz"
    print("Downloading", podcastsURL)
    
    # Get the db as a stream to save RAM and save it to a file called podcastindex_feeds.db.tgz
    with requests.get(podcastsURL, stream=True) as r:
        with open("./podcastindex_feeds.db.tgz", "wb") as f:
            total_length = int(r.headers.get("content-length"))
            for chunk in progress.bar(r.iter_content(chunk_size=1024), expected_size=(total_length / 1024) + 1):
                if chunk:
                    f.write(chunk)
                    f.flush()

    # Exctracting the podcastindex_feeds.db.tgz file
    print("Downloaded", podcastsURL)
    print("Extracting .tgz")

    # Extracting
    tar = tarfile.open("./podcastindex_feeds.db.tgz")
    tar.extractall()
    name = tar.getnames()[0]
    tar.close()
    os.rename(name, "./podcasts.db")
    print("Extracted podcastindex_feeds.db.tgz")

if __name__ == "__main__":
    main()