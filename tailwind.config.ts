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
        background: "#10131a",
        surface: {
          low: "#191c22",
          DEFAULT: "#1e2128",
          high: "#272a31",
          highest: "#32353c",
        },
        primary: {
          DEFAULT: "#00e0ff",
          dim: "#00daf8",
          fixed: "#a5eeff",
          on: "#00363f",
        },
        "on-surface": "#e1e2eb",
        "on-surface-variant": "#bac9cd",
        secondary: "#dcb8ff",
        tertiary: "#e8e6ff",
        error: "#ffb4ab",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
