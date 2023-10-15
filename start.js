// Run this with pm2 start ...x... to start the app and the backend. Given that all is installed and stuff. And the env stuff is gtg.
module.exports = {
  apps: [
    {
      name: "meilisearch",
      script: "/mnt/volume_nyc1_02/meilisearch --no-analytics",
      watch: false,
      env: {
        NODE_ENV: "production",
        MEILI_HTTP_ADDR: "0.0.0.0:7700",
        MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
        MEILI_DB_PATH: "/mnt/volume_nyc1_02/data.ms/",
      },
    },
    {
      name: "backend",
      script: "/home/poddley/backend/dist/app.js",
      watch: true,
      cwd: "/home/poddley/backend/",
      env: {
        NODE_ENV: "production",
        MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
      },
    },
    {
      name: "client",
      script: "./.output/server/index.mjs",
      cwd: "/home/poddley/poddley_client/",
      env: {
        PORT: 3001,
      },
    },
  ],
};
