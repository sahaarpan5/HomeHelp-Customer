/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

// Handle background FCM messages
const messagingInstance = getMessaging();

// Handle background FCM messages
setBackgroundMessageHandler(
  messagingInstance,
  async remoteMessage => {
    console.log('Background FCM message:', remoteMessage);
  },
);

AppRegistry.registerComponent(appName, () => App);
