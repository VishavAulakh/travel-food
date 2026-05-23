/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand — Swiggy-esque orange, tuned slightly warmer
        brand: {
          DEFAULT: "#FC5F30",
          50: "#FFF4F0",
          100: "#FFE4D9",
          200: "#FFC2A8",
          300: "#FF9D77",
          400: "#FC7C4D",
          500: "#FC5F30",
          600: "#E84A1B",
          700: "#C23B14",
          800: "#992E10",
          900: "#73220C",
        },
        // Neutral / text
        ink: {
          DEFAULT: "#0A0A0A",
          900: "#0A0A0A",
          800: "#171717",
          700: "#262626",
          600: "#404040",
          500: "#525252",
          400: "#737373",
          300: "#A3A3A3",
          200: "#D4D4D4",
          100: "#E5E5E5",
          50: "#F5F5F5",
        },
        // Surfaces
        surface: {
          DEFAULT: "#FFFFFF",
          raised: "#FFFFFF",
          sunken: "#FAFAFA",
          muted: "#F5F5F4",
          tint: "#FFF8F5", // brand-tinted background for hero sections
        },
        background: "#FFFFFF",
        // Status colors
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#2563EB",
        // Domain-specific
        rating: "#3D9963", // Swiggy green rating chip
        veg: "#2E7D32",
        nonveg: "#C62828",
        gold: "#B8860B",
        muted: "#737373", // backwards-compat shortcut
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "22px",
        "3xl": "28px",
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
    },
  },
  plugins: [],
};
