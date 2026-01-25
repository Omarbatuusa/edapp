/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "surface-dark": "#192233",
        "surface-light": "#ffffff",
        "border-dark": "#324467",
        "text-secondary": "#92a4c9",
      },
      fontFamily: {
        "display": ["Outfit", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
