/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DA1F2', // Twitter blue
        secondary: '#14171A',
        accent: '#FF6B35',
      }
    },
  },
  plugins: [],
}
