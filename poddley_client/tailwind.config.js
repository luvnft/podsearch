/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app.vue", "./components/**/*.{js,vue,ts}", "./layouts/**/*.vue", "./pages/**/*.vue", "./plugins/**/*.{js,ts}", "./nuxt.config.{js,ts}"],
  darkMode: "class",
  variants: {
    extend: {
      backgroundColor: ["group-hover"],
    },
    nightwind: ["group-hover"], // Add any Tailwind variant
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
    nightwind: {
      // transitionClasses: "full",
      // colorClasses: ["gradient", "ring", "ring-offset", "divide", "placeholder"],
      // colorScale: "reduced",
      // colors: {
      //   white: "gray.900",
      //   black: "gray.50",
      //   neutral: {
      //     50: "gray.900",
      //     100: "gray.800",
      //     200: "gray.700",
      //     300: "gray.600",
      //     400: "gray.600",
      //     500: "gray.500",
      //     600: "gray.500",
      //     700: "gray.400",
      //     800: "gray.400",
      //     900: "gray.300",
      //   },
      // },
    },
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
