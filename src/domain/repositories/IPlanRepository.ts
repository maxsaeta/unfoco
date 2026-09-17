import { DailyPriorities, MoodEntry, ShutdownChecklist } from '../types';

export interface IPlanRepository {
  getDailyPriorities(userId: string, date: string): Promise<DailyPriorities | null>;
  saveDailyPriorities(userId: string, priorities: DailyPriorities): Promise<void>;
  saveMood(userId: string, entry: MoodEntry): Promise<void>;
  getMood(userId: string, date: string): Promise<MoodEntry | null>;
  getMoodHistory(userId: string, days: number): Promise<MoodEntry[]>;
  getShutdownChecklist(userId: string): Promise<ShutdownChecklist | null>;
  saveShutdownChecklist(userId: string, checklist: ShutdownChecklist): Promise<void>;
  delete(userId: string): Promise<void>;
}
