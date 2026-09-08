import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0B0D10',
        surface: {
          DEFAULT: '#14171B',
          raised: '#1B1F24',
        },
        border: {
          DEFAULT: '#262B31',
        },
        content: {
          primary: '#E7E9EC',
          secondary: '#8B919B',
          tertiary: '#5A5F68',
        },
        brand: {
          DEFAULT: '#2DA8A0',
          hover: '#35BDB4',
          muted: 'rgba(45, 168, 160, 0.12)',
        },
        // Skala severity gempa — fungsional, mengikuti konvensi
        // intensitas seismik nyata (mirip USGS ShakeMap), bukan
        // pilihan warna dekoratif.
        severity: {
          minor: '#5AA46B', // < 4.0
          light: '#C9A227', // 4.0 - 4.9
          moderate: '#D97B29', // 5.0 - 5.9
          strong: '#C6403A', // >= 6.0
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
      },
    },
  },
  plugins: [],
} satisfies Config;
