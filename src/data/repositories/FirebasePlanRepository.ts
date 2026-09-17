import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { IPlanRepository } from '../../domain/repositories';
import { DailyPriorities, MoodEntry, ShutdownChecklist } from '../../domain/types';

export class FirebasePlanRepository implements IPlanRepository {
  async getDailyPriorities(userId: string, date: string): Promise<DailyPriorities | null> {
    const docRef = doc(db, 'users', userId, 'dailyPlan', date);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as DailyPriorities;
    }
    return null;
  }

  async saveDailyPriorities(userId: string, priorities: DailyPriorities): Promise<void> {
    const docRef = doc(db, 'users', userId, 'dailyPlan', priorities.date);
    await setDoc(docRef, priorities, { merge: true });
  }

  async saveMood(userId: string, entry: MoodEntry): Promise<void> {
    const docRef = doc(db, 'users', userId, 'moods', entry.date);
    await setDoc(docRef, {
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    }, { merge: true });
  }

  async getMood(userId: string, date: string): Promise<MoodEntry | null> {
    const docRef = doc(db, 'users', userId, 'moods', date);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        timestamp: new Date(data.timestamp),
      } as MoodEntry;
    }
    return null;
  }

  async getMoodHistory(userId: string, days: number): Promise<MoodEntry[]> {
    const moodsRef = collection(db, 'users', userId, 'moods');
    const q = query(moodsRef, orderBy('timestamp', 'desc'), limit(days));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: new Date(data.timestamp),
      } as MoodEntry;
    });
  }

  async getShutdownChecklist(userId: string): Promise<ShutdownChecklist | null> {
    const docRef = doc(db, 'users', userId, 'shutdown', 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ShutdownChecklist;
    }
    return null;
  }

  async saveShutdownChecklist(userId: string, checklist: ShutdownChecklist): Promise<void> {
    const docRef = doc(db, 'users', userId, 'shutdown', 'current');
    await setDoc(docRef, checklist, { merge: true });
  }

  async delete(userId: string): Promise<void> {
    try {
      const collections = ['dailyPlan', 'moods', 'shutdown'];
      for (const col of collections) {
        const colRef = collection(db, 'users', userId, col);
        const snapshot = await getDocs(colRef);
        for (const d of snapshot.docs) {
          await deleteDoc(d.ref);
        }
      }
    } catch (error) {
      console.error('Error deleting plan data:', error);
    }
  }
}
