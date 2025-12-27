/**
 * Notifications Settings Screen
 */

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Switch, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { notificationService } from "@/lib/notifications";
import { useColors } from "@/hooks/use-colors";

export default function NotificationsScreen() {
  const colors = useColors();
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState({ hour: 9, minute: 0 });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const reminder = await notificationService.getReminder();
    if (reminder) {
      setRemindersEnabled(reminder.enabled);
      if (reminder.hour !== undefined) {
        setReminderTime({ hour: reminder.hour, minute: reminder.minute });
      }
    }
  };

  const handleToggleReminders = async (enabled: boolean) => {
    setRemindersEnabled(enabled);
    if (enabled) {
      await notificationService.scheduleStudyReminder(reminderTime.hour, reminderTime.minute);
    } else {
      await notificationService.disableReminders();
    }
  };

  const handleTimeChange = async (hour: number, minute: number) => {
    setReminderTime({ hour, minute });
    if (remindersEnabled) {
      await notificationService.scheduleStudyReminder(hour, minute);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <Text className="text-3xl font-bold text-foreground mb-6">
          Notifications
        </Text>

        {/* Daily Study Reminder */}
        <View
          className="bg-surface rounded-xl p-4 mb-6 border border-border"
          style={{ borderColor: colors.border }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">
                Daily Study Reminder
              </Text>
              <Text className="text-sm text-muted mt-1">
                Get reminded to study every day
              </Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={handleToggleReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={remindersEnabled ? colors.primary : colors.muted}
            />
          </View>

          {remindersEnabled && (
            <View className="gap-3 pt-4 border-t" style={{ borderTopColor: colors.border }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Reminder time</Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() =>
                      handleTimeChange(
                        reminderTime.hour === 0 ? 23 : reminderTime.hour - 1,
                        reminderTime.minute
                      )
                    }
                    className="px-3 py-2 bg-primary rounded-lg"
                  >
                    <Text className="text-white font-semibold">−</Text>
                  </Pressable>
                  <View className="px-4 py-2 bg-background rounded-lg items-center justify-center min-w-16">
                    <Text className="text-foreground font-semibold">
                      {String(reminderTime.hour).padStart(2, "0")}:
                      {String(reminderTime.minute).padStart(2, "0")}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      handleTimeChange(
                        reminderTime.hour === 23 ? 0 : reminderTime.hour + 1,
                        reminderTime.minute
                      )
                    }
                    className="px-3 py-2 bg-primary rounded-lg"
                  >
                    <Text className="text-white font-semibold">+</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Notification Types */}
        <Text className="text-lg font-semibold text-foreground mb-3">
          Notification Types
        </Text>

        {[
          { title: "Study Reminders", desc: "Daily study session reminders" },
          { title: "Achievements", desc: "Celebrate your milestones" },
          { title: "Quiz Results", desc: "Get notified of quiz completion" },
          { title: "Streak Updates", desc: "Keep your streak going" },
        ].map((item, idx) => (
          <View
            key={idx}
            className="bg-surface rounded-lg p-4 mb-3 flex-row items-center justify-between border border-border"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {item.title}
              </Text>
              <Text className="text-sm text-muted mt-1">{item.desc}</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.primary}
            />
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
