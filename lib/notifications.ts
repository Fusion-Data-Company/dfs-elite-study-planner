/**
 * Notification Service for DFS Elite Study Planner
 * Handles push notifications and daily reminders
 */

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Request permissions
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("Notification permissions not granted");
        }
      }

      // Get push token
      const token = await this.getPushToken();
      if (token) {
        await AsyncStorage.setItem("push_token", token);
      }

      this.initialized = true;
    } catch (error) {
      console.error("Notification initialization error:", error);
    }
  }

  private async getPushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  async scheduleStudyReminder(hour: number = 9, minute: number = 0) {
    try {
      // Cancel existing reminder
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule daily reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Study! 📚",
          body: "Your daily flashcards are waiting. Keep your streak alive!",
          data: { type: "study_reminder" },
          sound: "default",
          badge: 1,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        },
      });

      // Save preference
      await AsyncStorage.setItem(
        "study_reminder",
        JSON.stringify({ hour, minute, enabled: true })
      );
    } catch (error) {
      console.error("Error scheduling reminder:", error);
    }
  }

  async scheduleAchievementNotification(title: string, body: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: "achievement" },
          sound: "default",
          badge: 1,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
      });
    } catch (error) {
      console.error("Error scheduling achievement notification:", error);
    }
  }

  async disableReminders() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem(
        "study_reminder",
        JSON.stringify({ enabled: false })
      );
    } catch (error) {
      console.error("Error disabling reminders:", error);
    }
  }

  async getReminder() {
    try {
      const reminder = await AsyncStorage.getItem("study_reminder");
      return reminder ? JSON.parse(reminder) : null;
    } catch (error) {
      console.error("Error getting reminder:", error);
      return null;
    }
  }

  // Listen for notification responses
  onNotificationResponse(callback: (notification: Notifications.Notification) => void) {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        callback(response.notification);
      }
    );

    return () => subscription.remove();
  }

  // Listen for notifications while app is in foreground
  onNotificationReceived(callback: (notification: Notifications.Notification) => void) {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        callback(notification);
      }
    );

    return () => subscription.remove();
  }
}

export const notificationService = new NotificationService();
