/**
 * Voice Input Component
 * Records user voice and sends to API for transcription
 */

import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface VoiceInputProps {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function VoiceInput({
  onTranscription,
  onError,
  disabled = false,
}: VoiceInputProps) {
  const colors = useColors();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Error starting recording:", error);
      onError?.("Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setIsRecording(false);
      setRecording(null);

      if (uri) {
        await processRecording(uri);
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error stopping recording:", error);
      onError?.("Failed to stop recording");
    }
  };

  const processRecording = async (uri: string) => {
    setIsProcessing(true);
    try {
      // In a real app, you would send this to your backend
      // which would use Whisper API or similar for transcription
      // For now, we'll simulate a transcription

      // Example: const response = await api.transcribeAudio(uri);
      // const transcribedText = response.text;
      // onTranscription?.(transcribedText);

      // Placeholder
      onTranscription?.("Voice input recorded. Connect to transcription API.");
    } catch (error) {
      console.error("Error processing recording:", error);
      onError?.("Failed to process recording");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="gap-3">
      {isRecording && (
        <View
          className="p-3 rounded-lg flex-row items-center justify-between"
          style={{ backgroundColor: colors.error }}
        >
          <View className="flex-row items-center gap-2 flex-1">
            <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <Text className="text-white font-semibold flex-1">
              Recording... {formatTime(recordingTime)}
            </Text>
          </View>
        </View>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={isRecording ? stopRecording : startRecording}
          disabled={disabled || isProcessing}
          className="flex-1 p-4 rounded-lg items-center justify-center flex-row gap-2"
          style={({ pressed }) => [
            {
              backgroundColor: isRecording ? colors.error : colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={20}
                color={colors.background}
              />
              <Text className="text-white font-semibold">
                {isRecording ? "Stop" : "Record"}
              </Text>
            </>
          )}
        </Pressable>

        {recording && !isRecording && (
          <Pressable
            onPress={() => {
              setRecording(null);
              setRecordingTime(0);
            }}
            className="px-4 py-4 rounded-lg items-center justify-center"
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="trash" size={20} color={colors.error} />
          </Pressable>
        )}
      </View>

      {isProcessing && (
        <Text className="text-sm text-muted text-center">
          Processing audio...
        </Text>
      )}
    </View>
  );
}
