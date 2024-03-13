import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';


function SignIn({ setCurrentPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Signed up successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Signed in successfully!');
      }
      navigate('/home');
    } catch (error) {
      console.error(error);
      switch (error.code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          alert('Invalid email or password. Please try again.');
          break;
        default:
          alert('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#d3d3d3' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#808080', color: '#d3d3d3', caretColor: '#d3d3d3', cursor: 'pointer' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#808080', color: '#d3d3d3', caretColor: '#d3d3d3', cursor: 'pointer' }} />
        <button type="submit" style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2ab39e', color: '#d3d3d3' }}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#35495e', color: '#d3d3d3' }}>{isSignUp ? 'Already have an account? Sign In' : 'Create account'}</button>
      </form>
    </div>
  );
}

export default SignIn;