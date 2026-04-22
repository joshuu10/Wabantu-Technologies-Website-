/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./products/**/*.html", "./script.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          navy: "#0b1220",
          slate: "#111827",
          cyan: "#06b6d4",
          teal: "#14b8a6",
          lime: "#84cc16",
          orange: "#f97316",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(6,182,212,.25), 0 20px 50px -20px rgba(6,182,212,.35)",
      },
    },
  },
  plugins: [],
};
