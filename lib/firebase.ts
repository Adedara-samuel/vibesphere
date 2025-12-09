import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCcEDXJZoSzAzuWVt32v0Ew4Qm9B9m4gNA",
  authDomain: "epilux-f2b44.firebaseapp.com",
  projectId: "epilux-f2b44",
  storageBucket: "epilux-f2b44.firebasestorage.app",
  messagingSenderId: "700869897735",
  appId: "1:700869897735:web:0f2a5490a1ac34ac2a04a2",
  measurementId: "G-BE3K4WZFNR"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics };