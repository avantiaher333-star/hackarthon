/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#030712', // deep obsidian
          900: '#0B0F19', // surface primary
          850: '#111827', // card surface
          800: '#1F2937', // border
          700: '#374151',
        },
        navy: {
          950: '#030712',
          900: '#0A0F1D',
          850: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        neon: {
          green: '#00F59B',
          cyan: '#00E5FF',
          violet: '#A855F7',
          rose: '#FF3366',
          amber: '#FFB800',
        },
        emerald: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          neon: '#00F59B',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          neon: '#FF3366',
        },
        purple: {
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
        },
        cyan: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 35px -5px rgba(0, 245, 155, 0.4)',
        'glow-cyan': '0 0 35px -5px rgba(0, 229, 255, 0.35)',
        'glow-violet': '0 0 35px -5px rgba(168, 85, 247, 0.4)',
        'glow-rose': '0 0 35px -5px rgba(255, 51, 102, 0.4)',
        'glow-amber': '0 0 35px -5px rgba(255, 184, 0, 0.4)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.07)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0, 245, 155, 0.25)',
      }
    },
  },
  plugins: [],
}

