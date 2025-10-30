import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, Button } from 'react-native';
import * as Linking from 'expo-linking';
import Home from './Home'; // <- import Home component

export default function App() {
  const [isHome, setIsHome] = useState(false);

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      if (url.startsWith('myapp://home')) {
        setIsHome(true);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith('myapp://home')) {
        setIsHome(true);
      }
    });

    return () => subscription.remove();
  }, []);

  const handleLogin = () => {
    Linking.openURL('https://project-3-backend.herokuapp.com/oauth2/authorization/google');
  };

  if (isHome) {
    return <Home />; // <- render Home component
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World! 👋</Text>
      <Text style={styles.subtitle}>React Native Expo + TypeScript</Text>
      <Text style={styles.platform}>
        Running on: {Platform.OS === 'web' ? 'Web Browser' : Platform.OS}
      </Text>
      <Text style={styles.instruction}>Ready for your assignment! 🚀</Text>
      <View style={styles.buttonContainer}>
        <Button title="Login with Google" onPress={handleLogin} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

// Keep styles for App screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  platform: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 15,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 16,
    color: '#28a745',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
    width: '60%',
  },
});
