/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// 🔥 [FCM] 백그라운드 메시지 핸들러 등록 (앱이 꺼져있을 때 작동)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FCM] 백그라운드 알림 수신:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
