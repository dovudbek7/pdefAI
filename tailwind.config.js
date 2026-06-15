/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        book: ['Spectral', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        paper: '#f7f3ec',
        panel: '#fbf9f4',
        ink: '#1f1b16',
        muted: '#8a8074',
        line: '#e6ddd0',
        accent: '#b5562f',
        accentsoft: '#e8c9b8',
      },
    },
  },
  plugins: [],
};
