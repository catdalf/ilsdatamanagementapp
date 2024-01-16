/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'C:/Users/eren.buldum/Desktop/bilgemilsapplication/ils-data-management-app/src/components/sidebar.js',
    'C:/Users/eren.buldum/Desktop/bilgemilsapplication/ils-data-management-app/src/components/home.js',
    'C:/Users/eren.buldum/Desktop/bilgemilsapplication/ils-data-management-app/src/components/datatable.js',
    'C:/Users/eren.buldum/Desktop/bilgemilsapplication/ils-data-management-app/src/App.js',
    'C:/Users/eren.buldum/Desktop/bilgemilsapplication/ils-data-management-app/src/styles.css',
    
    
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

