import { Platform } from 'react-native';

let Notifications: typeof import('expo-notifications') | null = null;
let notificationsAvailable = false;

const loadNotifications = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return false;
    
    const mod = await import('expo-notifications');
    Notifications = mod;
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    
    notificationsAvailable = true;
    return true;
  } catch (error) {
    console.log('Notifications not available:', error);
    notificationsAvailable = false;
    return false;
  }
};

export const isPushNotificationsAvailable = (): boolean => {
  return notificationsAvailable;
};

export const registerForPushNotifications = async (): Promise<string | null> => {
  const loaded = await loadNotifications();
  if (!loaded || !Notifications) {
    console.log('Push notifications not available in this environment');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    console.log('Push notifications configured');
    return null;
  } catch (error) {
    console.log('Push notifications not available:', error);
    return null;
  }
};

export const scheduleTimerNotification = async (
  seconds: number,
  title: string,
  body: string
): Promise<string | null> => {
  const loaded = await loadNotifications();
  if (!loaded || !Notifications) {
    console.log('Local notifications not available');
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });
    return id;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  if (!Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (!Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error canceling notifications:', error);
  }
};

export const addNotificationListener = (
  handler: (notification: any) => void
) => {
  if (!Notifications) return { remove: () => {} };

  try {
    return Notifications.addNotificationReceivedListener(handler);
  } catch (error) {
    console.log('Error adding notification listener:', error);
    return { remove: () => {} };
  }
};

export const addNotificationResponseListener = (
  handler: (response: any) => void
) => {
  if (!Notifications) return { remove: () => {} };

  try {
    return Notifications.addNotificationResponseReceivedListener(handler);
  } catch (error) {
    console.log('Error adding notification response listener:', error);
    return { remove: () => {} };
  }
};
