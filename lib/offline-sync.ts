/**
 * Offline Sync Service
 * Queues API calls when offline and syncs when back online
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { api } from "./api";

export interface QueuedAction {
  id: string;
  type: "flashcard_review" | "exam_submit" | "lesson_progress" | "agent_chat";
  endpoint: string;
  method: "POST" | "PUT" | "DELETE";
  body: any;
  timestamp: number;
  retries: number;
}

class OfflineSyncService {
  private isOnline = true;
  private syncInProgress = false;
  private listeners: Array<(isOnline: boolean) => void> = [];

  async initialize() {
    // Check initial connection status
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected || false;

    // Listen for connection changes
    NetInfo.addEventListener((state: any) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected || false;

      if (!wasOnline && this.isOnline) {
        // Went from offline to online
        this.syncQueue();
      }

      // Notify listeners
      this.listeners.forEach((listener) => listener(this.isOnline));
    });
  }

  onConnectionChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  async queueAction(action: Omit<QueuedAction, "id" | "timestamp" | "retries">) {
    try {
      const queue = await this.getQueue();
      const newAction: QueuedAction = {
        ...action,
        id: `${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retries: 0,
      };

      queue.push(newAction);
      await AsyncStorage.setItem("offline_queue", JSON.stringify(queue));

      // If online, sync immediately
      if (this.isOnline) {
        this.syncQueue();
      }

      return newAction;
    } catch (error) {
      console.error("Error queueing action:", error);
      throw error;
    }
  }

  async getQueue(): Promise<QueuedAction[]> {
    try {
      const data = await AsyncStorage.getItem("offline_queue");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading queue:", error);
      return [];
    }
  }

  async syncQueue() {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    try {
      const queue = await this.getQueue();

      for (const action of queue) {
        try {
          await this.executeAction(action);
          // Remove from queue on success
          await this.removeFromQueue(action.id);
        } catch (error) {
          console.error(`Error syncing action ${action.id}:`, error);
          // Increment retry count
          await this.incrementRetry(action.id);
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeAction(action: QueuedAction) {
    switch (action.type) {
      case "flashcard_review":
        return await api.submitFlashcardReview(
          action.body.cardId,
          action.body.grade
        );
      case "exam_submit":
        return await api.submitAnswer(
          action.body.sessionId,
          action.body.questionId,
          action.body.answer
        );
      case "lesson_progress":
        return await api.saveLessonProgress(
          action.body.lessonId,
          action.body.data
        );
      case "agent_chat":
        return await api.chatWithAgent(
          action.body.agentId,
          action.body.message,
          action.body.viewId
        );
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async removeFromQueue(actionId: string) {
    try {
      const queue = await this.getQueue();
      const filtered = queue.filter((a) => a.id !== actionId);
      await AsyncStorage.setItem("offline_queue", JSON.stringify(filtered));
    } catch (error) {
      console.error("Error removing from queue:", error);
    }
  }

  private async incrementRetry(actionId: string) {
    try {
      const queue = await this.getQueue();
      const action = queue.find((a) => a.id === actionId);
      if (action) {
        action.retries++;
        // Remove if too many retries
        if (action.retries > 5) {
          await this.removeFromQueue(actionId);
        } else {
          await AsyncStorage.setItem("offline_queue", JSON.stringify(queue));
        }
      }
    } catch (error) {
      console.error("Error incrementing retry:", error);
    }
  }

  async clearQueue() {
    try {
      await AsyncStorage.removeItem("offline_queue");
    } catch (error) {
      console.error("Error clearing queue:", error);
    }
  }

  getConnectionStatus() {
    return this.isOnline;
  }
}

export const offlineSync = new OfflineSyncService();
