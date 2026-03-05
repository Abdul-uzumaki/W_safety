/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        bloom: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        petal: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        rose: {
          blush: '#fff0f6',
        }
      },
      backgroundImage: {
        'gradient-mesh': 'radial-gradient(at 40% 20%, #fbcfe8 0px, transparent 50%), radial-gradient(at 80% 0%, #e9d5ff 0px, transparent 50%), radial-gradient(at 0% 50%, #fce7f3 0px, transparent 50%), radial-gradient(at 80% 50%, #f3e8ff 0px, transparent 50%), radial-gradient(at 0% 100%, #fbcfe8 0px, transparent 50%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'bloom': '0 4px 24px -4px rgba(236, 72, 153, 0.25)',
        'petal': '0 4px 24px -4px rgba(168, 85, 247, 0.2)',
        'glass': '0 8px 32px 0 rgba(236, 72, 153, 0.1)',
      }
    },
  },
  plugins: [],
}