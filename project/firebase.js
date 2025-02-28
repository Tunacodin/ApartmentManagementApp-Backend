import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDQGBzzY-EQ9_izk_re4HXhV69QsQ7kMQY",
  authDomain: "apartmentmanagementapp-ded85.firebaseapp.com",
  projectId: "apartmentmanagementapp-ded85",
  storageBucket: "apartmentmanagementapp-ded85.firebasestorage.app",
  messagingSenderId: "542973033342",
  appId: "1:542973033342:web:4dcd1c5f89c4a34cc7112f",
  measurementId: "G-6560PWE6T9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };