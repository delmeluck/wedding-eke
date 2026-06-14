import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50:  '#fdf5fd',
          100: '#f8eaf8',
          200: '#f0d0f0',
          300: '#e0aede',
          400: '#cc84ca',
          500: '#b85cb5',
          600: '#9e409b',
          700: '#82307f',
          800: '#6b2568',   /* main mauve — buttons, nav RSVP pill  */
          900: '#4f1750',
          950: '#350b36',   /* dark section backgrounds              */
        },
        lavender: {
          50:  '#f8f0f8',
          100: '#f0dff0',
          200: '#e0c4e0',
          300: '#cca0cc',   /* mild mauve accent text                */
          400: '#b47cb4',
          500: '#985898',
        },
        earth: {
          50:  '#fdf8f0',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        cream: '#FEF7ED',
        linen: '#F5F0EB',
        gold: '#C9A84C',
      },
      fontFamily: {
        serif:  ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:   ['var(--font-lato)', 'system-ui', 'sans-serif'],
        script: ['var(--font-great-vibes)', 'cursive'],
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #350b36 0%, #4f1750 30%, #6b2568 60%, #7c3020 100%)',
        'soft-gradient':    'linear-gradient(180deg, #f8f0f8 0%, #fef7ed 100%)',
        'gold-shimmer':     'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)',
        'card-shine':       'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
      },
      animation: {
        'fade-up':       'fadeUp 0.7s ease-out both',
        'fade-up-slow':  'fadeUp 1s ease-out both',
        'fade-in':       'fadeIn 1s ease-out both',
        'float':         'float 7s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out 1.5s infinite',
        'shimmer':       'shimmer 3s linear infinite',
        'spin-slow':     'spin 20s linear infinite',
        'pulse-ring':    'pulseRing 2s ease-out infinite',
        'slide-down':    'slideDown 0.3s ease-out both',
        'tick':          'tick 0.15s ease-out',
        'draw-line':     'drawLine 1.2s ease-out both',
        'scale-in':      'scaleIn 0.5s ease-out both',
        'rotate-slow':   'rotateSlow 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-12px) rotate(1deg)' },
          '66%':      { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.95)', opacity: '1' },
          '70%':  { transform: 'scale(1.4)',  opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        tick: {
          '0%':   { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(-90deg)' },
        },
        drawLine: {
          '0%':   { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        rotateSlow: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      transitionTimingFunction: {
        'spring':    'cubic-bezier(0.21, 0.47, 0.32, 0.98)',
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
