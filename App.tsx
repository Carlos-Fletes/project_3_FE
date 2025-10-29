import React, { useEffect } from 'react';
import { Button, View, Alert, StyleSheet } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
// Load expo-secure-store at runtime if available; otherwise use a safe noop fallback.
// Using a runtime require with ts-ignore prevents TypeScript from failing when the
// expo CLI or the package isn't installed on the machine (as in your environment).
// The fallback implements the minimal API used below.
let SecureStore: {
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync?: (key: string) => Promise<void>;
} = {
  setItemAsync: async () => {},
  getItemAsync: async () => null,
};

try {
  // @ts-ignore: optional dependency — may not be installed in this environment
  const ss = require('expo-secure-store');
  if (ss) SecureStore = ss;
} catch (e) {
  // package not available; continue with fallback
  console.warn('expo-secure-store not available; using fallback SecureStore');
}
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 'http://localhost:8080';

export default function App() {
  // Construct the redirect URI for Expo deep linking
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'project3fe',
    path: 'auth',
  });

  // Handle deep links (cold start or in-app)
  const handleDeepLink = async (event: { url: string }) => {
    const url = event.url;
    const rawToken = Linking.parse(url).queryParams?.token;
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

    if (token) {
      // Save JWT securely
      await SecureStore.setItemAsync('jwt', token);
      Alert.alert('JWT Received', token);
    } else {
      Alert.alert('Login Error', 'No token found in redirect URL');
    }
  };

  useEffect(() => {
    // Listen for deep links while app is running
    const listener = Linking.addEventListener('url', handleDeepLink);

    // Handle initial URL if app was cold-started from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => listener.remove();
  }, []);

  // Trigger OAuth2 login via backend
  const handleLogin = async () => {
    const authUrl = `${BACKEND_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    console.log('Redirect URI:', redirectUri);
    console.log('Auth URL:', authUrl);

    try {
      // Open the auth URL in the system browser; the deep-link handler (handleDeepLink) will capture the redirect and token.
      await Linking.openURL(authUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Login Error', errorMessage);
    }
  };

  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Button, { title: 'Login with Google', onPress: handleLogin })
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
});
