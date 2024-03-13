// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import 'firebase/auth';
import { getAuth} from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCg01gcH-FEX3H_h6DF58wtpoVYqQPm4Bw",
  authDomain: "bilgem-ils-authentication.firebaseapp.com",
  projectId: "bilgem-ils-authentication",
  storageBucket: "bilgem-ils-authentication.appspot.com",
  messagingSenderId: "905786260497",
  appId: "1:905786260497:web:fca91c23b92094718685b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
