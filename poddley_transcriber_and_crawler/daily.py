import subprocess as sp

def main():
    # # Get the top podcasts from the podcasts.db
    # sub1 = sp.Popen(["python3", "./cleanUp.py"])
    # sub1.wait()
    
    # # Get the top podcasts from the podcasts.db
    # sub1 = sp.Popen(["prisma", "generate"])
    # sub1.wait()
    
    # # Get the top podcasts from the podcasts.db
    # sub1 = sp.Popen(["prisma", "migrate", "dev"])
    # sub1.wait()
    
    # # Get the top podcasts from the podcasts.db
    # sub1 = sp.Popen(["python3", "./downloadPodcasts.py"])
    # sub1.wait()
    
    # # Get the top podcasts from the podcasts.db
    # sub1 = sp.Popen(["node", "./getMostPopularPodcasts.js"])
    # sub1.wait()

    # Get the top podcasts from the podcasts.db
    sub1 = sp.Popen(["python3", "./getTopPodcastsUsingTheJson.py"])
    sub1.wait()
    
    # Get the top podcasts from the podcasts.db
    sub1 = sp.Popen(["python3", "./getAndAddEpisodes.py"])
    sub1.wait()
    
    # Get the top podcasts from the podcasts.db
    sub1 = sp.Popen(["python3", "./transcribeAndDump.py"])
    sub1.wait()
    
    # # Get the top podcasts from the podcasts.db
    # sub1 = sp.Popen(["python3", "./cleanUp.py"])
    # sub1.wait()
    
if __name__ == '__main__':
    main()
