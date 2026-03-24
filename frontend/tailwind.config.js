/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: "#0ea5e9", dark: "#0284c7", light: "#38bdf8" },
        danger:   { DEFAULT: "#ef4444", light: "#fca5a5" },
        warning:  { DEFAULT: "#f59e0b", light: "#fcd34d" },
        success:  { DEFAULT: "#22c55e", light: "#86efac" },
        dark:     { DEFAULT: "#0f172a", card: "#1e293b", border: "#334155" },
      },
      fontFamily: {
        sans:    ["'Sora'", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
