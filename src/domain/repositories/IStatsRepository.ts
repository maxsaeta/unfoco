import { UserStats, DailyStats, TotalStats } from '../types';

export interface IStatsRepository {
  getUserStats(userId: string): Promise<UserStats>;
  incrementPomodoro(userId: string, workMinutes: number): Promise<void>;
  incrementTaskCompleted(userId: string): Promise<void>;
  getWeeklyStats(userId: string): Promise<DailyStats[]>;
  getTotalStats(userId: string): Promise<TotalStats>;
  delete(userId: string): Promise<void>;
}
