const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./components/**/*.{html,js,vue}", "./pages/**/*.{html,js,vue}"],
  variants: {
    extend: {
      backgroundColor: ["group-hover"],
    },
    nightwind: ["group-hover", "focus"],
  },
  important: true,
  plugins: [
    require("nightwind"),
    require("tailwind-animatecss"),
    require("tailwind-scrollbar")({ nocompatible: true }), // Need this nocompatible to enable rounded utilities in chrome/chromium-browsers
  ],
  prefix: "",
  darkMode: "class",
  theme: {
    screens: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1400px",
    },
    nightwind: {
      colorClasses: ["gradient", "ring", "ring-offset", "divide", "placeholder"],
      colorScale: "reduced",
      colors: {
        white: "gray.900",
        black: "gray.50",
        neutral: {
          50: "gray.900",
          100: "gray.800",
          200: "gray.700",
          300: "gray.700",
          400: "gray.700",
          500: "gray.400",
          600: "gray.300",
          700: "gray.200",
          800: "gray.100",
          900: "gray.300",
        },
      },
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
