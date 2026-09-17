import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeAuth, Auth, browserLocalPersistence } from 'firebase/auth';
import { Platform } from 'react-native';

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
const app: FirebaseApp = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia según plataforma
let auth: Auth;

if (Platform.OS === 'web') {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getReactNativePersistence } = require('firebase/auth');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Servicios
export { auth };
export const db: Firestore = getFirestore(app);

export default app;