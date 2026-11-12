
import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import {
  getMessaging,
  onMessage,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

import { NavigationContainer } from '@react-navigation/native';



import Navigation from './android/src/screen/Navigator/Navigation';

import {
  initializePushNotifications,
  displayForegroundNotification,
} from './android/src/services/PushNotificationService';


function App() {

  useEffect(() => {

    // Initialize Firebase notification permission and FCM token
    initializePushNotifications();

    // Handle notifications received while app is in foreground
    const messagingInstance = getMessaging();

    const unsubscribeMessage = onMessage(
      messagingInstance,
      async remoteMessage => {
        console.log('Foreground notification:', remoteMessage);

        await displayForegroundNotification(remoteMessage);
      },
    );

    // Handle notification click while app is in foreground
    const unsubscribeNotifee = notifee.onForegroundEvent(
      ({ type, detail }) => {

        if (type === EventType.PRESS) {
          console.log(
            'Notification pressed:',
            detail.notification,
          );

          // Add navigation logic here if required
        }

        if (type === EventType.ACTION_PRESS) {
          console.log(
            'Notification action pressed:',
            detail.pressAction,
          );
        }
      },
    );

    return () => {
      unsubscribeMessage();
      unsubscribeNotifee();
    };

  }, []);

  return (
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  );
}

export default App;
