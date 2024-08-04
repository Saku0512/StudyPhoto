// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqFYLZnIX-K_BTnl2eVbwyyol2WIYXTr8",
  authDomain: "apps-for-children-b2c4a.firebaseapp.com",
  projectId: "apps-for-children-b2c4a",
  storageBucket: "apps-for-children-b2c4a.appspot.com",
  messagingSenderId: "116966769056",
  appId: "1:116966769056:web:e523390f30fc7f0c0aa4c5",
  measurementId: "G-14FP9LRRQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
