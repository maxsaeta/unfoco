import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { IAuthRepository } from '../../domain/repositories';
import { User, AuthCredentials, RegisterData } from '../../domain/types';

const mapFirebaseUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

export class FirebaseAuthRepository implements IAuthRepository {
  async login(credentials: AuthCredentials): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    return mapFirebaseUser(userCredential.user);
  }

  async register(data: RegisterData): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    if (data.displayName) {
      // Note: displayName update requires Firebase Auth profile update
      // which is not directly available in this API
    }

    return mapFirebaseUser(userCredential.user);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  getCurrentUser(): User | null {
    const user = auth.currentUser;
    return user ? mapFirebaseUser(user) : null;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  }
}
