import React, { useState } from 'react';


function Signup({ onNavigateToLogin }) {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('http://localhost:5000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'  
    });

    const data = await response.json();

    if (data.status === 'success') {
      setMessage('Signup successful!'); // Add this line
    } else {
      setMessage('Signup failed.'); // Add this line
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#d3d3d3' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#808080', color: '#d3d3d3', caretColor: '#d3d3d3', cursor: 'pointer' }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#808080', color: '#d3d3d3', caretColor: '#d3d3d3', cursor: 'pointer' }} />
        <button type="submit" style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2ab39e', color: '#d3d3d3' }}>Sign Up</button>
      </form>
      <button onClick={onNavigateToLogin} style={{ marginTop:'20px', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#35495e', color: '#d3d3d3' }}>Already have an account? Log In</button>
    </div>
  );
}

export default Signup;