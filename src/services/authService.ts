import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

// Registrar con email y contraseña
export async function registerWithEmail(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
}

// Iniciar sesión con email y contraseña
export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

// Iniciar sesión con Google
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error with Google login:', error);
    throw error;
  }
}

// Cerrar sesión
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

// Obtener usuario actual
export function getCurrentUser(): User | null {
  return auth.currentUser;
}