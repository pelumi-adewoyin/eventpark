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
          50:  '#EEEEFF',
          100: '#DDDEFF',
          200: '#C0C3FF',
          300: '#9BA0FF',
          400: '#7B82FF',
          500: '#5B65FA',
          600: '#4B55F5',
          700: '#3A42D4',
          800: '#2E35AA',
          900: '#1E2275',
          950: '#0A0D3B',
        },
        navy: '#0A0D3B',
        ep: {
          orange: '#F25122',
          'orange-light': '#FF7A4D',
          'orange-pale': '#FFF0EB',
          navy: '#0A0D3B',
          'navy-light': '#12165C',
          'navy-mid': '#1E2275',
          blue: '#4B55F5',
          'blue-light': '#EEF0FF',
        },
      },
      fontFamily: {
        sans: ['Rethink Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
