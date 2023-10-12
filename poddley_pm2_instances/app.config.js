module.exports = {
  apps: [
    {
      name: "meilisearch",
      script: "/mnt/volume_nyc1_02/meilisearch --no-analytics",
      watch: false,
      env: {
        NODE_ENV: "production",
        MEILI_HTTP_ADDR: "0.0.0.0:7700",
        MEILI_MASTER_KEY: "",
        MEILI_DB_PATH: "/mnt/volume_nyc1_02/data.ms/",
      },
    },
    {
      name: "api",
      script: "/home/poddley/poddley_api/dist/app.js",
      // watch: ["../../"], // Watches changes in the root folder
      env: {
        NODE_ENV: "production",
        MEILI_MASTER_KEY: "",
      },
    },
    {
      name: "rsscrawler",
      script: "/home/poddley/poddley_transcriber/rsscrawler/rsscrawler.js",
      cwd: "/home/poddley/poddley_transcriber/rsscrawler/",
      env: {
        MEILI_MASTER_KEY: """",
      },
    },
  ], 
}; 
 