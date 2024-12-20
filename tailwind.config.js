/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'punk-primary': '#ff3333',
        'punk-secondary': '#222222',
        'punk-accent': '#f6ff00',
        'punk-text': '#ffffff',
        'punk-muted': '#888888',
      },
      fontFamily: {
        'punk': ['Permanent Marker', 'cursive'],
        'punk-text': ['Special Elite', 'cursive'],
      },
    },
  },
  plugins: [],
}
