// Hook for Google Sign-In - Web and Android supported
import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { firebaseService } from '../services/firebase';
import { User } from 'firebase/auth';

// Google OAuth Client IDs
const GOOGLE_CLIENT_IDS = {
  web: '1038383583773-8a6ocsqvc6mshp1aut93pknert3u3010.apps.googleusercontent.com',
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

  // Store auth modules in ref
  const authModules = useRef<{
    Google: typeof import('expo-auth-session/providers/google') | null;
    WebBrowser: typeof import('expo-web-browser') | null;
    AuthSession: typeof import('expo-auth-session') | null;
  }>({ Google: null, WebBrowser: null, AuthSession: null });

  // Load Google Auth modules
  useEffect(() => {
    if (!isGoogleSignInAvailable) {
      setIsReady(true);
      return;
    }

    let mounted = true;

    const loadModules = async () => {
      try {
        const [Google, WebBrowser, AuthSession] = await Promise.all([
          import('expo-auth-session/providers/google'),
          import('expo-web-browser'),
          import('expo-auth-session'),
        ]);

        if (mounted) {
          authModules.current = { Google, WebBrowser, AuthSession };
          WebBrowser.maybeCompleteAuthSession();
          setIsReady(true);
        }
      } catch (err) {
        console.warn('Failed to load Google Auth modules:', err);
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    loadModules();

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
    if (!isGoogleSignInAvailable) {
      setError('Google Sign-In is not available on this platform');
      return;
    }

    const { Google, WebBrowser, AuthSession } = authModules.current;
    if (!Google || !WebBrowser || !AuthSession) {
      setError('Google Auth not loaded');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (Platform.OS === 'android') {
        // Android: Use expo-auth-session with Android client ID
        const redirectUri = AuthSession.makeRedirectUri({
          scheme: 'endless-knight',
        });

        const authUrl =
          `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${GOOGLE_CLIENT_IDS.android}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=id_token` +
          `&scope=openid%20profile%20email` +
          `&nonce=${Math.random().toString(36).substring(2, 15)}`;

        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

        if (result.type === 'success' && result.url) {
          // Extract id_token from URL fragment or query
          let idToken: string | null = null;

          // Try fragment first (implicit flow)
          const fragment = result.url.split('#')[1];
          if (fragment) {
            const params = new URLSearchParams(fragment);
            idToken = params.get('id_token');
          }

          // Try query params if no fragment
          if (!idToken) {
            const query = result.url.split('?')[1]?.split('#')[0];
            if (query) {
              const params = new URLSearchParams(query);
              idToken = params.get('id_token');
            }
          }

          if (idToken) {
            const firebaseUser = await firebaseService.signInWithGoogle(idToken);
            if (!firebaseUser) {
              setError('Failed to sign in with Google');
            }
          } else {
            setError('No ID token received');
          }
        } else if (result.type === 'cancel') {
          // User cancelled, no error
        } else {
          setError('Google sign in failed');
        }
      } else {
        // Web: Use web client ID with window.location.origin
        const redirectUri = typeof window !== 'undefined' ? window.location.origin : 'https://endlessknight.pages.dev';

        const authUrl =
          `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${GOOGLE_CLIENT_IDS.web}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=token%20id_token` +
          `&scope=openid%20profile%20email` +
          `&nonce=${Math.random().toString(36).substring(2, 15)}`;

        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

        if (result.type === 'success' && result.url) {
          const fragment = result.url.split('#')[1] || '';
          const params = new URLSearchParams(fragment);
          const idToken = params.get('id_token');

          if (idToken) {
            const firebaseUser = await firebaseService.signInWithGoogle(idToken);
            if (!firebaseUser) {
              setError('Failed to sign in with Google');
            }
          } else {
            setError('No ID token received');
          }
        } else if (result.type === 'cancel') {
          // User cancelled
        } else {
          setError('Google sign in failed');
        }
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

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
