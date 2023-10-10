module.exports = {
  apps: [ 
    {
      name: "Poddley API",
      script: "../poddley_api/dist/app.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        MEILISEARCH_API_KEY: "JZDCCGPEGFlfUZhbJ3s9JPtetws-6Xqpd38HbF2E1NU",
      },
    },
  ],
};
