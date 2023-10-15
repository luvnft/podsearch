import { config } from 'dotenv';

// Manually load .env from parent directory
config({ path: '../.env' });

export default defineNuxtConfig({
  ssr: true,
  css: ["~/assets/css/imports/bootstrap.css", "~/assets/css/imports/global.css"],
  nitro: {
    compressPublicAssets: {
      brotli: true,
      gzip: true,
    },
    minify: true,
    preset: "node-server",
    sourceMap: false,
  },
  colorMode: {
    preference: "dark", // default value of $colorMode.preference
    fallback: "dark", // fallback value if not system preference found
    classPrefix: "",
    classSuffix: "",
  },
  pages: true,
  sourcemap: {
    client: false,
    server: false,
  },
  vueuse: {
    ssrHandlers: true,
    autoImports: true,
  },
  headlessui: {
    prefix: "Headless",
  },
  modules: ["@nuxtjs/color-mode", "@nuxtjs/tailwindcss", "nuxt-headlessui", "@nuxtjs/svg-sprite", "@vueuse/nuxt", "@nuxt/image", "nuxt-lodash", "@nuxtjs/google-fonts", "@nuxtjs/device", "@pinia/nuxt", "nuxt-delay-hydration"],
  googleFonts: {
    families: {
      Lato: true,
      Quicksand: true,
    },
    download: true,
    base64: true,
    inject: true,
    overwriting: true,
    fontsDir: "assets/fonts",
    display: "swap", // 'auto' | 'block' | 'swap' | 'fallback' | 'optional',
    preload: true,
    useStylesheet: true,
  },
  lodash: {
    prefix: "_",
  },
  delayHydration:{
    mode: "mount"
  },
  image: {
    provider: "cloudflare",
    cloudflare: {
      baseURL: "",
    },
  },
  experimental: {
    clientFallback: true,
    componentIslands: true,
    inlineSSRStyles: true,
    viewTransition: true,
    crossOriginPrefetch: true,
    externalVue: true,
    treeshakeClientOnly: false,
    asyncEntry: true,
    typescriptBundlerResolution: true,
  },
  vite: {
    build: {
      minify: true,
      sourcemap: false,
      cssMinify: true,
      rollupOptions: {
        treeshake: true,
      },
    },
    css: {
      devSourcemap: false,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      title: "Poddley - Podcast Discovery, Transcriptions & Text-based Episode Search",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Search and identify podcasts playing around you. Dive deep into the episodes you love. Use Poddley to search for shows, read transcriptions, and explore a comprehensive corpus of transcribed podcasts, bringing every spoken word to your fingertips.",
        },
        { name: "msapplication-TileColor", content: "#2d89ef" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "favicon-16x16.png" },
        { rel: "manifest", href: "site.webmanifest" },
        { rel: "mask-icon", href: "safari-pinned-tab.svg", color: "#454545" },
        { rel: "icon", type: "image/svg+xml", href: "favicon.svg" },
        { rel: "icon", type: "image/png", href: "favicon.png" },
      ],
    },
  },
});
