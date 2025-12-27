/**
 * Hook for offline sync status
 */

import { useState, useEffect } from "react";
import { offlineSync } from "@/lib/offline-sync";

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Get initial status
    setIsOnline(offlineSync.getConnectionStatus());

    // Subscribe to connection changes
    const unsubscribe = offlineSync.onConnectionChange((online) => {
      setIsOnline(online);
    });

    // Get queue size
    const updateQueueSize = async () => {
      const queue = await offlineSync.getQueue();
      setQueueSize(queue.length);
    };

    updateQueueSize();

    return unsubscribe;
  }, []);

  return { isOnline, queueSize };
}
