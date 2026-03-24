/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sovereign: {
          black: '#0a0a0f',
          dark: '#111118',
          card: '#16161f',
          border: '#2a2a3a',
          gold: '#c9a84c',
          'gold-light': '#e8c97a',
          'gold-dark': '#a07830',
          platinum: '#e8e8f0',
          muted: '#8888a8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'sovereign-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0d0d15 100%)',
        'gold-gradient': 'linear-gradient(135deg, #c9a84c 0%, #e8c97a 50%, #a07830 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
