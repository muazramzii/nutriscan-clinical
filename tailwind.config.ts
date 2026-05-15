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
        primary: {
          DEFAULT: "#1D9E75",
          50: "#E8F7F2",
          100: "#C5EBD9",
          200: "#9CDCC2",
          300: "#6FCAA8",
          400: "#3FB58D",
          500: "#1D9E75",
          600: "#178060",
          700: "#116048",
          800: "#0E4E3B",
          900: "#0A3A2C",
        },
        danger: {
          DEFAULT: "#E24B4A",
          50: "#FDF0F0",
          100: "#F9CECE",
          500: "#E24B4A",
          600: "#C73B3A",
        },
        warning: {
          DEFAULT: "#EF9F27",
          50: "#FEF6E7",
          100: "#FCDFA3",
          500: "#EF9F27",
          600: "#D88714",
        },
        success: {
          DEFAULT: "#1D9E75",
          50: "#E8F7F2",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFB",
          subtle: "#F3F6F8",
        },
        ink: {
          DEFAULT: "#0F172A",
          muted: "#475569",
          subtle: "#94A3B8",
          faint: "#CBD5E1",
        },
        background: "#F8FAFB",
      },
      fontFamily: {
        sans: ["var(--font-display)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        card: "0 1px 3px rgb(0 0 0 / 0.04), 0 4px 12px -4px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 16px -2px rgb(0 0 0 / 0.08), 0 12px 32px -8px rgb(0 0 0 / 0.1)",
        glow: "0 8px 32px -8px rgba(29, 158, 117, 0.35)",
        "glow-sm": "0 4px 16px -4px rgba(29, 158, 117, 0.3)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)",
        "gradient-soft": "linear-gradient(180deg, #f0faf6 0%, #f8fafb 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
