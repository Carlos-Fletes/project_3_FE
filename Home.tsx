import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.homeTitle}>🏠 Welcome Home!</Text>
      <Text style={styles.homeSubtitle}>You are now logged in via Google OAuth.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  homeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  homeSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
