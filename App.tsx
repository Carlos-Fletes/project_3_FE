import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Home from './Home';
import LoginScreen from './LoginScreen';

export default function App() {
  const [userInfo, setUserInfo] = useState<any | null>(null);

  const handleLoginSuccess = (info: any) => {
    setUserInfo(info);
  };

  if (userInfo) {
    return <Home userInfo={userInfo} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project 3 Frontend</Text>
      <Text style={styles.subtitle}>
        {Platform.OS === 'web' ? 'Running on Web' : `Running on ${Platform.OS}`}
      </Text>

      <LoginScreen onLoginSuccess={handleLoginSuccess} />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 20 },
});
