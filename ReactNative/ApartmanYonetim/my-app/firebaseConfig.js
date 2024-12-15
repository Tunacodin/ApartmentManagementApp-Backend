// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbktPIDExVL7xEv3IOhTibhD3wUd7vZZ4",
  authDomain: "expoapp-4a1aa.firebaseapp.com",
  projectId: "expoapp-4a1aa",
  storageBucket: "expoapp-4a1aa.firebasestorage.app",
  messagingSenderId: "220024704223",
  appId: "1:220024704223:web:56354080295185d205ad6a",
  measurementId: "G-NERLYJ72PW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
