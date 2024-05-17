import React, { useState, useContext } from 'react';
import UserContext from '../UserContext';

function Login({ onLogin, onNavigateToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [, setRole] = useContext(UserContext);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'  // Needed to include the cookie
    });

    const data = await response.json();

    if (data.status === 'success') {
      console.log('Setting role:', data.role)
      setRole(data.role);
      onLogin();
    } else {
      // Show an error message
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#d3d3d3' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#808080', color: '#d3d3d3', caretColor: '#d3d3d3', cursor: 'pointer' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#808080', color: '#d3d3d3', caretColor: '#d3d3d3', cursor: 'pointer' }} />
        <button type="submit" style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2ab39e', color: '#d3d3d3' }}>Log In</button>
      </form>
      <button onClick={onNavigateToSignup} style={{ marginTop: '20px', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#35495e', color: '#d3d3d3' }}>Sign Up</button>
    </div>
  );
}

export default Login;