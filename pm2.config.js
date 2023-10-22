require("dotenv").config({ path: ".env" });

module.exports = {
  apps: [
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
      watch: false,
    },
    // {
    //   name: "backend",
    //   script: "npm run production:runBackend",
    //   restart_delay: 3000,
    //   env: {
    //     PORT: 3000,
    //   },
    //   watch: false,
    // },
    // {
    //   name: "client",
    //   script: "npm run production:runClient",
    //   restart_delay: 3000,
    //   env: {
    //     PORT: 3001,
    //   },
    //   watch: false,
    // },
  ],
};
