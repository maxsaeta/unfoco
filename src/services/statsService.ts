import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface DailyStats {
  date: string; // YYYY-MM-DD
  pomodorosCompleted: number;
  tasksCompleted: number;
  totalFocusMinutes: number;
}

export interface UserStats {
  [date: string]: DailyStats;
}

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return {};

    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().stats) {
      return docSnap.data().stats as UserStats;
    }
    return {};
  } catch (error) {
    console.error('Error loading stats:', error);
    return {};
  }
};

export const incrementPomodoro = async (workMinutes: number): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

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
  } catch (error) {
    console.error('Error incrementing pomodoro:', error);
  }
};

export const incrementTaskCompleted = async (): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

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
  } catch (error) {
    console.error('Error incrementing task:', error);
  }
};

export const getWeeklyStats = async (): Promise<DailyStats[]> => {
  const stats = await getUserStats();
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
};

export const getTotalStats = async (): Promise<{
  totalPomodoros: number;
  totalTasks: number;
  totalMinutes: number;
  streak: number;
}> => {
  const stats = await getUserStats();
  let totalPomodoros = 0;
  let totalTasks = 0;
  let totalMinutes = 0;
  let streak = 0;

  const today = new Date();
  let checkDate = new Date();

  // Calculate streak (consecutive days with at least 1 pomodoro)
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
};
