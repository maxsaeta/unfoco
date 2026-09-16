import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBhZTdRjNyq7tIFb0RPSiuQTozTYaBTxqc",
  authDomain: "unpaso-747c5.firebaseapp.com",
  projectId: "unpaso-747c5",
  storageBucket: "unpaso-747c5.firebasestorage.app",
  messagingSenderId: "459204323613",
  appId: "1:459204323613:android:88aa6c9b75df738fd0d9f4"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;