/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1A1A2E",
        secondary: "#E94560",
        accent: "#0F3460",
        dark: {
          100: "#2A2A3E",
          200: "#1A1A2E",
          300: "#0F0F1A",
          400: "#0A0A12",
        },
        gold: "#F5C518",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
