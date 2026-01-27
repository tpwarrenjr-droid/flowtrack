import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2w-abq-PtZwdCvwNB6JqmdCigA-lfK2I",
  authDomain: "flowtrack-cdcb3.firebaseapp.com",
  projectId: "flowtrack-cdcb3",
  storageBucket: "flowtrack-cdcb3.firebasestorage.app",
  messagingSenderId: "626108788880",
  appId: "1:626108788880:web:3df31e4dc0962e0299a815"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);