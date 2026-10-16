/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0B1020',
        deepIndigo: '#151536',
        surface: '#171B2E',
        surfaceCard: '#1E2238',
        surfaceCardHover: '#252B45',
        surfaceBorder: '#2D334D',
        brandViolet: '#8B5CF6',
        brandIndigo: '#6366F1',
        brandCyan: '#22D3EE',
        brandPink: '#EC4899',
        statusSuccess: '#22C55E',
        statusWarning: '#F59E0B',
        statusError: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.35)',
        'glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out both',
        'scale-in': 'scaleIn 0.25s ease-out both',
        'fade-in-left': 'fadeInLeft 0.35s ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
