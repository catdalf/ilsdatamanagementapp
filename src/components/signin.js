import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import PrivateRouteWrapper from './PrivateRoute';

function SignIn({ setCurrentPage, setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        if (isSignUp) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const db = getFirestore();
            const userDoc = doc(db, 'users', user.uid);
            console.log('About to create Firestore document for user', user.uid);
            await setDoc(userDoc, { role: 'casual' });
            console.log('Created Firestore document for user', user.uid);
            alert('Signed up successfully!');
            navigate('/signin');
        } else {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const db = getFirestore();
            const userDoc = doc(db, 'users', user.uid);
            const userDocData = await getDoc(userDoc);
            const userRole = userDocData.data().role;
            setRole(userRole); // store the user's role in your app's state
            setSignedIn(true);
            alert('Signed in successfully!');
            navigate('/home');
        }
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
    <PrivateRouteWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#d3d3d3' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#808080', color: '#d3d3d3', caretColor: '#d3d3d3', cursor: 'pointer' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#808080', color: '#d3d3d3', caretColor: '#d3d3d3', cursor: 'pointer' }} />
          <button type="submit" style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2ab39e', color: '#d3d3d3' }}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#35495e', color: '#d3d3d3' }}>{isSignUp ? 'Already have an account? Sign In' : 'Create account'}</button>
        </form>
      </div>
    </PrivateRouteWrapper>
  );
}

export default SignIn;