/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf5e0',
          100: '#f7ecc0',
          200: '#f0d97a',
          300: '#e6c84c',
          400: '#d4af37',
          500: '#b8941f',
          600: '#8a6f1f',
          700: '#6a5415',
          800: '#4a3a0e',
          900: '#2e2307',
        },
        dark: {
          900: '#0a0a0a',
          800: '#141210',
          700: '#1c1a15',
          600: '#26241d',
          500: '#33301f',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
};
