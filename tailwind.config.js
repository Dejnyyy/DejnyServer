// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      // adjust these globs to wherever you use Tailwind classes
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        // add custom colors, spacing, fonts, etc. here
      },
    },
    plugins: [
      // e.g. require('@tailwindcss/forms'),
    ],
  };
  