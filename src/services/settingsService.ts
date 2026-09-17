import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TimerSettings {
  workMinutes: number;
  breakMinutes: number;
}

const STORAGE_KEY = '@unpaso_timer_settings';

const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  breakMinutes: 5,
};

export const getTimerSettings = async (): Promise<TimerSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading timer settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveTimerSettings = async (settings: TimerSettings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving timer settings:', error);
  }
};
