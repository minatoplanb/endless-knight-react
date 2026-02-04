// Hook for Google Sign-In using expo-auth-session
import { useEffect, useState, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { firebaseService } from '../services/firebase';
import { User } from 'firebase/auth';

// Complete auth session for web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
// From Firebase Console > Authentication > Sign-in method > Google
const GOOGLE_CLIENT_IDS = {
  webClientId: '1038383583773-8a6ocsqvc6mshp1aut93pknert3u3010.apps.googleusercontent.com',
  androidClientId: undefined, // Not needed for now
  iosClientId: undefined, // Not needed for now
};

interface UseGoogleSignInReturn {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isAnonymous: boolean;
}

export function useGoogleSignIn(): UseGoogleSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Configure Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_IDS.webClientId,
    androidClientId: GOOGLE_CLIENT_IDS.androidClientId,
    iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
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
          if (id_token) {
            const firebaseUser = await firebaseService.signInWithGoogle(id_token);
            if (!firebaseUser) {
              setError('Failed to sign in with Google');
            }
          } else {
            setError('No ID token received');
          }
        } catch (err) {
          setError(String(err));
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === 'error') {
        setError(response.error?.message || 'Google sign in failed');
      }
    };

    handleResponse();
  }, [response]);

  const signIn = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await promptAsync();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync]);

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
  };
}
