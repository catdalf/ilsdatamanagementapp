/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/sidebar.js',
    './src/components/home.js',
    './src/components/datatable.js',
    './src/App.js',
    './src/styles.css',
    
    
  ],
  theme: {
    extend: {
      colors: {
        customBlue: '#2ca79b',
      },
      focus: {
        customBlue: {
          boxShadow: '0 0 0 3px rgba(44, 167, 155, 0.5)', // Change the shadow color and properties as needed
        },
      },
    },
  },
  plugins: [],
};

