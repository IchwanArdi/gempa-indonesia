/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: '#0f172a', // solid deep color for accents
        canvas: {
          DEFAULT: '#0b0d10',
        },
        surface: '#0b0d10',
        'surface-raised': '#0f1417',
        border: '#1f2933',
        'content-primary': '#e6eef8',
        'content-secondary': '#a8b3bf',
        'content-tertiary': '#7f8b94',
        severity: {
          minor: '#22c55e',
          moderate: '#f59e0b',
          strong: '#f97316',
          severe: '#ef4444',
        },
      },
      spacing: {
        95: '380px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
};
