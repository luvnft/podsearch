require("dotenv").config({ path: ".env" });

module.exports = {
  apps: [
    {
      name: "meilisearch",
      script: "/mnt/volume_nyc1_02/meilisearch --no-analytics",
      env: {
        MEILI_HTTP_ADDR: process.env.MEILI_HTTP_ADDR,
        MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
        MEILI_DB_PATH: process.env.MEILI_DB_PATH,
        MEILI_DUMP_DIR: process.env.MEILI_DUMP_DIR,
        MEILI_ENV: process.env.MEILI_ENV,
      },
      wait_ready: true,
      listen_timeout: 5000,
    },
    {
      name: "backend",
      script: "/home/poddley/backend/./dist/app.js",
      wait_ready: true,
      listen_timeout: 10000,
      depends_on: ["meilisearch"],
    },
    {
      name: "client",
      script: "/home/poddley/client/.output/server/index.mjs",
      env: {
        PORT: 3001,
      },
      depends_on: ["backend"],
    },
  ],
};

