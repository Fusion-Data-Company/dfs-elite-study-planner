/**
 * ElevenLabs Voice Service
 * Handles text-to-speech and voice synthesis
 */

import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || "";
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Voice IDs for different agents
export const AGENT_VOICES = {
  COACH_BOT: "21m00Tcm4TlvDq8ikWAM", // Professional coach voice
  STUDY_BUDDY: "EXAVITQu4vr4xnSDxMaL", // Friendly study buddy voice
  PROCTOR_BOT: "TxGEqnHWrfWFTfGW9XjX", // Formal proctor voice
};

interface CachedVoice {
  text: string;
  voiceId: string;
  uri: string;
  timestamp: number;
}

class VoiceService {
  private soundObject: Audio.Sound | null = null;
  private isPlaying = false;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  async textToSpeech(
    text: string,
    voiceId: string = AGENT_VOICES.STUDY_BUDDY,
    onPlay?: () => void
  ): Promise<void> {
    try {
      // Check cache first
      const cached = await this.getCachedVoice(text, voiceId);
      if (cached) {
        await this.playAudio(cached.uri, onPlay);
        return;
      }

      // Generate speech
      const audioUri = await this.generateSpeech(text, voiceId);

      // Cache it
      await this.cacheVoice(text, voiceId, audioUri);

      // Play it
      await this.playAudio(audioUri, onPlay);
    } catch (error) {
      console.error("Text-to-speech error:", error);
      throw error;
    }
  }

  private async generateSpeech(text: string, voiceId: string): Promise<string> {
    try {
      const response = await fetch(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(`data:audio/mpeg;base64,${base64.split(",")[1]}`);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error generating speech:", error);
      throw error;
    }
  }

  private async playAudio(uri: string, onPlay?: () => void): Promise<void> {
    try {
      // Stop previous audio
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }

      // Create new sound
      this.soundObject = new Audio.Sound();
      await this.soundObject.loadAsync({ uri });

      // Set up completion handler
      this.soundObject.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
        }
      });

      // Play
      this.isPlaying = true;
      onPlay?.();
      await this.soundObject.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
      throw error;
    }
  }

  async stopPlayback(): Promise<void> {
    try {
      if (this.soundObject && this.isPlaying) {
        await this.soundObject.stopAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error("Error stopping playback:", error);
    }
  }

  async pausePlayback(): Promise<void> {
    try {
      if (this.soundObject && this.isPlaying) {
        await this.soundObject.pauseAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error("Error pausing playback:", error);
    }
  }

  async resumePlayback(): Promise<void> {
    try {
      if (this.soundObject && !this.isPlaying) {
        await this.soundObject.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error("Error resuming playback:", error);
    }
  }

  private async getCachedVoice(
    text: string,
    voiceId: string
  ): Promise<CachedVoice | null> {
    try {
      const key = `voice_cache_${this.hashText(text)}_${voiceId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        const cached: CachedVoice = JSON.parse(data);
        // Cache for 7 days
        if (Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return cached;
        } else {
          // Expired cache
          await AsyncStorage.removeItem(key);
        }
      }

      return null;
    } catch (error) {
      console.error("Error getting cached voice:", error);
      return null;
    }
  }

  private async cacheVoice(
    text: string,
    voiceId: string,
    uri: string
  ): Promise<void> {
    try {
      const key = `voice_cache_${this.hashText(text)}_${voiceId}`;
      const cached: CachedVoice = {
        text,
        voiceId,
        uri,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.error("Error caching voice:", error);
    }
  }

  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const voiceCacheKeys = keys.filter((k) => k.startsWith("voice_cache_"));
      await AsyncStorage.multiRemove(voiceCacheKeys);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
        this.soundObject = null;
      }
    } catch (error) {
      console.error("Error cleaning up:", error);
    }
  }
}

export const voiceService = new VoiceService();
