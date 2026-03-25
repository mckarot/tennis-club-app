/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006b3f',
          container: '#008751',
          fixed: '#8df8b7',
          fixedDim: '#70db9d',
        },
        secondary: {
          DEFAULT: '#9d431b',
          container: '#fe8c5e',
          fixed: '#ffdbce',
        },
        tertiary: {
          DEFAULT: '#9d3d43',
        },
        surface: {
          DEFAULT: '#f5fbf3',
          containerLow: '#f0f5ee',
          containerLowest: '#ffffff',
          containerHighest: '#dee4dd',
        },
        onSurface: '#171d19',
      },
      fontFamily: {
        headline: ['Lexend', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'headline-lg': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'headline-sm': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'title-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'title-md': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
