// Firebase Service - using Firebase JS SDK (Expo compatible)
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  isSupported,
  Analytics,
} from 'firebase/analytics';
import { SaveData } from '../types';

// Firebase configuration - from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDPB6wje4SFkPUN2BhKbCmCrZzVUftnOV0",
  authDomain: "endless-knight.firebaseapp.com",
  projectId: "endless-knight",
  storageBucket: "endless-knight.firebasestorage.app",
  messagingSenderId: "1038383583773",
  appId: "1:1038383583773:web:f2b66a11884c6747f62cf4",
  measurementId: "G-V49L7PQ4NG"
};

// Collection name for save data
const SAVES_COLLECTION = 'saves';

class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private analytics: Analytics | null = null;
  private user: User | null = null;
  private initialized = false;

  // Check if Firebase is configured
  private isConfigured(): boolean {
    return firebaseConfig.apiKey !== "YOUR_API_KEY";
  }

  // Initialize Firebase
  async initialize(): Promise<User | null> {
    if (this.initialized) {
      return this.user;
    }

    if (!this.isConfigured()) {
      console.warn('Firebase not configured. Please update firebaseConfig in src/services/firebase.ts');
      this.initialized = true;
      return null;
    }

    try {
      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      // Initialize Analytics (only if supported)
      const analyticsSupported = await isSupported();
      if (analyticsSupported) {
        this.analytics = getAnalytics(this.app);
      }

      // Wait for auth state
      return new Promise((resolve) => {
        if (!this.auth) {
          resolve(null);
          return;
        }

        const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
          if (user) {
            this.user = user;
            this.initialized = true;
            await this.logEvent('app_open', { user_id: user.uid });
            resolve(user);
          } else {
            // Auto sign in anonymously
            try {
              const credential = await signInAnonymously(this.auth!);
              this.user = credential.user;
              this.initialized = true;
              await this.logEvent('anonymous_sign_in');
              resolve(credential.user);
            } catch (error) {
              console.error('Anonymous sign in failed:', error);
              this.initialized = true;
              resolve(null);
            }
          }
          unsubscribe();
        });
      });
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      this.initialized = true;
      return null;
    }
  }

  // Get current user
  getUser(): User | null {
    return this.user;
  }

  // Get user ID
  getUserId(): string | null {
    return this.user?.uid || null;
  }

  // Check if user is signed in
  isSignedIn(): boolean {
    return this.user !== null && this.isConfigured();
  }

  // Check if Firebase is ready
  isReady(): boolean {
    return this.initialized && this.isConfigured() && this.db !== null;
  }

  // Save game data to Firestore
  async saveToCloud(saveData: SaveData): Promise<boolean> {
    if (!this.user || !this.db) {
      console.warn('Cannot save to cloud: Firebase not ready');
      return false;
    }

    try {
      const docRef = doc(this.db, SAVES_COLLECTION, this.user.uid);
      await setDoc(docRef, {
        ...saveData,
        updatedAt: serverTimestamp(),
        platform: 'expo',
      }, { merge: true });

      await this.logEvent('cloud_save');
      return true;
    } catch (error) {
      console.error('Cloud save failed:', error);
      await this.logEvent('cloud_save_error', { error: String(error) });
      return false;
    }
  }

  // Load game data from Firestore
  async loadFromCloud(): Promise<SaveData | null> {
    if (!this.user || !this.db) {
      console.warn('Cannot load from cloud: Firebase not ready');
      return null;
    }

    try {
      const docRef = doc(this.db, SAVES_COLLECTION, this.user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        await this.logEvent('cloud_load');
        // Remove Firestore-specific fields
        const { updatedAt, platform, ...saveData } = data;
        return saveData as SaveData;
      }
      return null;
    } catch (error) {
      console.error('Cloud load failed:', error);
      await this.logEvent('cloud_load_error', { error: String(error) });
      return null;
    }
  }

  // Check if cloud save exists and get last update time
  async getCloudSaveInfo(): Promise<{ exists: boolean; updatedAt?: Date } | null> {
    if (!this.user || !this.db) return null;

    try {
      const docRef = doc(this.db, SAVES_COLLECTION, this.user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          exists: true,
          updatedAt: data?.updatedAt?.toDate?.() || undefined,
        };
      }
      return { exists: false };
    } catch (error) {
      console.error('Failed to get cloud save info:', error);
      return null;
    }
  }

  // Log analytics event
  async logEvent(eventName: string, params?: Record<string, any>): Promise<void> {
    if (!this.analytics) return;

    try {
      firebaseLogEvent(this.analytics, eventName, params);
    } catch (error) {
      // Silently fail for analytics
      console.warn('Analytics event failed:', eventName, error);
    }
  }

  // Track game events
  async trackGameEvent(event: {
    type: 'stage_complete' | 'boss_kill' | 'prestige' | 'achievement' | 'death';
    data?: Record<string, any>;
  }): Promise<void> {
    await this.logEvent(`game_${event.type}`, event.data);
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
