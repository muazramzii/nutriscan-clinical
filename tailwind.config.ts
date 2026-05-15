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
          500: "#1D9E75",
          600: "#178060",
          700: "#116048",
        },
        danger: {
          DEFAULT: "#E24B4A",
          50: "#FDF0F0",
          100: "#F9CECE",
        },
        warning: {
          DEFAULT: "#EF9F27",
          50: "#FEF6E7",
          100: "#FCDFA3",
        },
        background: "#F8FAFB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
