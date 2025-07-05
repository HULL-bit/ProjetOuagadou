/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        maritime: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        ocean: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'wave': 'wave 4s ease-in-out infinite',
        'ripple': 'ripple 1.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'maritime': '0 8px 32px rgba(8, 145, 178, 0.15)',
        'maritime-lg': '0 20px 40px rgba(8, 145, 178, 0.2)',
        'ocean': '0 8px 32px rgba(6, 182, 212, 0.15)',
        'ocean-lg': '0 20px 40px rgba(6, 182, 212, 0.2)',
      }
    },
  },
  plugins: [],
};