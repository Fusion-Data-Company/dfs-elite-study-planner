import { ScrollView, Text, View, Pressable, Switch, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useThemeContext } from "@/lib/theme-provider";

export default function SettingsScreen() {
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem("appSettings");
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotifications(parsed.notifications ?? true);
        setDailyReminder(parsed.dailyReminder ?? true);
        setHapticFeedback(parsed.hapticFeedback ?? true);
      }
    } catch (error) {
      console.log("Error loading settings:", error);
    }
  };

  const saveSettings = async (key: string, value: boolean) => {
    try {
      const settings = await AsyncStorage.getItem("appSettings");
      const parsed = settings ? JSON.parse(settings) : {};
      parsed[key] = value;
      await AsyncStorage.setItem("appSettings", JSON.stringify(parsed));
    } catch (error) {
      console.log("Error saving settings:", error);
    }
  };

  const handleToggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    if (Platform.OS !== "web" && hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setter(value);
    saveSettings(key, value);
  };

  const handleThemeToggle = () => {
    if (Platform.OS !== "web" && hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  const openWebPlatform = () => {
    if (Platform.OS !== "web" && hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL("https://dfselitelearningplatform.vercel.app");
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle,
    color = colors.primary 
  }: { 
    icon: string; 
    title: string; 
    subtitle: string; 
    value: boolean; 
    onToggle: (v: boolean) => void;
    color?: string;
  }) => (
    <View className="flex-row items-center py-4 border-b border-border">
      <View 
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: color + '20' }}
      >
        <IconSymbol name={icon as any} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{title}</Text>
        <Text className="text-sm text-muted">{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : colors.muted}
      />
    </View>
  );

  const LinkRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    color = colors.primary 
  }: { 
    icon: string; 
    title: string; 
    subtitle: string; 
    onPress: () => void;
    color?: string;
  }) => (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      className="flex-row items-center py-4 border-b border-border"
    >
      <View 
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: color + '20' }}
      >
        <IconSymbol name={icon as any} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{title}</Text>
        <Text className="text-sm text-muted">{subtitle}</Text>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
    </Pressable>
  );

  return (
    <ScreenContainer className="px-4">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(400)}
          className="pt-4 pb-6"
        >
          <View className="flex-row items-center">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.primary }}
            >
              <IconSymbol name="gearshape.fill" size={24} color={colors.background} />
            </View>
            <View>
              <Text className="text-2xl font-bold text-foreground">Settings</Text>
              <Text className="text-sm text-muted">Customize your experience</Text>
            </View>
          </View>
        </Animated.View>

        {/* Appearance Section */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(400)}
          className="bg-surface rounded-2xl border border-border p-4 mb-4"
        >
          <Text className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Appearance</Text>
          
          <View className="flex-row items-center py-4 border-b border-border">
            <View 
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: (colorScheme === 'dark' ? '#8b5cf6' : '#f59e0b') + '20' }}
            >
              <IconSymbol 
                name={colorScheme === 'dark' ? 'star.fill' : 'star.fill'} 
                size={20} 
                color={colorScheme === 'dark' ? '#8b5cf6' : '#f59e0b'} 
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">Dark Mode</Text>
              <Text className="text-sm text-muted">
                {colorScheme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
              </Text>
            </View>
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: '#8b5cf6' + '80' }}
              thumbColor={colorScheme === 'dark' ? '#8b5cf6' : colors.muted}
            />
          </View>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(400)}
          className="bg-surface rounded-2xl border border-border p-4 mb-4"
        >
          <Text className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Notifications</Text>
          
          <SettingRow
            icon="bell.fill"
            title="Push Notifications"
            subtitle="Get notified about study reminders"
            value={notifications}
            onToggle={(v) => handleToggle('notifications', v, setNotifications)}
          />
          
          <SettingRow
            icon="clock.fill"
            title="Daily Reminder"
            subtitle="Remind me to study every day"
            value={dailyReminder}
            onToggle={(v) => handleToggle('dailyReminder', v, setDailyReminder)}
            color={colors.accent}
          />
        </Animated.View>

        {/* Feedback Section */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(400)}
          className="bg-surface rounded-2xl border border-border p-4 mb-4"
        >
          <Text className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Feedback</Text>
          
          <SettingRow
            icon="star.fill"
            title="Haptic Feedback"
            subtitle="Vibration on button presses"
            value={hapticFeedback}
            onToggle={(v) => handleToggle('hapticFeedback', v, setHapticFeedback)}
            color={colors.secondary}
          />
        </Animated.View>

        {/* Links Section */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(400)}
          className="bg-surface rounded-2xl border border-border p-4 mb-4"
        >
          <Text className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Resources</Text>
          
          <LinkRow
            icon="graduationcap.fill"
            title="Open Web Platform"
            subtitle="Access full DFS Elite features"
            onPress={openWebPlatform}
          />
        </Animated.View>

        {/* App Info */}
        <Animated.View 
          entering={FadeInUp.delay(500).duration(400)}
          className="items-center mt-4"
        >
          <Text className="text-sm text-muted">DFS Elite Study Planner</Text>
          <Text className="text-xs text-muted mt-1">Version 1.0.0</Text>
          <Text className="text-xs text-muted mt-2">Companion app for DFS Elite Learning Platform</Text>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
