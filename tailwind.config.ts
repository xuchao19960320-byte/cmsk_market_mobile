import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
      },
      fontFamily: { sans: ['var(--font-sans)'] },
      fontSize: {
        caption: 'var(--font-size-caption)',
        body: 'var(--font-size-body)',
        section: 'var(--font-size-section)',
        title: 'var(--font-size-title)',
        metric: 'var(--font-size-metric)',
      },
      borderRadius: { panel: 'var(--radius-panel)' },
      spacing: { panel: 'var(--space-panel)' },
    },
  },
  plugins: [],
} satisfies Config;
