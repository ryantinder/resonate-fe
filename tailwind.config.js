/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
        colors: {
            'dark' : '#0b1217'
        },
        fontFamily: {
            'mont': ['Montserrat']
        }
    },
  },
  plugins: [],
}

