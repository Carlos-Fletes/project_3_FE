import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, Alert, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 'http://localhost:8080';
const REDIRECT_SCHEME = 'project3fe'; // your custom scheme

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Construct redirect URI
  const redirectUri = `${REDIRECT_SCHEME}://auth`;

  // Handle incoming deep links
  const handleDeepLink = async (event: { url: string }) => {
    const url = event.url;
    const tokenParam = url.split('token=')[1];
    if (tokenParam) {
      await SecureStore.setItemAsync('jwt', tokenParam);
      setToken(tokenParam);
      setIsLoggedIn(true);
      Alert.alert('Login Successful', 'Welcome!');
    } else {
      Alert.alert('Login Error', 'No token found in redirect URL');
    }
  };

  useEffect(() => {
    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle cold start deep links
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  const handleLogin = async () => {
    const authUrl = `${BACKEND_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

    try {
      await Linking.openURL(authUrl);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Login Error', msg);
    }
  };

  if (isLoggedIn && token) {
    // Render home page after login
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to the Home Page!</Text>
        <Text>Your JWT: {token}</Text>
      </View>
    );
  }

  // Render login button
  return (
    <View style={styles.container}>
      <Button title="Login with Google" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
