import { User, AuthCredentials, RegisterData } from '../types';

export interface IAuthRepository {
  login(credentials: AuthCredentials): Promise<User>;
  register(data: RegisterData): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
