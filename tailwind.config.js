/** @type {import('tailwindcss').Config} */
module.exports = {
   // Specifies the files that should be scanned by Tailwind CSS for CSS class extraction. 
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Allows you to extend or customize the default Tailwind CSS theme
  theme: {
    extend: {
      
    },
  },
  // Allows you to add plugins to Tailwind CSS
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class'
    })
  ],
}
