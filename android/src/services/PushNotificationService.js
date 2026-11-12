
import {Platform, PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

export const ORDER_CHANNEL_ID = 'orders';

// Create Android notification channel
export const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: ORDER_CHANNEL_ID,
      name: 'Order Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }
};

// Request permission and get FCM token
export const initializePushNotifications = async () => {
  try {
    await createNotificationChannel();

    let permissionGranted = true;

    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();

      permissionGranted =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!permissionGranted) {
        console.log('Notification permission denied');
        return null;
      }

      await messaging().registerDeviceForRemoteMessages();
    }

    if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      permissionGranted =
        permission === PermissionsAndroid.RESULTS.GRANTED;

      if (!permissionGranted) {
        console.log('Notification permission denied');
        return null;
      }
    }

    const token = await messaging().getToken();

    console.log('FCM DEVICE TOKEN:', token);

    return token;
  } catch (error) {
    console.log('FCM initialization error:', error);
    return null;
  }
};

// Display notification when app is in foreground
export const displayForegroundNotification = async remoteMessage => {
  try {
    const title =
      remoteMessage?.notification?.title ||
      remoteMessage?.data?.title ||
      'New Order Received';

    const body =
      remoteMessage?.notification?.body ||
      remoteMessage?.data?.body ||
      'You have received a new order.';

    await notifee.displayNotification({
      title,
      body,
      data: remoteMessage?.data || {},

      android: {
        channelId: ORDER_CHANNEL_ID,
        pressAction: {
          id: 'default',
        },
      },

      ios: {
        sound: 'default',
      },
    });
  } catch (error) {
    console.log('Notification display error:', error);
  }
};
