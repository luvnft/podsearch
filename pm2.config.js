require("dotenv").config({ path: ".env" });
// Log environment variables for debugging
console.log('Environment Variables:');
console.log('MEILI_HTTP_ADDR:', process.env.MEILI_HTTP_ADDR);
console.log('MEILI_MASTER_KEY:', process.env.MEILI_MASTER_KEY);
console.log('MEILI_DB_PATH:', process.env.MEILI_DB_PATH);
console.log('MEILI_DUMP_DIR:', process.env.MEILI_DUMP_DIR);
console.log('MEILI_ENV:', process.env.MEILI_ENV);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
// start.js
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
    },
    {
      name: "backend",
      script: "/home/poddley/backend/./dist/app.js",
      env: {
        NODE_ENV: process.env.NODE_ENV,
        MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
      },
    },
    {
      name: "client",
      script: "/home/poddley/client/.output/server/index.mjs",
      env: {
        PORT: 3001,
      },
    },
  ],
};

