import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import React from 'react';

function PrivateRouteWrapper({ children, signedIn, ...rest }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const userDoc = doc(db, 'users', user.uid);
        const userDocData = await getDoc(userDoc);
        if (userDocData.exists()) {
          setRole(userDocData.data().role);
        }
      }
    };
    fetchRole();
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  // You now have access to the user's role in your component
  console.log(role);

  return React.cloneElement(children, rest);
}

export default PrivateRouteWrapper;