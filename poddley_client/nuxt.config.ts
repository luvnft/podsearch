require('dotenv').config({ path: '../.env' })

export default defineNuxtConfig({
  ssr: true,
  css: [
    //Needed to make these globally available for all components/pages
    "~/assets/css/imports/fonts.css",
    "~/assets/css/global/global.css",
    "~/assets/css/imports/tailwind.css",
    "~/assets/css/imports/bootstrap.min.css",
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  routeRules: {
    "/": {
      redirect: "/home",
    },
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.NODE_ENV === "development" ? process.env.NUXT_API_BASE_URL_DEV : process.env.NUXT_API_BASE_URL,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "Poddley - Search podcasts like text",
      meta: [{ charset: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { hid: "description", name: "description", content: "Nuxt.js project" }, { name: "msapplication-TileColor", content: "#da532c" }, { name: "theme-color", content: "#ffffff" }],
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
