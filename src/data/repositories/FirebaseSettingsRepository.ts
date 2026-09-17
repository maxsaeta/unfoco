import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ISettingsRepository } from '../../domain/repositories';
import { TimerSettings } from '../../domain/types';

const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  breakMinutes: 5,
};

export class FirebaseSettingsRepository implements ISettingsRepository {
  async getTimerSettings(userId: string): Promise<TimerSettings> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().timerSettings) {
        return docSnap.data().timerSettings as TimerSettings;
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading timer settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveTimerSettings(userId: string, settings: TimerSettings): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, { timerSettings: settings }, { merge: true });
    } catch (error) {
      console.error('Error saving timer settings:', error);
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user settings:', error);
    }
  }
}
