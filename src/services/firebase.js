import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD_u15gTPO2E4yrY05zHcjYRRRredQjiHs",
    authDomain: "parking-reservations-aab73.firebaseapp.com",
    projectId: "parking-reservations-aab73",
    storageBucket: "parking-reservations-aab73.firebasestorage.app",
    messagingSenderId: "493153911582",
    appId: "1:493153911582:web:682c9e647116bde812bf0f",
    measurementId: "G-3BBBRH4FFQ"
  };
export const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
