import { Platform, AccessibilityInfo } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const hitSlop = (size: number) => ({
  top: size,
  bottom: size,
  left: size,
  right: size,
});

export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

export const formatDuration = (minutes: number, seconds: number): string => {
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};
