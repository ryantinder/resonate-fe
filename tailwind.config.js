/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
        colors: {
            'primary' : '#375bd2',
            'blue' : '#375bd2',
            'red' : '#ff5e57',
            'notwhite' : '#f5f7fd',
            'gray' : '#dfe7fb'
        },
        fontFamily: {
            'mont': ['Montserrat']
        }
    },
  },
  plugins: [],
}

