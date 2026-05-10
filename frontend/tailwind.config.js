/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // VET-SOURCE brand palette (sourced from the pitch deck)
        brand: {
          50:  '#F2F8E8',
          100: '#DCEBC2',
          200: '#BFDB95',
          300: '#A2CB68',
          400: '#92D050', // pitch-deck accent (highlight green)
          500: '#7AB13B',
          600: '#57832B', // pitch-deck primary (logo badge)
          700: '#3F6320',
          800: '#2A4513',
          900: '#1B2B04', // pitch-deck background (deepest)
        },
        surface: {
          DEFAULT: '#1B2B04',
          raised: '#243606',
          card:   '#2D4408',
          border: '#3F6320',
        },
        ink: {
          DEFAULT: '#F0F0F0',
          muted:   '#B0C0A0',
        },
        success: { 100: '#DCFCE7', 600: '#16A34A' },
        warning: { 100: '#FEF9C3', 600: '#CA8A04' },
        danger:  { 100: '#FEE2E2', 600: '#DC2626' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'brand-radial':
          'radial-gradient(ellipse at center, rgba(146,208,80,0.06) 0%, rgba(27,43,4,0) 70%)',
      },
    },
  },
  plugins: [],
};
