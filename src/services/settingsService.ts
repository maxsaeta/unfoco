import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  breakMinutes: 5,
};

export const getTimerSettings = async (): Promise<TimerSettings> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return DEFAULT_SETTINGS;

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
};

export const saveTimerSettings = async (settings: TimerSettings): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { timerSettings: settings }, { merge: true });
  } catch (error) {
    console.error('Error saving timer settings:', error);
  }
};
