// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZc112wyj2QpBtpF_E_mZmBZVUYlwSDqA",
  authDomain: "kasneb-4daf2.firebaseapp.com",
  projectId: "kasneb-4daf2",
  storageBucket: "kasneb-4daf2.firebasestorage.app",
  messagingSenderId: "732903795860",
  appId: "1:732903795860:web:07ee0b3bb18c4fd75b5881",
  measurementId: "G-CV5WPLSLBD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 