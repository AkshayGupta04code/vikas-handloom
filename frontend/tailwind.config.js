/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#faf6ef', linen: '#f1e9db', sand: '#e4d6bd',
        maroon: { DEFAULT: '#7a1f2b', dark: '#5a141e', light: '#a33a47' },
        indigo: { DEFAULT: '#26306b' },
        gold: { DEFAULT: '#b98b2e', light: '#e2c47a' },
        ink: '#2a2220',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: { soft: '0 10px 30px -12px rgba(60,30,20,.25)' },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { fadeUp: 'fadeUp .5s ease-out both' },
    },
  },
  plugins: [],
}