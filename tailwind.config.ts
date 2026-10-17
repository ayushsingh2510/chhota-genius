import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        genius: {
          blue: {
            50: "#eff6ff",
            100: "#dbeafe",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
          },
          amber: {
            50: "#fffbeb",
            100: "#fef3c7",
            400: "#fbbf24",
            500: "#f59e0b",
            600: "#d97706",
          },
          coral: {
            50: "#fff1f2",
            100: "#ffe4e6",
            500: "#f43f5e",
            600: "#e11d48",
          },
          emerald: {
            50: "#ecfdf5",
            100: "#d1fae5",
            500: "#10b981",
            600: "#059669",
          },
          purple: {
            50: "#faf5ff",
            100: "#f3e8ff",
            500: "#a855f7",
            600: "#9333ea",
          },
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "kid-card": "0 8px 0 0 rgba(0, 0, 0, 0.08), 0 15px 25px -5px rgba(0, 0, 0, 0.05)",
        "kid-button": "0 6px 0 0 rgba(0, 0, 0, 0.15)",
        "kid-button-pressed": "0 2px 0 0 rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
