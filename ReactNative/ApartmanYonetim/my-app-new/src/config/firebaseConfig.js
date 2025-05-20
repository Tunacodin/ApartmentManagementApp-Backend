import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyDQGBzzY-EQ9_izk_re4HXhV69QsQ7kMQY",
  authDomain: "apartmentmanagementapp-ded85.firebaseapp.com",
  projectId: "apartmentmanagementapp-ded85",
  storageBucket: "apartmentmanagementapp-ded85.firebasestorage.app",
  messagingSenderId: "542973033342",
  appId: "1:542973033342:web:e3c22e2f44afc5e5c7112f",
  measurementId: "G-TB9RL7GFTT"
};

// Firebase'i sadece bir kez başlat
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage }; 