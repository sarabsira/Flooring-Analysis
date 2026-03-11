/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f0f4f1',
          100: '#d8e5da',
          200: '#b2cab6',
          300: '#83a889',
          400: '#5a875f',
          500: '#3d6b42',
          600: '#2e5232',
          700: '#1C2B1F',
          800: '#162118',
          900: '#0f1710',
        },
        timber: {
          50:  '#fdf6ed',
          100: '#f8e8ce',
          200: '#f0cf9a',
          300: '#e6b060',
          400: '#D4832A',
          500: '#c06d1a',
          600: '#a05614',
          700: '#7d4110',
          800: '#5e3010',
          900: '#3f200b',
        },
        stone: {
          50:  '#f8f7f4',
          100: '#eeece6',
          200: '#ddd9ce',
          300: '#c4bfb0',
          400: '#a8a293',
          500: '#8B8B7A',
          600: '#706f60',
          700: '#5a5a4d',
          800: '#48483f',
          900: '#3a3a32',
        },
        cream: '#F5F0E8',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
        body: ['Lato', 'sans-serif'],
      }
    }
  },
  plugins: []
}
