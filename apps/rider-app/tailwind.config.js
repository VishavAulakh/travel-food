/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#FF6B35",
        surface: "#1F2937",
        background: "#111827",
        card: "#374151",
        muted: "#6B7280",
        success: "#10B981",
        online: "#22C55E",
        offline: "#6B7280",
      },
    },
  },
  plugins: [],
};
