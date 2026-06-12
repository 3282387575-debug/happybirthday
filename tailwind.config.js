/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        midnight: {
          900: '#0a0420',
          800: '#120a35',
          700: '#1c1252',
        },
        champagne: {
          300: '#ffe6a8',
          400: '#ffd479',
          500: '#ffb84d',
        },
        rose: {
          300: '#ffd0e0',
          400: '#ff9fc4',
          500: '#ff6ea3',
        },
      },
      animation: {
        flicker: 'flicker 1.6s ease-in-out infinite',
        'rise-in': 'riseIn 0.6s ease-out both',
        'soft-pulse': 'softPulse 2.4s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.96)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        softPulse: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
