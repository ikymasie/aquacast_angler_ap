
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLnROkeI9byRTopxA06PvgCtLWuidhV8U",
  authDomain: "aquacast-ktfzh.firebaseapp.com",
  projectId: "aquacast-ktfzh",
  storageBucket: "aquacast-ktfzh.firebasestorage.app",
  messagingSenderId: "1024825722020",
  appId: "1:1024825722020:web:8ec4326c76eccb9e2d5231"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
