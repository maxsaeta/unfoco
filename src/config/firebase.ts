import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Inicializar Auth con AsyncStorage para persistencia
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Servicios
export const db = getFirestore(app);

export default app;