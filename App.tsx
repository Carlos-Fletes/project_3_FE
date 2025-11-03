// App.tsx
import React from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Login from './screens/Login';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

type User = {
  name: string;
  email?: string;
  picture?: string;
  [key: string]: any;
};

export default function App() {
  const [userInfo, setUserInfo] = React.useState<User | null>(null);

  // Google auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '127612041741-30t2l6pgdt18ij22gvvr03r1kf4org0h.apps.googleusercontent.com', // Web / Expo Go
    androidClientId: '127612041741-3j8btuc7ol6immrjslqvkbrlj89o2ggf.apps.googleusercontent.com', // Dev build / standalone
  });

  async function getUserInfo(token: string) {
    if (!token) return;
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      setUserInfo(user);
      await AsyncStorage.setItem('@user', JSON.stringify(user));
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }

  async function handleSignInWithGoogle() {
    const storedUser = await AsyncStorage.getItem('@user');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    } else if (response?.type === 'success' && response.authentication?.accessToken) {
      await getUserInfo(response.authentication.accessToken);
    }
  }

  React.useEffect(() => {
    handleSignInWithGoogle();
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {userInfo ? `Hello, ${userInfo.name}` : 'Not logged in'}
      </Text>

      <Button
        title="Login with Google"
        onPress={() => promptAsync()}
        disabled={!request}
      />
      <Button
        title="Logout"
        onPress={async () => {
          await AsyncStorage.removeItem('@user');
          setUserInfo(null);
        }}
        disabled={!userInfo}
      />

      <Login />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});
