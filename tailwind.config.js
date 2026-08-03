/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAFAF9',
          dark: '#0C0A09'
        },
        ink: {
          DEFAULT: '#1C1917',
          dark: '#E7E5E4'
        },
        accent: '#B45309',
        destructive: '#BE123C',
        nature: '#15803D'
      },
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
