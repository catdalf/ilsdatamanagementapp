import React, { useState } from 'react';
import DataTable from './components/datatable'; 
import Sidebar from './components/sidebar'; 
import Home from './components/home'; 
import Login from './components/login';
import { UserProvider } from './UserContext';
import Signup from './components/signup'; 
import './tailwind.css';
import './styles.css';

function App() {
  const [currentPage, setCurrentPage] = useState('Login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  const handleSidebarItemClick = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('Home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('Login');
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      switch (currentPage) {
        case 'Login':
          return <Login onLogin={handleLogin} onNavigateToSignup={() => setCurrentPage('Signup')} />;
        case 'Signup':
          return <Signup onNavigateToLogin={() => setCurrentPage('Login')} />;
        default:
          return <Login onLogin={handleLogin} onNavigateToSignup={() => setCurrentPage('Signup')} />;
      }
    } else {
      switch (currentPage) {
        case 'Home':
          return <Home />;
        case 'Data Table':
          return <DataTable />;
        default:
          return <Home />;
      }
    }
  };

  return (
  <UserProvider>
    <div className="App">
      {isLoggedIn && <Sidebar handleSidebarItemClick={handleSidebarItemClick} />}
      <div className="content">
        {renderPage()}
      </div>
    </div>
  </UserProvider>
  );
}

export default App;