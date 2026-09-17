export interface DailyStats {
  date: string; // YYYY-MM-DD
  pomodorosCompleted: number;
  tasksCompleted: number;
  totalFocusMinutes: number;
}

export interface UserStats {
  [date: string]: DailyStats;
}

export interface TotalStats {
  totalPomodoros: number;
  totalTasks: number;
  totalMinutes: number;
  streak: number;
}

export interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
}
