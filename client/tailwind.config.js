/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        lime:    { DEFAULT: '#b9ff66', dark: '#8ecf3e' },
        surface: '#0d0d0d',
        card:    '#141414',
        border:  '#222222',
        muted:   '#666666',
      }
    }
  },
  plugins: []
}
