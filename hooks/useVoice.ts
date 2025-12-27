/**
 * Hook for voice functionality
 */

import { useState, useEffect } from "react";
import { voiceService, AGENT_VOICES } from "@/lib/voice-service";

export function useVoice() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await voiceService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing voice service:", error);
      }
    };

    init();

    return () => {
      voiceService.cleanup();
    };
  }, []);

  const speak = async (
    text: string,
    voiceId: string = AGENT_VOICES.STUDY_BUDDY
  ) => {
    try {
      setIsPlaying(true);
      await voiceService.textToSpeech(text, voiceId, () => {
        setIsPlaying(false);
      });
    } catch (error) {
      console.error("Error speaking:", error);
      setIsPlaying(false);
      throw error;
    }
  };

  const stop = async () => {
    try {
      await voiceService.stopPlayback();
      setIsPlaying(false);
    } catch (error) {
      console.error("Error stopping:", error);
    }
  };

  const pause = async () => {
    try {
      await voiceService.pausePlayback();
      setIsPlaying(false);
    } catch (error) {
      console.error("Error pausing:", error);
    }
  };

  const resume = async () => {
    try {
      await voiceService.resumePlayback();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error resuming:", error);
    }
  };

  const clearCache = async () => {
    try {
      await voiceService.clearCache();
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  return {
    isInitialized,
    isPlaying,
    speak,
    stop,
    pause,
    resume,
    clearCache,
    AGENT_VOICES,
  };
}
