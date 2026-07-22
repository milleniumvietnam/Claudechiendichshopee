/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium luxury palette
        'luxury': {
          50: '#f8f6f3',
          100: '#f0ebe4',
          200: '#e8dfd4',
          300: '#dcc9bc',
          400: '#d4b9a1',
          500: '#c9a583',
          600: '#b89566',
          700: '#9d7d52',
          800: '#7d6441',
          900: '#5c4930',
        },
        'gold': {
          50: '#fefdf8',
          100: '#fdfaf0',
          200: '#fbf3de',
          300: '#f8e8c6',
          400: '#f5dba8',
          500: '#f0cd85',
          600: '#e8bb5c',
          700: '#d9a738',
          800: '#c49025',
          900: '#a17918',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '52px' }],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'luxury': '0 20px 40px rgba(0, 0, 0, 0.1)',
        'luxury-lg': '0 25px 50px rgba(0, 0, 0, 0.15)',
        'luxury-sm': '0 10px 20px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
