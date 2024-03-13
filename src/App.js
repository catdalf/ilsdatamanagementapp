import React, { useState } from 'react';
import DataTable from './components/datatable'; 
import Sidebar from './components/sidebar'; 
import Home from './components/home'; 
import SignIn from './components/signin'; 
import './tailwind.css';
import './styles.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRouteWrapper from './components/PrivateRoute'; 

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
    <Router>
      <div className="App">
        <Sidebar handleSidebarItemClick={handleSidebarItemClick} />
        <div className="content">
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/home" element={
              <PrivateRouteWrapper>
                {renderPage()}
              </PrivateRouteWrapper>
            } />
            <Route path="/" element={<Navigate to="/signin" />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;