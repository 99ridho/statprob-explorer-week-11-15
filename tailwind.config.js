/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebarBg: "#1e1b4b",
        sidebarActive: "#6366f1",
        sidebarHover: "#312e81",
        pageBg: "#f8fafc",
        cardBorder: "#e2e8f0",
        marker: "#ef4444",
        curve: "#3b82f6",
        betaStroke: "#6366f1",
        mean: "#f97316",
        highlight: "#dcfce7",
        placeholder: "#f59e0b",
        availableDot: "#22c55e",
        placeholderBg: "#f1f5f9",
      },
    },
  },
  plugins: [],
};
