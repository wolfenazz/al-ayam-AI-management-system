// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3hTZFPDStdROP3GqTPTu4U8AKY48KuQM",
  authDomain: "al-ayam-28793.firebaseapp.com",
  projectId: "al-ayam-28793",
  storageBucket: "al-ayam-28793.firebasestorage.app",
  messagingSenderId: "342949660155",
  appId: "1:342949660155:web:4fbe0c6f2e161425d8375e",
  measurementId: "G-F3MP5QF6WN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);