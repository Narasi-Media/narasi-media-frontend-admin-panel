/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#0F172A',
          card: '#1E293B',
          accent: '#6366F1',
        }
      }
    },
  },
  plugins: [],
}
