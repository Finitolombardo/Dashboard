/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#f2f2f4',
          100: '#e4e5e8',
          200: '#c8cacf',
          300: '#a9abb3',
          400: '#808390',
          500: '#5c5f6a',
          600: '#3e4049',
          700: '#262830',
          800: '#181a20',
          850: '#121318',
          900: '#0d0e12',
          950: '#08090b',
        },
        gold: {
          50: '#fef9ee',
          100: '#f9efd4',
          200: '#f0d898',
          300: '#e4be5c',
          400: '#d9a83a',
          500: '#c9901e',
          600: '#a87218',
          700: '#865516',
          800: '#6c4318',
          900: '#583617',
        },
        accent: {
          50: '#fef9ee',
          100: '#f9efd4',
          200: '#f0d898',
          300: '#e4be5c',
          400: '#d9a83a',
          500: '#c9901e',
          600: '#a87218',
          700: '#865516',
          800: '#6c4318',
          900: '#583617',
        },
        success: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.95rem' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
