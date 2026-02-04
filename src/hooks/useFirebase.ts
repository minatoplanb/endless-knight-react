// Hook for Firebase initialization and state management
import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { firebaseService } from '../services/firebase';
import { SaveData } from '../types';

interface UseFirebaseReturn {
  user: User | null;
  isInitialized: boolean;
  isSignedIn: boolean;
  isReady: boolean;
  saveToCloud: (data: SaveData) => Promise<boolean>;
  loadFromCloud: () => Promise<SaveData | null>;
  getCloudSaveInfo: () => Promise<{ exists: boolean; updatedAt?: Date } | null>;
  trackEvent: (type: string, data?: Record<string, any>) => Promise<void>;
}

export function useFirebase(): UseFirebaseReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initFirebase = async () => {
      try {
        const firebaseUser = await firebaseService.initialize();
        if (mounted) {
          setUser(firebaseUser);
          setIsInitialized(true);
          setIsReady(firebaseService.isReady());
        }
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        if (mounted) {
          setIsInitialized(true);
          setIsReady(false);
        }
      }
    };

    initFirebase();

    return () => {
      mounted = false;
    };
  }, []);

  const saveToCloud = useCallback(async (data: SaveData): Promise<boolean> => {
    return firebaseService.saveToCloud(data);
  }, []);

  const loadFromCloud = useCallback(async (): Promise<SaveData | null> => {
    return firebaseService.loadFromCloud();
  }, []);

  const getCloudSaveInfo = useCallback(async () => {
    return firebaseService.getCloudSaveInfo();
  }, []);

  const trackEvent = useCallback(async (type: string, data?: Record<string, any>) => {
    await firebaseService.logEvent(type, data);
  }, []);

  return {
    user,
    isInitialized,
    isSignedIn: user !== null,
    isReady,
    saveToCloud,
    loadFromCloud,
    getCloudSaveInfo,
    trackEvent,
  };
}
