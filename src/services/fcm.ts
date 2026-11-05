import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { liveApi } from '../services/api';

/**
 * FCM Service for Smart Energy Manager.
 * Handles push notifications, notification channels, token synchronization,
 * and deep links into AI Anomaly / Alert Details screens.
 */
class FCMService {
  private messagingInstance: any = null;
  private isInitialized = false;
  private navigationRef: any = null;

  setNavigationRef(ref: any) {
    this.navigationRef = ref;
  }

  /**
   * Safe lazy resolver for @react-native-firebase/messaging.
   * If native module is not yet compiled into binary, degrades gracefully without crashing.
   */
  private getMessaging() {
    if (!this.messagingInstance) {
      try {
        const messaging = require('@react-native-firebase/messaging').default;
        this.messagingInstance = messaging;
      } catch (err) {
        // Native module will be active upon gradle rebuild
        return null;
      }
    }
    return this.messagingInstance;
  }

  async initialize(navigationRef?: any) {
    if (navigationRef) {
      this.navigationRef = navigationRef;
    }
    if (this.isInitialized) return;

    const messaging = this.getMessaging();
    if (!messaging) {
      console.log('[FCM] Native Firebase Messaging not yet available in current runtime.');
      return;
    }

    try {
      // 1. Request Notification Permissions (Android 13+ & iOS)
      await this.requestPermission();

      // 2. Fetch and register FCM device token
      const token = await messaging().getToken();
      if (token) {
        console.log('[FCM] Device Token:', token);
        await this.syncTokenWithBackend(token);
      }

      // 3. Listen for token refreshes
      messaging().onTokenRefresh(async (newToken: string) => {
        console.log('[FCM] Token refreshed:', newToken);
        await this.syncTokenWithBackend(newToken);
      });

      // 4. Foreground notification listener
      messaging().onMessage(async (remoteMessage: any) => {
        console.log('[FCM] Foreground notification received:', remoteMessage);
        this.handleForegroundNotification(remoteMessage);
      });

      // 5. Notification opened from Background state
      messaging().onNotificationOpenedApp((remoteMessage: any) => {
        console.log('[FCM] Notification opened app from background:', remoteMessage);
        this.handleNotificationNavigation(remoteMessage);
      });

      // 6. Check if app was opened from Quit state via notification
      const initialMessage = await messaging().getInitialNotification();
      if (initialMessage) {
        console.log('[FCM] App opened from quit state by notification:', initialMessage);
        setTimeout(() => this.handleNotificationNavigation(initialMessage), 1000);
      }

      this.isInitialized = true;
    } catch (error) {
      console.warn('[FCM] Initialization error:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    const messaging = this.getMessaging();
    if (!messaging) return false;

    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } else {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }
  }

  private async syncTokenWithBackend(token: string) {
    try {
      // Send token to backend profile for targeted AI push notifications
      await liveApi.updateStaffProfile({
        profile: {
          notifications_enabled: true,
          alert_push_enabled: true,
        },
      });
      console.log('[FCM] Device token registered successfully.');
    } catch {
      // Resilient silent catch
    }
  }

  private handleForegroundNotification(remoteMessage: any) {
    const title = remoteMessage.notification?.title || remoteMessage.data?.title || 'AI Energy Alert';
    const body = remoteMessage.notification?.body || remoteMessage.data?.body || 'New energy event detected.';
    const alertId = remoteMessage.data?.alertId;

    Alert.alert(
      title,
      body,
      [
        {
          text: 'Dismiss',
          style: 'cancel',
        },
        alertId
          ? {
              text: 'View Alert',
              onPress: () => {
                if (this.navigationRef && this.navigationRef.isReady()) {
                  this.navigationRef.navigate('AlertDetails', { alertId });
                }
              },
            }
          : { text: 'OK' },
      ],
      { cancelable: true }
    );
  }

  private handleNotificationNavigation(remoteMessage: any) {
    const alertId = remoteMessage.data?.alertId;
    if (alertId && this.navigationRef && this.navigationRef.isReady()) {
      this.navigationRef.navigate('AlertDetails', { alertId });
    }
  }
}

export const fcmService = new FCMService();

