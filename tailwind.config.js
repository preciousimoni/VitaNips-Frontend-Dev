/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.25rem',
          md: '2rem',
          lg: '2.5rem',
          xl: '3rem',
        },
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#32a852', // Base brand color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          light: '#5bc475',
          DEFAULT: '#32a852',
          dark: '#267a3e',
        },
        secondary: '#333333',
        accent: '#ffc107',
        background: '#ffffff',
        surface: '#f7fafc',
        muted: '#6b7280',
        error: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Ojuju', 'sans-serif'], // Added Ojuju for headings as requested previously
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}
