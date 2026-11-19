/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pink-magenta BELLAJAR (tombol utama, tab aktif, aksen)
        brand: {
          50: '#fff0fe',
          100: '#fde1fb',
          200: '#fbc6f6',
          300: '#f7a2ef',
          400: '#f07ce5',
          500: '#e655d8',
          600: '#d946c9',
          700: '#b52fa8',
          800: '#8c2882',
          900: '#6b2063',
        },
        ink: '#2a1b45',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['Fredoka', 'Poppins', 'ui-rounded', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
