/**
 * Paywall Component - Premium Feature Gate
 */

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "./screen-container";
import { revenueCat, PRODUCTS } from "@/lib/revenuecat";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";

interface PaywallProps {
  onClose?: () => void;
  onPurchaseSuccess?: () => void;
}

export function Paywall({ onClose, onPurchaseSuccess }: PaywallProps) {
  const colors = useColors();
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const packages = await revenueCat.getOfferings();
      setOfferings(packages);
    } catch (error) {
      console.error("Error loading offerings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: any) => {
    setPurchasing(true);
    try {
      await revenueCat.purchasePackage(pkg);
      onPurchaseSuccess?.();
    } catch (error) {
      console.error("Purchase failed:", error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      await revenueCat.restorePurchases();
      onPurchaseSuccess?.();
    } catch (error) {
      console.error("Restore failed:", error);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between p-6">
          {/* Header */}
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-3xl font-bold text-foreground">
                Unlock Premium
              </Text>
              {onClose && (
                <Pressable
                  onPress={onClose}
                  className="p-2"
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Ionicons name="close" size={24} color={colors.foreground} />
                </Pressable>
              )}
            </View>

            <Text className="text-base text-muted leading-relaxed">
              Get unlimited access to all features including advanced AI tutoring, unlimited quizzes, and offline study mode.
            </Text>
          </View>

          {/* Features */}
          <View className="gap-3 my-8">
            {[
              "Unlimited AI Tutoring Sessions",
              "Unlimited Practice Quizzes",
              "Offline Study Mode",
              "Advanced Analytics",
              "Priority Support",
            ].map((feature, idx) => (
              <View key={idx} className="flex-row items-center gap-3">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white font-bold text-sm">✓</Text>
                </View>
                <Text className="text-base text-foreground flex-1">{feature}</Text>
              </View>
            ))}
          </View>

          {/* Pricing */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View className="gap-3">
              {offerings.map((pkg, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handlePurchase(pkg)}
                  disabled={purchasing}
                  className="p-4 rounded-xl border-2 items-center"
                  style={({ pressed }) => [
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  {purchasing ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <Text className="text-lg font-bold text-foreground">
                        {pkg.product.title}
                      </Text>
                      <Text className="text-sm text-muted">
                        {pkg.product.priceString}
                      </Text>
                    </>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* Footer */}
          <View className="gap-2 mt-8">
            <Pressable
              onPress={handleRestore}
              disabled={purchasing}
              className="p-3 items-center"
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text className="text-sm text-primary font-semibold">
                Restore Purchases
              </Text>
            </Pressable>
            <Text className="text-xs text-muted text-center">
              Subscription auto-renews. Cancel anytime in Settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
