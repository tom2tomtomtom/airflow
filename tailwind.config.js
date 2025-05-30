/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Disable Tailwind's preflight styles to prevent conflicts with Material-UI
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#bbdefb',
          DEFAULT: '#1976d2',
          dark: '#1565c0',
        },
        secondary: {
          light: '#ff5983',
          DEFAULT: '#dc004e',
          dark: '#9a0036',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
