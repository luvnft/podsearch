require("dotenv").config({ path: "../.env" });

export default defineNuxtConfig({
  ssr: true,
  css: ["~/assets/css/imports/tailwind.css", "~/assets/css/imports/bootstrap.css", "~/assets/css/imports/global.css"],
  nitro: {
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    minify: true,
    preset: "cloudflare",
  },
  pages: true,
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  colorMode: {
    classSuffix: "",
    classPrefix: "tw-",
    globalName: "dark",
  },
  vueuse: {
    ssrHandlers: true,
    autoImports: true,
  },
  headlessui: {
    prefix: "Headless",
  },
  delayHydration: {
    mode: "init",
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/device",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxt/image",
    "@nuxtjs/supabase",
    "nuxt-lodash",
    "nuxt-headlessui",
    "@nuxtjs/svg-sprite",
    "nuxt-delay-hydration",
    "@nuxtjs/color-mode",
  ],
  lodash: {
    prefix: "_",
  },
  image: {
    provider: "cloudflare",
    cloudflare: {
      baseURL: "",
    },
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.NODE_ENV === "development" ? process.env.NUXT_API_BASE_URL_DEV : process.env.NUXT_API_BASE_URL,
      HOMEPAGE: process.env.NODE_ENV === "development" ? "localhost:3000" : "poddley.com",
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
