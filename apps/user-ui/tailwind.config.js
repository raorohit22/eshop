/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}",
  ],
  theme: {
    extend: {
      fontFamily:{
        Roboto: ["var(--font-roboto)"],
        Poppins: ["var(--font-poppins)"]
      }
    },
  },
  plugins: [],
};
