/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern White & Blue theme palettes
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          card: '#FFFFFF',
        },
        navy: {
          950: '#0B1528',
          900: '#0F1E36',
          850: '#162846',
          800: '#1E3A5F',
          700: '#2C4F7C',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Core Royal Blue
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          cyan: '#0284C7',
          sky: '#0EA5E9',
          indigo: '#4F46E5',
          teal: '#0D9488',
        }
      },
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 35px -5px rgba(37, 99, 235, 0.35)',
        'glow-cyan': '0 0 35px -5px rgba(14, 165, 233, 0.35)',
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'card': '0 10px 30px -10px rgba(37, 99, 235, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 35px -12px rgba(37, 99, 235, 0.16), 0 2px 8px rgba(37, 99, 235, 0.08)',
      }
    },
  },
  plugins: [],
}
