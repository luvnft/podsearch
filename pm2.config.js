require("dotenv").config({ path: ".env" });

module.exports = {
  apps: [
    // Starts the meilisearch instance on the machine
    {
      name: "meilisearch",
      script: "/mnt/volume_nyc1_02/meilisearch",
      args: "--no-analytics",
      env: {
        MEILI_HTTP_ADDR: process.env.MEILI_HTTP_ADDR,
        MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
        MEILI_DB_PATH: process.env.MEILI_DB_PATH,
        MEILI_DUMP_DIR: process.env.MEILI_DUMP_DIR,
        MEILI_ENV: process.env.MEILI_ENV,
      },
    },
    {
      name: "backend",
      script: "/home/poddley/backend/app.ts",
      interpreter: "/root/.nvm/versions/node/v20.3.1/bin/ts-node",
      watch: true,
    },
    {
      name: "client",
      script: "/home/poddley/client/.output/server/index.mjs",
      watch: ["/home/poddley/client/"],
      env: {
        PORT: 3001,
      },
    },
  ],
};

