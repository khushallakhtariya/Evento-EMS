/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#fafafa",
        primary: "#006CE6",
        secondary: "#D1D5D8",
        primarydark: "#0054B3",
        primarylight: "#cae1fa",
        "dark-background": "#121212",
        "dark-surface": "#1e1e1e",
        "dark-primary": "#3a86ff",
        "dark-text": "#e0e0e0",
      },
    },
  },
  plugins: [],
};
