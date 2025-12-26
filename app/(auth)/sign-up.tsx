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
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function SignUpScreen() {
  const colors = useColors();
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const handleSignUp = async () => {
    if (!isLoaded) return;

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign up failed. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Verification failed. Please try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
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
              <Animated.View
                entering={FadeInDown.delay(100).duration(600)}
                className="items-center mb-10"
              >
                <View className="w-20 h-20 rounded-2xl bg-primary/20 items-center justify-center mb-4">
                  <Text className="text-4xl">✉️</Text>
                </View>
                <Text className="text-2xl font-bold text-foreground text-center">
                  Verify Your Email
                </Text>
                <Text className="text-base text-muted text-center mt-2">
                  We sent a verification code to {email}
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="bg-surface rounded-2xl p-6 border border-border"
              >
                {error ? (
                  <View className="bg-error/10 border border-error/30 rounded-lg p-3 mb-4">
                    <Text className="text-error text-sm text-center">{error}</Text>
                  </View>
                ) : null}

                <View className="mb-6">
                  <Text className="text-sm font-medium text-muted mb-2">
                    Verification Code
                  </Text>
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    maxLength={6}
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground text-center text-xl tracking-widest"
                    style={{ color: colors.foreground }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleVerify}
                  disabled={isLoading}
                  className="bg-primary rounded-xl py-4 items-center"
                  style={{ opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Verify Email
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>
    );
  }

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
              className="items-center mb-8"
            >
              <View className="w-20 h-20 rounded-2xl bg-primary/20 items-center justify-center mb-4">
                <Text className="text-4xl">🎓</Text>
              </View>
              <Text
                className="text-3xl font-bold text-foreground text-center"
                style={{ fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" }}
              >
                Join DFS Elite
              </Text>
              <Text className="text-base text-muted text-center mt-1">
                Start your learning journey
              </Text>
            </Animated.View>

            {/* Sign Up Form */}
            <Animated.View
              entering={FadeInUp.delay(200).duration(600)}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              {error ? (
                <View className="bg-error/10 border border-error/30 rounded-lg p-3 mb-4">
                  <Text className="text-error text-sm text-center">{error}</Text>
                </View>
              ) : null}

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-muted mb-2">
                    First Name
                  </Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="words"
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                    style={{ color: colors.foreground }}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-muted mb-2">
                    Last Name
                  </Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="words"
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                    style={{ color: colors.foreground }}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-muted mb-2">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="john@example.com"
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
                  placeholder="Create a password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  style={{ color: colors.foreground }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading}
                className="bg-primary rounded-xl py-4 items-center"
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Sign In Link */}
            <Animated.View
              entering={FadeInUp.delay(300).duration(600)}
              className="flex-row justify-center mt-6"
            >
              <Text className="text-muted">Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
