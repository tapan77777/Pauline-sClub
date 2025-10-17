import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  // PASTE YOUR CONFIG HERE from Step 3
 apiKey: "AIzaSyAi22QemzcvQASgiQxfPERKQMTlYh_rTeE",
  authDomain: "pauline-s-club.firebaseapp.com",
  projectId: "pauline-s-club",
  storageBucket: "pauline-s-club.firebasestorage.app",
  messagingSenderId: "580228741619",
  appId: "1:580228741619:web:0e071576fac6e717e03a86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);