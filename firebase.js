// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKvZZ8GtRd3RW1yqiQzDdiAGY2M3eUdag",
  authDomain: "pantry-tracker-app-e7bf9.firebaseapp.com",
  projectId: "pantry-tracker-app-e7bf9",
  storageBucket: "pantry-tracker-app-e7bf9.appspot.com",
  messagingSenderId: "292202806642",
  appId: "1:292202806642:web:a1da10b69b7d94ccd771eb",
  measurementId: "G-S2MNBRPZYJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firestore
const firestore = getFirestore(app); // Initialize Firestore

// Export Firestore so it can be used in other parts of your app
export { firestore };
