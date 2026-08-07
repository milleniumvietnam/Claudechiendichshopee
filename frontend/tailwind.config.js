/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Grounded in the subject: consumer electronics, not luxury goods.
        ink: {
          DEFAULT: '#0A0F1C', // a device screen when it's off
          800: '#131A2B',
          700: '#1D2739',
        },
        paper: {
          DEFAULT: '#FAFAFB', // cool neutral — deliberately not cream
          200: '#F1F3F6',
          300: '#E4E8EF',
        },
        volt: {
          DEFAULT: '#2B4BFF', // charging-LED blue: links on light — 5.67:1 on paper
          300: '#7C93FF',     // the same signal, lightened for dark panels — 6.81:1 on ink
          600: '#1E39D6',
          100: '#E8ECFF',
        },
        ember: {
          DEFAULT: '#C24405', // the deal signal — 5.09:1 under white text
          400: '#FF6A1A',     // untinted, for fills that carry no text
          100: '#FFEDE2',
        },
        jade: {
          DEFAULT: '#0C7E5B', // verified / positive — 5.06:1 on white
          100: '#EBF8F3',     // badge fill — lightened from #E3F5EE so jade text clears AA (4.47 -> 4.64:1)
        },
        slate: {
          DEFAULT: '#5B6478', // secondary text
          400: '#8A93A6',
          200: '#C9CFDA',
        },
      },
      fontFamily: {
        // Display: technical grotesque — hardware-catalog personality.
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // Body: drawn for Vietnamese diacritics (ế ữ ậ stack correctly).
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        // Data: spec ribbons, prices, technical strings.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 7vw, 5.25rem)', { lineHeight: '0.95', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.02', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.125rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        spec: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.09em' }],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,15,28,.05), 0 8px 24px -12px rgba(10,15,28,.16)',
        lift: '0 2px 4px rgba(10,15,28,.06), 0 18px 40px -16px rgba(10,15,28,.24)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.2,.7,.3,1)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        rise: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        marquee: 'marquee 46s linear infinite',
        rise: 'rise .5s cubic-bezier(.2,.7,.3,1) both',
      },
    },
  },
  plugins: [],
}
