// Hook for Google Sign-In - Web only
// On Android/iOS, Google Sign-In is disabled (requires native configuration)
import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { firebaseService } from '../services/firebase';
import { User } from 'firebase/auth';

// Google Sign-In is only available on web for now
// Android requires SHA-1 fingerprint and androidClientId configuration
export const isGoogleSignInAvailable = Platform.OS === 'web';

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

  // Store auth modules in ref (only loaded on web)
  const authModules = useRef<{
    Google: typeof import('expo-auth-session/providers/google') | null;
    WebBrowser: typeof import('expo-web-browser') | null;
  }>({ Google: null, WebBrowser: null });

  // Load Google Auth modules only on web
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // On non-web platforms, mark as ready but with no Google auth
      setIsReady(true);
      return;
    }

    let mounted = true;

    const loadModules = async () => {
      try {
        const [Google, WebBrowser] = await Promise.all([
          import('expo-auth-session/providers/google'),
          import('expo-web-browser'),
        ]);

        if (mounted) {
          authModules.current = { Google, WebBrowser };
          WebBrowser.maybeCompleteAuthSession();
          setIsReady(true);
        }
      } catch (err) {
        console.warn('Failed to load Google Auth modules:', err);
        if (mounted) {
          setIsReady(true); // Still mark ready, but Google auth won't work
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
    // Check platform
    if (Platform.OS !== 'web') {
      setError('Google Sign-In is only available on web version');
      return;
    }

    const { Google, WebBrowser } = authModules.current;
    if (!Google || !WebBrowser) {
      setError('Google Auth not loaded');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const webClientId = '1038383583773-8a6ocsqvc6mshp1aut93pknert3u3010.apps.googleusercontent.com';
      // On web, use window.location.origin as redirect URI
      const redirectUri = typeof window !== 'undefined' ? window.location.origin : 'https://endlessknight.pages.dev';

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${webClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token%20id_token` +
        `&scope=openid%20profile%20email` +
        `&nonce=${Math.random().toString(36).substring(2, 15)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        // Extract id_token from URL fragment
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
        // User cancelled, no error
      } else {
        setError('Google sign in failed');
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
