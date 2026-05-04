import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "./api";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSettings {
  orderUpdates: boolean;
  marketing: boolean;
  lowStock: boolean;
}

export interface PushNotification {
  id: string;
  type: "order" | "stock" | "marketing" | "system";
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

let expoPushToken: string | null = null;

/**
 * Request notification permissions and get Expo push token.
 * Call this after user logs in.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "bdesh-shop", // Expo project ID
    });

    expoPushToken = token.data;

    // Register token with backend
    try {
      await api.notifications.registerToken(
        token.data,
        Platform.OS as "ios" | "android"
      );
    } catch {
      // Non-critical — notifications still work locally
    }

    // Configure channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("orders", {
        name: "Order Updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#008060",
      });

      await Notifications.setNotificationChannelAsync("stock", {
        name: "Stock Alerts",
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: "#f59e0b",
      });

      await Notifications.setNotificationChannelAsync("marketing", {
        name: "Marketing",
        importance: Notifications.AndroidImportance.LOW,
        lightColor: "#3b82f6",
      });
    }

    return token.data;
  } catch (error) {
    console.error("Failed to register for push notifications:", error);
    return null;
  }
}

/**
 * Unregister push notifications (on logout).
 */
export async function unregisterPushNotifications(): Promise<void> {
  expoPushToken = null;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification settings from backend.
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    return await api.notifications.getSettings();
  } catch {
    return { orderUpdates: true, marketing: false, lowStock: true };
  }
}

/**
 * Update notification settings.
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  await api.notifications.updateSettings(settings);
}

/**
 * Schedule a local notification (for testing or local alerts).
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  seconds = 0
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: true,
    },
    trigger: seconds > 0 ? { seconds } : null,
  });
}

/**
 * Get the badge count and set it.
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications.
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await setBadgeCount(0);
}

// Notification listener types
type NotificationListener = Notifications.Notification;
type NotificationResponseListener = Notifications.NotificationResponse;

/**
 * Set up notification listeners.
 * Returns cleanup functions to remove listeners.
 */
export function setupNotificationListeners(handlers: {
  onNotificationReceived?: (notification: NotificationListener) => void;
  onNotificationResponse?: (response: NotificationResponseListener) => void;
}) {
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      handlers.onNotificationReceived?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      handlers.onNotificationResponse?.(response);
    }
  );

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
