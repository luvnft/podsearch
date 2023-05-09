/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./components/**/*.{js,vue,ts}", "./layouts/**/*.vue", "./pages/**/*.vue", "./plugins/**/*.{js,ts}", "./nuxt.config.{js,ts}"],
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
      fontFamily: {
        Pacifico: ["Pacifico"],
        Inter: ["Inter"],
        Merge: ["Merge"],
        RobotoSlab: ["RobotoSlab"],
        Sacramento: ["Sacramento"],
      },
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
  },
};