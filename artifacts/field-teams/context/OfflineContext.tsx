import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OfflineQueueItem } from '@/types';

interface OfflineContextType {
  isOnline: boolean;
  pendingCount: number;
  queue: OfflineQueueItem[];
  addToQueue: (item: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'retries'>) => Promise<void>;
  clearAll: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);
const QUEUE_KEY = '@field_teams/offline_queue';

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  // For now, always "online" — wire up NetInfo when connecting to real API
  const [isOnline] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(QUEUE_KEY);
        if (stored) setQueue(JSON.parse(stored) as OfflineQueueItem[]);
      } catch {
        // ignore
      }
    })();
  }, []);

  const addToQueue = async (
    item: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'retries'>,
  ) => {
    const newItem: OfflineQueueItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      retries: 0,
    };
    const updated = [...queue, newItem];
    setQueue(updated);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  };

  const clearAll = async () => {
    setQueue([]);
    await AsyncStorage.removeItem(QUEUE_KEY);
  };

  return (
    <OfflineContext.Provider
      value={{ isOnline, pendingCount: queue.length, queue, addToQueue, clearAll }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}
