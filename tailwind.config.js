/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/App.tsx",
    "./src/main.tsx",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brutalist-black': '#000000',
        'brutalist-white': '#FFFFFF',
        'brutalist-gray-light': '#F5F5F5',
        'brutalist-gray-dark': '#1A1A1A',
        'brutalist-border': '#000000',
        'brutalist-accent': '#000000',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'none': '0px',
      },
      boxShadow: {
        'brutalist': '6px 6px 0px #000000',
        'brutalist-lg': '8px 8px 0px #000000',
        'brutalist-hover': '4px 4px 0px #000000',
      },
      animation: {
        'brutalist-hover': 'brutalistHover 0.1s ease',
      },
      keyframes: {
        brutalistHover: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-2px, -2px)' },
        },
      },
    },
  },
  plugins: [],
}