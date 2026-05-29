import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#EEF4FF',
          100: '#DAE8FF',
          400: '#3B6EA5',
          600: '#1E3A5F',
          700: '#142C4A',
          800: '#0D1F35',
          900: '#080E1A',
        },
      },
    },
  },
  plugins: [],
};
export default config;
