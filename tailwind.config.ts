import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF3E7",
        peach: "#F4A99B",
        butter: "#F2C879",
        mint: "#A9CBB7",
        umber: "#4A3B32",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Fredoka", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        handwriting: ["var(--font-handwriting)", "Itim", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
