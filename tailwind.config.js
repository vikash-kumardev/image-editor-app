/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html", // Make sure this line is also included
  ],
  theme: {
    extend: {
      // Defines the steps of the fade-in animation
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      // Creates the utility classes for the animation
      animation: {
        'fade-in': 'fade-in 1s ease-out',
        'fade-in-delay': 'fade-in 1.5s ease-out',
      },
    },
  },
  plugins: [],
}