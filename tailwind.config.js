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
        'primary': 'rgb(var(--primary-color) / <alpha-value>)',
        'secondary': 'rgb(var(--secondary-color) / <alpha-value>)',
        'accent': 'rgb(var(--accent-color) / <alpha-value>)',
        'background': 'rgb(var(--background-rgb) / <alpha-value>)',
        'foreground': 'rgb(var(--foreground-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-lexend-deca)', 'Lexend Deca', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
      },
      borderRadius: {
        'lg': '0.5rem',
      },
    },
  },
  plugins: [],
} 