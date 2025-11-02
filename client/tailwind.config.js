/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gardenGreen: "#2e7d32",
        gardenLight: "#c8e6c9",
      },
    },
  },
  plugins: [],
}
