// Single source of truth for design tokens accessible from JS (RN style objects,
// gradients, shadows that NativeWind can't express). Keep in sync with tailwind.config.js.

export const colors = {
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
  surface: {
    DEFAULT: "#FFFFFF",
    raised: "#FFFFFF",
    sunken: "#FAFAFA",
    muted: "#F5F5F4",
    tint: "#FFF8F5",
  },
  background: "#FFFFFF",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#2563EB",
  rating: "#3D9963",
  veg: "#2E7D32",
  nonveg: "#C62828",
  gold: "#B8860B",
} as const;

export const shadows = {
  // soft, warm-tinted shadows — better than the harsh defaults
  card: {
    shadowColor: "#1F1408",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHover: {
    shadowColor: "#1F1408",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  brand: {
    shadowColor: colors.brand.DEFAULT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  pill: {
    shadowColor: "#1F1408",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 22,
  "3xl": 28,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;
