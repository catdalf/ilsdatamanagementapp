import React, { createContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    console.log('UserProvider rendered');
  }, []);

  return (
    <UserContext.Provider value={[role, setRole]}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;