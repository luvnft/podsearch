/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app.vue", "./components/**/*.{js,vue,ts}", "./layouts/**/*.vue", "./pages/**/*.vue", "./plugins/**/*.{js,ts}", "./nuxt.config.{js,ts}"],
  darkMode: "class",
  variants: {
    extend: {
      backgroundColor: ["group-hover"],
    },
  },
  plugins: [],
  prefix: "tw-",
  important: true,
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
      },
    },
    fontFamily: {},
  },
};
