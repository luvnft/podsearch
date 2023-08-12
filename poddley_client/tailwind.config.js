module.exports = {
  content: ["./components/**/*.{html,js,vue}", "./pages/**/*.{html,js,vue}"],
  darkMode: "class",
  variants: {
    extend: {
      backgroundColor: ["group-hover"],
    },
    nightwind: ["group-hover", "focus"], // Add any Tailwind variant
  },
  plugins: [require("nightwind")],
  prefix: "",
  important: true,
  theme: {
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
          300: "gray.600",
          400: "gray.500",
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
