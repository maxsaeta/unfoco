import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const isPushNotificationsAvailable = (): boolean => true;

export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Verificar permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permisos de notificación no concedidos');
      return null;
    }

    // Obtener token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '459204323613', // Project number de Firebase
    });

    console.log('Push token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error registering for notifications:', error);
    return null;
  }
};

export const scheduleTimerNotification = async (
  seconds: number,
  title: string,
  body: string
): Promise<string | null> => {
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
    console.error('Error scheduling notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

export const addNotificationListener = (handler: (notification: Notifications.Notification) => void) => {
  return Notifications.addNotificationReceivedListener(handler);
};

export const addNotificationResponseListener = (handler: (response: Notifications.NotificationResponse) => void) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};
