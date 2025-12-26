import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Image } from "expo-image";

export default function SignInScreen() {
  const colors = useColors();
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!isLoaded) return;

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign in failed. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo and Title */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(600)}
              className="items-center mb-10"
            >
              <View className="w-20 h-20 rounded-2xl bg-primary/20 items-center justify-center mb-4">
                <Text className="text-4xl">🎓</Text>
              </View>
              <Text
                className="text-3xl font-bold text-foreground text-center"
                style={{ fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" }}
              >
                DFS Elite
              </Text>
              <Text className="text-base text-muted text-center mt-1">
                Learning Platform
              </Text>
            </Animated.View>

            {/* Sign In Form */}
            <Animated.View
              entering={FadeInUp.delay(200).duration(600)}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              <Text className="text-xl font-semibold text-foreground mb-6 text-center">
                Welcome Back
              </Text>

              {error ? (
                <View className="bg-error/10 border border-error/30 rounded-lg p-3 mb-4">
                  <Text className="text-error text-sm text-center">{error}</Text>
                </View>
              ) : null}

              <View className="mb-4">
                <Text className="text-sm font-medium text-muted mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  style={{ color: colors.foreground }}
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-medium text-muted mb-2">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  style={{ color: colors.foreground }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSignIn}
                disabled={isLoading}
                className="bg-primary rounded-xl py-4 items-center"
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View
              entering={FadeInUp.delay(300).duration(600)}
              className="flex-row justify-center mt-6"
            >
              <Text className="text-muted">Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
