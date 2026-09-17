// Notifications disabled for Expo Go compatibility
// To re-enable, create a development build with: eas build

export const isPushNotificationsAvailable = (): boolean => false;

export const registerForPushNotifications = async (): Promise<string | null> => {
  console.log('Notifications disabled in Expo Go');
  return null;
};

export const scheduleTimerNotification = async (
  seconds: number,
  title: string,
  body: string
): Promise<string | null> => {
  console.log('Notifications disabled in Expo Go');
  return null;
};

export const cancelNotification = async (notificationId: string): Promise<void> => {};

export const cancelAllNotifications = async (): Promise<void> => {};

export const addNotificationListener = (handler: (notification: any) => void) => {
  return { remove: () => {} };
};

export const addNotificationResponseListener = (handler: (response: any) => void) => {
  return { remove: () => {} };
};
