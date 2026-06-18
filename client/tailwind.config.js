/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#16a34a', light: '#22c55e', dark: '#15803d' },
        surface: '#1a1f2e',
        card: '#232938',
        border: '#2d3347'
      }
    }
  },
  plugins: []
}
