/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Abril Fatface"', 'serif'],
        script: ['Pacifico', 'cursive'],
        body: ['Merriweather', 'serif'],
      },
      colors: {
        parchment: '#F5E6C8',
        card: '#FDF6E3',
        sepia: '#2C1A0E',
        terracotta: '#C67B5C',
        border: '#D4A574',
        teal: '#4A7B7C',
        blush: '#E8B4B8',
      },
    },
  },
  plugins: [],
}
