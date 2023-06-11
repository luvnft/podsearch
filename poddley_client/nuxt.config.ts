require("dotenv").config({ path: "../.env" });

export default defineNuxtConfig({
  ssr: true,
  css: [
    //Needed to make these globally available for all components/pages
    "~/assets/css/imports/fonts.css",
    "~/assets/css/global/global.css",
    "~/assets/css/imports/tailwind.css",
    "~/assets/css/imports/bootstrap.min.css",
    "vue-lite-youtube-embed/style.css",
  ],
  nitro: {
    compressPublicAssets: {
      brotli: true,
      gzip: false,
    },
  },
  pages: true,
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/device",
    "@vueuse/nuxt",
    "nuxt-delay-hydration",
    [
      "nuxt-purgecss",
      {
        // Whitelist specific classes or patterns
        whitelist: ["tw-*"],

        // Whitelist specific selectors or patterns
        whitelistPatterns: [/^tw-/],

        // Whitelist specific files
        whitelistPatternsChildren: [/^tw-/],

        // Specify the paths to all of the template files in your project
        paths: ["components/**/*.vue", "layouts/**/*.vue", "pages/**/*.vue", "plugins/**/*.js", "nuxt.config.js"],

        // Specify the default extractor for extracting class names from the templates
        extractors: () => [
          {
            extractor: (content: any) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
            extensions: ["html", "vue", "js"],
          },
        ],
      },
    ],
  ],
  delayHydration: {
    // enables nuxt-delay-hydration in dev mode for testing
    debug: process.env.NODE_ENV === "development",
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.NODE_ENV === "development" ? process.env.NUXT_API_BASE_URL_DEV : process.env.NUXT_API_BASE_URL,
      HOMEPAGE: process.env.NODE_ENV === "development" ? "localhost:3001" : "poddley.com",
    },
  },
  routeRules: {
    "/": {
      redirect: "/new",
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "Poddley - Search podcasts like text",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { hid: "description", name: "description", content: "Nuxt.js project" },
        { name: "msapplication-TileColor", content: "#da532c" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#373737" },
      ],
      script: [
        {
          src: "https://plausible.io/js/script.js",
          async: true,
        },
      ],
    },
  },
});
