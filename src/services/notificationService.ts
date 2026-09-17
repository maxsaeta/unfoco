import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

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

  const token = await Notifications.getExpoPushTokenAsync();
  console.log('Expo Push Token:', token.data);

  // Save token to Firestore
  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, { pushToken: token.data }, { merge: true });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('timer', {
      name: 'Timer Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#e94560',
    });
  }

  return token.data;
};

export const scheduleTimerNotification = async (
  seconds: number,
  title: string,
  body: string
): Promise<string> => {
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
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const addNotificationListener = (
  handler: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(handler);
};

export const addNotificationResponseListener = (
  handler: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};
