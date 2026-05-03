/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bcfc',
          400: '#8198f8',
          500: '#6272f2',
          600: '#4f52e6',
          700: '#4240cb',
          800: '#3636a4',
          900: '#303382',
          950: '#1e1e4c',
        },
        accent: {
          400: '#f97316',
          500: '#ea6c0a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
