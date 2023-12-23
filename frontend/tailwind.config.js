/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");
const colors = require("tailwindcss/colors");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      mobile: "300px",
      tablet: "640px",
      laptop: "1024px",
      desktop: "1280px",
    },
    extend: {
      backgroundImage: {
        logo: "url('assets/logo.webp')",
        pattern: "url('assets/chat-bg-pattern-light.png')",
      },
      backgroundSize: {
        "30%": "30%",
      },
      inset: {
        "06": "0.18rem",
        "05": "0.57rem",
      },
      maxHeight: {
        128: "93vh",
      },
      backgroundImage: {
        logo: "url('logo.webp')",
        pattern: "url('chat-bg-pattern-light.png')",
      },
      colors: {
        "gray-border": "rgb(218,220,224)",
        "header-status": "rgb(112,117,121)",
        "bg-pattern": "#90cbd599",
        "bg-badge": "rgb(196,201,204)",
        gray: colors.slate,
        zinc: colors.zinc,
      },
      boxShadow: {
        bshb: "0 2px 2px rgb(114 114 114 / 17%)",
        bsht: "0 -2px 2px rgb(114 114 114 / 17%)",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
});
