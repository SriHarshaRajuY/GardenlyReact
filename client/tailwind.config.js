/** @type {import('tailwindcss').Config} */
export default {
  // 👇 enables dark mode toggling via the "dark" class on <body>
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        gardenGreen: "#2e7d32",   // main green
        gardenLight: "#c8e6c9",   // light green accent
        darkBg: "#0d0d0d",        // pure dark background
        lightBg: "#f7f9f7",       // light background (matches original design)
      },
    },
  },

  plugins: [],
};
