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
        // PNG Audit colors - exact colors from design prototypes
        mint: {
          DEFAULT: '#E8F8F0',      // Sidebar background, cell borders
        },
        terracotta: {
          DEFAULT: '#9E4B1D',      // Terre courts, FAB, Apply Filters button
        },
        coral: {
          light: '#FCA5A5',        // Hero subtitle "LE CLUB MARTINIQUE"
        },
        surface: {
          DEFAULT: '#f5fbf3',
          containerLow: '#f0f5ee',
          containerLowest: '#ffffff',
          containerHighest: '#dee4dd',
          high: '#e8ede7',
          sidebar: '#E8F8F0',      // Sidebar background (alias for mint)
        },
        onSurface: '#171d19',
        onSurfaceVariant: '#5d635e',
        outline: '#949a95',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          on: '#ffffff',
          onContainer: '#410002',
        },
        // Stats icon colors
        stats: {
          iconGreen: '#86EFAC',    // Active Bookings, Available Slots icons
          iconOrange: '#FED7AA',   // Maintenance icon
        },
        // Court badge colors
        court: {
          terreBadge: '#FFE5D9',   // Terre court badge background
          quickBadge: '#D1FAE5',   // Quick court badge background
        },
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
