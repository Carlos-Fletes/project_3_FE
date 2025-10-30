// Home.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface HomeProps {
  userInfo: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export default function Home({ userInfo }: HomeProps) {
  return (
    <View style={styles.container}>
      {userInfo.picture && <Image source={{ uri: userInfo.picture }} style={styles.image} />}
      <Text style={styles.text}>Welcome, {userInfo.name}</Text>
      <Text style={styles.text}>{userInfo.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 20, marginVertical: 5 },
  image: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
});
