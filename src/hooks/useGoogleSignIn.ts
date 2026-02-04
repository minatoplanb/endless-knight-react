// Hook for Google Sign-In using expo-auth-session
// Uses useIdTokenAuthRequest for Firebase authentication
import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { firebaseService } from '../services/firebase';
import { User } from 'firebase/auth';

// Complete auth session for web
if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

// Google OAuth Client IDs from Google Cloud Console
const GOOGLE_CLIENT_IDS = {
  // Web client - used for both web and Android (Firebase requires web client for ID token)
  webClientId: '1038383583773-8a6ocsqvc6mshp1aut93pknert3u3010.apps.googleusercontent.com',
  // Android client - for native app verification
  androidClientId: '1038383583773-61idf6cqhisi94irvht0i9tq4bpdccis.apps.googleusercontent.com',
};

// Google Sign-In is available on web and Android
export const isGoogleSignInAvailable = Platform.OS === 'web' || Platform.OS === 'android';

interface UseGoogleSignInReturn {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isAnonymous: boolean;
  isAvailable: boolean;
}

export function useGoogleSignIn(): UseGoogleSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Use the Google.useIdTokenAuthRequest hook - designed for Firebase ID token auth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_IDS.webClientId,
    androidClientId: GOOGLE_CLIENT_IDS.androidClientId,
  });

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setIsAnonymous(firebaseUser?.isAnonymous ?? true);
    });
    return unsubscribe;
  }, []);

  // Handle Google auth response
  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success') {
        setIsLoading(true);
        setError(null);

        try {
          const { id_token } = response.params;
          console.log('Got ID token:', id_token ? 'yes' : 'no');

          if (id_token) {
            const firebaseUser = await firebaseService.signInWithGoogle(id_token);
            if (!firebaseUser) {
              setError('Failed to sign in with Google');
            }
          } else {
            setError('No ID token received');
          }
        } catch (err) {
          console.error('Firebase sign in error:', err);
          setError(String(err));
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === 'error') {
        console.error('Google auth error:', response.error);
        setError(response.error?.message || 'Google sign in failed');
      }
    };

    if (response) {
      handleResponse();
    }
  }, [response]);

  const signIn = useCallback(async () => {
    if (!request) {
      setError('Google Auth not ready');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await promptAsync();
      console.log('Prompt result type:', result?.type);
      // Response will be handled by the useEffect above
      if (result?.type === 'cancel' || result?.type === 'dismiss') {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Google sign in prompt error:', err);
      setError(String(err));
      setIsLoading(false);
    }
  }, [request, promptAsync]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await firebaseService.signOut();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    signIn,
    signOut,
    isLoading,
    error,
    user,
    isAnonymous,
    isAvailable: isGoogleSignInAvailable && !!request,
  };
}
