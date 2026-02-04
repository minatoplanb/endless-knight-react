// Hook for Google Sign-In using expo-auth-session
import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { firebaseService } from '../services/firebase';
import { User } from 'firebase/auth';

// Google OAuth Client IDs from Google Cloud Console
const GOOGLE_CLIENT_IDS = {
  // Web client - for browser-based OAuth
  web: '1038383583773-8a6ocsqvc6mshp1aut93pknert3u3010.apps.googleusercontent.com',
  // Android client - for native Android OAuth (uses package name + SHA-1)
  android: '1038383583773-61idf6cqhisi94irvht0i9tq4bpdccis.apps.googleusercontent.com',
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
  const [isReady, setIsReady] = useState(false);
  const [promptAsync, setPromptAsync] = useState<(() => Promise<any>) | null>(null);

  // Store response for handling
  const responseRef = useRef<any>(null);

  // Load Google Auth modules and create auth request
  useEffect(() => {
    if (!isGoogleSignInAvailable) {
      setIsReady(true);
      return;
    }

    let mounted = true;

    const initGoogleAuth = async () => {
      try {
        const Google = await import('expo-auth-session/providers/google');
        const WebBrowser = await import('expo-web-browser');

        WebBrowser.maybeCompleteAuthSession();

        if (mounted) {
          // Create a function that will initiate the auth request
          const doPrompt = async () => {
            // Use Google.useIdTokenAuthRequest for ID token flow
            const config = {
              webClientId: GOOGLE_CLIENT_IDS.web,
              androidClientId: GOOGLE_CLIENT_IDS.android,
            };

            // For standalone apps, we need to use AuthRequest directly
            const { AuthRequest } = await import('expo-auth-session');

            const discovery = {
              authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
              tokenEndpoint: 'https://oauth2.googleapis.com/token',
              revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
            };

            const clientId = Platform.OS === 'android'
              ? GOOGLE_CLIENT_IDS.android
              : GOOGLE_CLIENT_IDS.web;

            const { makeRedirectUri } = await import('expo-auth-session');
            const redirectUri = makeRedirectUri({
              scheme: 'com.endlessknight.game',
            });

            console.log('Google Auth - Client ID:', clientId);
            console.log('Google Auth - Redirect URI:', redirectUri);

            const request = new AuthRequest({
              clientId,
              scopes: ['openid', 'profile', 'email'],
              redirectUri,
              responseType: 'id_token' as any,
              extraParams: {
                nonce: Math.random().toString(36).substring(2, 15),
              },
            });

            const result = await request.promptAsync(discovery);
            return result;
          };

          setPromptAsync(() => doPrompt);
          setIsReady(true);
        }
      } catch (err) {
        console.warn('Failed to initialize Google Auth:', err);
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    initGoogleAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setIsAnonymous(firebaseUser?.isAnonymous ?? true);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    if (!promptAsync) {
      setError('Google Auth not ready');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await promptAsync();

      console.log('Google Auth Result:', result);

      if (result?.type === 'success') {
        // Extract id_token from params or URL
        let idToken = result.params?.id_token;

        if (!idToken && result.url) {
          // Try to extract from URL fragment
          const fragment = result.url.split('#')[1];
          if (fragment) {
            const params = new URLSearchParams(fragment);
            idToken = params.get('id_token');
          }
        }

        if (idToken) {
          const firebaseUser = await firebaseService.signInWithGoogle(idToken);
          if (!firebaseUser) {
            setError('Failed to sign in with Google');
          }
        } else {
          console.log('No ID token in result:', result);
          setError('No ID token received');
        }
      } else if (result?.type === 'cancel' || result?.type === 'dismiss') {
        // User cancelled
      } else {
        console.log('Auth failed with result:', result);
        setError('Google sign in failed');
      }
    } catch (err) {
      console.error('Google sign in error:', err);
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
    isAvailable: isGoogleSignInAvailable && isReady,
  };
}
