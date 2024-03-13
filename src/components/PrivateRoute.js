import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

function PrivateRouteWrapper({ children }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  if (!user) {
    navigate('/signin');
    return null;
  }

  return children;
}

export default PrivateRouteWrapper;