import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let pushNotificationsAvailable = true;

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log('Notifications not available in this environment');
  pushNotificationsAvailable = false;
}

export const isPushNotificationsAvailable = (): boolean => {
  return pushNotificationsAvailable;
};

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!pushNotificationsAvailable) {
    console.log('Push notifications not available in Expo Go SDK 57+');
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

    // Skip push token in Expo Go (not supported in SDK 57+)
    console.log('Push notifications configured (local only in Expo Go)');
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
  if (!pushNotificationsAvailable) {
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
  if (!pushNotificationsAvailable) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (!pushNotificationsAvailable) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error canceling notifications:', error);
  }
};

export const addNotificationListener = (
  handler: (notification: Notifications.Notification) => void
) => {
  if (!pushNotificationsAvailable) return { remove: () => {} };

  try {
    return Notifications.addNotificationReceivedListener(handler);
  } catch (error) {
    console.log('Error adding notification listener:', error);
    return { remove: () => {} };
  }
};

export const addNotificationResponseListener = (
  handler: (response: Notifications.NotificationResponse) => void
) => {
  if (!pushNotificationsAvailable) return { remove: () => {} };

  try {
    return Notifications.addNotificationResponseReceivedListener(handler);
  } catch (error) {
    console.log('Error adding notification response listener:', error);
    return { remove: () => {} };
  }
};
