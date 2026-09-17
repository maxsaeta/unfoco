import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { IStatsRepository } from '../../domain/repositories';
import { UserStats, DailyStats, TotalStats } from '../../domain/types';

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export class FirebaseStatsRepository implements IStatsRepository {
  async getUserStats(userId: string): Promise<UserStats> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().stats) {
      return docSnap.data().stats as UserStats;
    }
    return {};
  }

  async incrementPomodoro(userId: string, workMinutes: number): Promise<void> {
    const todayKey = getTodayKey();
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    const currentStats = docSnap.exists() ? (docSnap.data().stats || {}) : {};
    const todayStats = currentStats[todayKey] || {
      date: todayKey,
      pomodorosCompleted: 0,
      tasksCompleted: 0,
      totalFocusMinutes: 0,
    };

    todayStats.pomodorosCompleted += 1;
    todayStats.totalFocusMinutes += workMinutes;
    currentStats[todayKey] = todayStats;

    await setDoc(docRef, { stats: currentStats }, { merge: true });
  }

  async incrementTaskCompleted(userId: string): Promise<void> {
    const todayKey = getTodayKey();
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    const currentStats = docSnap.exists() ? (docSnap.data().stats || {}) : {};
    const todayStats = currentStats[todayKey] || {
      date: todayKey,
      pomodorosCompleted: 0,
      tasksCompleted: 0,
      totalFocusMinutes: 0,
    };

    todayStats.tasksCompleted += 1;
    currentStats[todayKey] = todayStats;

    await setDoc(docRef, { stats: currentStats }, { merge: true });
  }

  async getWeeklyStats(userId: string): Promise<DailyStats[]> {
    const stats = await this.getUserStats(userId);
    const result: DailyStats[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      result.push(stats[key] || {
        date: key,
        pomodorosCompleted: 0,
        tasksCompleted: 0,
        totalFocusMinutes: 0,
      });
    }

    return result;
  }

  async getTotalStats(userId: string): Promise<TotalStats> {
    const stats = await this.getUserStats(userId);
    let totalPomodoros = 0;
    let totalTasks = 0;
    let totalMinutes = 0;
    let streak = 0;

    const checkDate = new Date();

    // Calculate streak
    while (true) {
      const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      const dayStats = stats[key];

      if (dayStats && dayStats.pomodorosCompleted > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate totals
    Object.values(stats).forEach((dayStats) => {
      totalPomodoros += dayStats.pomodorosCompleted;
      totalTasks += dayStats.tasksCompleted;
      totalMinutes += dayStats.totalFocusMinutes;
    });

    return { totalPomodoros, totalTasks, totalMinutes, streak };
  }
}
