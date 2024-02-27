import React, { useState } from 'react';
import DataTable from './components/datatable'; 
import Sidebar from './components/sidebar'; 
import Home from './components/home'; 
import Import from './components/import'; 
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
      case 'Import':
        return <Import />;
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
