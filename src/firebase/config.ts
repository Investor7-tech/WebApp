import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCYnidh3afF65sh97WdFrzLNjjS8bvCkNg",
  authDomain: "calm-cba88.firebaseapp.com",
  projectId: "calm-cba88",
  storageBucket: "calm-cba88.firebasestorage.app",
  messagingSenderId: "229035133034",
  appId: "1:229035133034:web:4f4fd9e04fb0073807a213"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };