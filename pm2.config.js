require("dotenv").config({ path: ".env" });

module.exports = {
  apps: [
    {
      name: "meilisearch",
      script: "/mnt/volume_nyc1_02/meilisearch",
      args: "--no-analytics",
      watch: false,
    },
    {
      name: "backend",
      script: "npm run production:runBackend",
      restart_delay: 3000,
      env: {
        PORT: 3000,
      }, 
      watch: false,
    },
    {
      name: "client",
      script: "npm run production:runClient",
      restart_delay: 3000,
      env: {
        PORT: 3001,
      },
      watch: false,
    },
  ],
};
