const { Cluster } = require("puppeteer-cluster");
const fs = require("fs");
//You need to install this on the ubuntu servers due to lacking of libs:
//sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libgbm-dev

const email = "luka_momcilovic@hotmail.com"; //Your email
const password = "InspiredElement24120019"; //Your password
const podcasts = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const login = async (cluster) => {
  //Go to the URL and login
  await cluster.execute(async ({ page }) => {
    await page.goto("https://chartable.com/sign_in", {
      waitUntil: "networkidle0",
    });
    await page.type("#Email", email);
    await page.type("#Password", password);
    await page.click("[type=submit]", { waitUntil: "networkidle0" });

    //Sleep for 1 second
    await sleep(2000);
  });
  return true;
};

const launchCluster = async () => {
  // Launch the cluster
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10,
    retryDelay: 3000,
    retryLimit: 3,
    skipDuplicateUrls: true,
    timeout: 30000,
    workerCreationDelay: 100,
    puppeteerOptions: {
      headless: true,
      args: [`--window-size=${500},${500}`, "--no-sandbox"],
    },
    monitor: true,
    maxCPU: 50,
    maxMemory: 50,
    sameDomainDelay: 1000,
  });

  return cluster;
};

const getPodcasts = async (page, url) => {
  //Go to the URL to get the podcasts
  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  //Get all the podcasts for the country for that date (which is embedded in the url so we don't need to pass it)
  const countryPodcasts = await page.evaluate(() => {
    //Get the podcasts for the country
    const podcasts = document.querySelectorAll(".striped--near-white");
    const podcastsArray = Array.from(podcasts);
    let podcastsData = podcastsArray.map((podcast) => {
      var position = "";
      var author = "";
      var title = "";
      try {
        position = podcast.querySelector(".b.header-font.f2.tc").innerText.trim();
      } catch (e) {
        console.log(e);
      }
      try {
        author = podcast.querySelector(".db").innerText.trim();
      } catch (e) {
        console.log(e);
      }
      try {
        title = podcast.querySelector(".title.f3").innerText.trim();
      } catch (e) {
        console.log(e);
      }
      try {
        title = podcast.querySelector(".title.f4").innerText.trim();
      } catch (e) {
        console.log(e);
      }

      return {
        position,
        author,
        title,
      };
    });

    //Remove all podcasts that have a position larger than 50
    podcastsData = podcastsData.filter((podcast) => {
      if (podcast.position > 5) {
        return false;
      }
      return true;
    });

    //Return bitch
    if (podcastsData.length === 0) return [];
    return podcastsData || [];
  });
  //If the countryPodcasts is empty then there are no more dates available to load
  if (countryPodcasts.length === 0) return [];

  //Return the podcasts
  return countryPodcasts;
};

(async () => {
  console.log("Started cluster script from within the cluster.js file");
  var startTime = new Date();
  const cluster = await launchCluster();
  const loggedIn = await login(cluster);

  const links = [
    "https://chartable.com/charts/itunes/us-business-podcasts",
    "https://chartable.com/charts/itunes/us-all-podcasts-podcasts",
    "https://chartable.com/charts/itunes/us-comedy-podcasts",
    "https://chartable.com/charts/itunes/us-health-fitness-podcasts",
    "https://chartable.com/charts/itunes/us-news-podcasts",
    "https://chartable.com/charts/itunes/us-science-podcasts",
    "https://chartable.com/charts/itunes/us-society-culture-podcasts",
    "https://chartable.com/charts/itunes/us-technology-podcasts",
    "https://chartable.com/charts/itunes/ca-all-podcasts-podcasts",
    "https://chartable.com/charts/itunes/ca-business-podcasts",
    "https://chartable.com/charts/itunes/ca-comedy-podcasts",
    "https://chartable.com/charts/itunes/ca-health-fitness-podcasts",
    "https://chartable.com/charts/itunes/ca-news-podcasts",
    "https://chartable.com/charts/itunes/ca-science-podcasts",
    "https://chartable.com/charts/itunes/ca-society-culture-podcasts",
    "https://chartable.com/charts/itunes/ca-technology-podcasts",
    "https://chartable.com/charts/itunes/gb-all-podcasts-podcasts",
    "https://chartable.com/charts/itunes/gb-business-podcasts",
    "https://chartable.com/charts/itunes/gb-comedy-podcasts",
    "https://chartable.com/charts/itunes/gb-health-fitness-podcasts",
    "https://chartable.com/charts/itunes/gb-news-podcasts",
    "https://chartable.com/charts/itunes/gb-science-podcasts",
    "https://chartable.com/charts/itunes/gb-society-culture-podcasts",
    "https://chartable.com/charts/itunes/gb-technology-podcasts",
    "https://chartable.com/charts/itunes/au-technology-podcasts",
    "https://chartable.com/charts/itunes/au-society-culture-podcasts",
    "https://chartable.com/charts/itunes/au-science-podcasts",
    "https://chartable.com/charts/itunes/au-news-podcasts",
    "https://chartable.com/charts/itunes/au-health-fitness-podcasts",
    "https://chartable.com/charts/itunes/au-comedy-podcasts",
    "https://chartable.com/charts/itunes/au-business-podcasts",
    "https://chartable.com/charts/itunes/au-all-podcasts-podcasts",
    "https://chartable.com/charts/itunes/ca-education-podcasts",
    "https://chartable.com/charts/itunes/us-education-podcasts",
    "https://chartable.com/charts/itunes/gb-education-podcasts",
    "https://chartable.com/charts/itunes/au-education-podcasts",
    "https://chartable.com/charts/spotify/australia-business-technology",
    "https://chartable.com/charts/spotify/australia-comedy",
    "https://chartable.com/charts/spotify/australia-educational",
    "https://chartable.com/charts/spotify/australia-lifestyle-health",
    "https://chartable.com/charts/spotify/australia-news-politics",
    "https://chartable.com/charts/spotify/australia-science",
    "https://chartable.com/charts/spotify/australia-society-culture",
    "https://chartable.com/charts/spotify/australia-technology",
    "https://chartable.com/charts/spotify/australia-top-podcasts",
    "https://chartable.com/charts/spotify/united-states-of-america-business-technology",
    "https://chartable.com/charts/spotify/united-states-of-america-comedy",
    "https://chartable.com/charts/spotify/united-states-of-america-educational",
    "https://chartable.com/charts/spotify/united-states-of-america-lifestyle-health",
    "https://chartable.com/charts/spotify/united-states-of-america-news-politics",
    "https://chartable.com/charts/spotify/united-states-of-america-science",
    "https://chartable.com/charts/spotify/united-states-of-america-society-culture",
    "https://chartable.com/charts/spotify/united-states-of-america-technology",
    "https://chartable.com/charts/spotify/united-states-of-america-top-podcasts",
    "https://chartable.com/charts/spotify/canada-top-podcasts",
    "https://chartable.com/charts/spotify/great-britain-business-technology",
    "https://chartable.com/charts/spotify/great-britain-comedy",
    "https://chartable.com/charts/spotify/great-britain-educational",
    "https://chartable.com/charts/spotify/great-britain-lifestyle-health",
    "https://chartable.com/charts/spotify/great-britain-news-politics",
    "https://chartable.com/charts/spotify/great-britain-science",
    "https://chartable.com/charts/spotify/great-britain-society-culture",
    "https://chartable.com/charts/spotify/great-britain-technology",
    "https://chartable.com/charts/spotify/great-britain-top-podcasts",
  ];

  //Create the cluster task queue
  cluster.task(async ({ page, data: url }) => {
    const countryPodcasts = await getPodcasts(page, url);

    // Remove all the null values from the array
    countryPodcasts
      .filter((podcast) => podcast !== null)
      .forEach((podcast) => {
        podcasts[podcast.title] = podcast.author;
      });
  });

  //Add the urls to the queue
  console.log("Adding urls to the queue and waiting for them to finish");
  for (let i = 0; i < links.length; i++) {
    let link = links[i];
    await cluster.queue(link);
  }

  //Wait for the cluster to finish
  await cluster.idle();
  await cluster.close();

  //Write the podcasts to a file
  fs.writeFile("./  ", JSON.stringify(podcasts), function (err) {
    console.log("Writing podcasts to file");
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved with the number of podcasts: " + Object.keys(podcasts).length);
  });

  // EndTime stuff
  var endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  console.log("Time taken in seconds: " + timeDiff / 1000);
})();
