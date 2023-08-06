/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app.vue", "./components/**/*.{js,vue,ts}", "./layouts/**/*.vue", "./pages/**/*.vue", "./plugins/**/*.{js,ts}", "./nuxt.config.{js,ts}"],
  darkMode: "class",
  variants: {
    extend: {
      backgroundColor: ["group-hover"],
    },
  },
  plugins: [require("daisyui"), require("nightwind")],
  daisyui: {
    themes: false, // true: all themes | false: only light + dark | array: specific themes like this ["light", "dark", "cupcake"]
    base: false, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
  },
  prefix: "",
  important: true,
  theme: {
    extend: {
      keyframes: {
        colorPulse: {
          "0%, 100%": { filter: "brightness(100%)" },
          "50%": { filter: "brightness(70%)" },
        },
      },
      animation: {
        colorPulse: "colorPulse 2s infinite",
      },
      boxShadow: {
        xs: "0 0 2px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
      },
    },
    fontFamily: {},
  },
};
