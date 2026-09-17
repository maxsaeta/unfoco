export interface DailyPriorities {
  date: string; // YYYY-MM-DD
  taskIds: [string | null, string | null, string | null]; // IDs de tareas seleccionadas
  completedPriorities: [boolean, boolean, boolean];
}

export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'bad';

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: MoodLevel;
  note?: string;
  timestamp: Date;
}

export interface ShutdownChecklist {
  tomorrowThing: string;
  calendarChecked: boolean;
  deskCleared: boolean;
  shutdownSaid: boolean;
}
