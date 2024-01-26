import React, { useState } from 'react';
import DataTable from './components/datatable'; // Update the path relative to your project structure
import Sidebar from './components/sidebar'; // Update the path relative to your project structure
import Home from './components/home'; // Update the path relative to your project structure
import './tailwind.css';
import './styles.css';

function App() {
  const [currentPage, setCurrentPage] = useState('Home');

  const handleSidebarItemClick = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Home />;
      case 'Data Table':
        return <DataTable />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      <Sidebar handleSidebarItemClick={handleSidebarItemClick} />
      <div className="content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
