import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", 50: "#EFF6FF", 100: "#DBEAFE", 600: "#2563EB", 700: "#1D4ED8", 800: "#1E40AF" },
        secondary: { DEFAULT: "#F59E0B", 50: "#FFFBEB", 100: "#FEF3C7", 600: "#D97706" },
        success: { DEFAULT: "#10B981", 50: "#ECFDF5" },
        danger: { DEFAULT: "#EF4444", 50: "#FEF2F2" },
        accent: { DEFAULT: "#8B5CF6", 50: "#F5F3FF" },
        bg: "#F8FAFC",
        ink: { DEFAULT: "#1E293B", muted: "#64748B" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Noto Sans Devanagari", "Noto Sans Kannada", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "Poppins", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: { card: "0 1px 2px rgba(15,23,42,.06), 0 4px 16px rgba(15,23,42,.06)" },
    },
  },
  plugins: [],
};
export default config;
