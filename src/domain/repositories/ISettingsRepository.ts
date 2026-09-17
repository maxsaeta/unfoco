import { TimerSettings } from '../types';

export interface ISettingsRepository {
  getTimerSettings(userId: string): Promise<TimerSettings>;
  saveTimerSettings(userId: string, settings: TimerSettings): Promise<void>;
  delete(userId: string): Promise<void>;
}
