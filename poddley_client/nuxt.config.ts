require("dotenv").config({ path: "../.env" });

export default defineNuxtConfig({
  ssr: true,
  css: ["~/assets/css/imports/tailwind.css", "~/assets/css/imports/bootstrap.css", "~/assets/css/imports/global.css"],
  nitro: {
    compressPublicAssets: {
      brotli: true,
      gzip: false,
    },
    minify: true,
  },
  pages: true,
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vuetify: {
    /* vuetify options */
    vuetifyOptions: {
      // @TODO: list all vuetify options
    },

    moduleOptions: {
      /* nuxt-vuetify module options */
      treeshaking: true,
      useIconCDN: true,

      /* vite-plugin-vuetify options */
      autoImport: true,
    },
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/device",
    "nuxt-delay-hydration",
    "@nuxtjs/plausible",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@invictus.codes/nuxt-vuetify",
    "@nuxtjs/device",
    "@nuxtjs/color-mode",
    "nuxt-lazy-load",
    "@nuxtjs/critters",
  ],
  lazyLoad: {
    // These are the default values
    images: true,
    videos: true,
    audios: true,
    iframes: true,
    native: false,
    directiveOnly: false,

    // To remove class set value to false
    loadingClass: "isLoading",
    loadedClass: "isLoaded",
    appendClass: "lazyLoad",

    observerConfig: {
      // See IntersectionObserver documentation
    },
  },
  delayHydration: {
    mode: "mount",
  },
  plausible: {
    domain: "poddley.com",
    trackLocalhost: true,
    autoPageviews: true,
    autoOutboundTracking: true,
  },
  router: { options: { strict: true } },
  runtimeConfig: {
    public: {
      baseURL: process.env.NODE_ENV === "development" ? process.env.NUXT_API_BASE_URL_DEV : process.env.NUXT_API_BASE_URL,
      HOMEPAGE: process.env.NODE_ENV === "development" ? "localhost:3000" : "poddley.com",
    },
  },
  image: {},
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "Poddley - Search podcasts like text",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "Poddley - Search podcasts like text",
          content: "Search podcast transcriptions like text. It would functionalliy be like shazam, but for podcast transcriptions I suppose.",
        },
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
    },
  },
});
