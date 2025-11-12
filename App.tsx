import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/home';
import Profile from './screens/profile';
import { UserProvider, useUser } from './contexts/UserContext';

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function SignInScreen({ navigation }: any) {
  const { user, login, logout, isLoading } = useUser();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      '127612041741-3j8btuc7ol6immrjslqvkbrlj89o2ggf.apps.googleusercontent.com',
    iosClientId:
      '127612041741-4ijq4rq0bejfsnvn183frhdf9g7rs4ue.apps.googleusercontent.com',
    webClientId:
      '127612041741-30t2l6pgdt18ij22gvvr03r1kf4org0h.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      scheme: 'com.cfletes.project3fe',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success' && response.params?.access_token) {
      getUserInfo(response.params.access_token);
    } else {
      checkStoredUser();
    }
  }, [response]);

  const checkStoredUser = async () => {
    if (user) {
      navigation.replace('Home');
    }
  };

  const getUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const googleUser = await res.json();
      
      // Use our context to handle login (which will create/find user in API)
      await login(googleUser);
      navigation.replace('Home');
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    await logout();
  };

  // If user is already logged in, navigate to home
  useEffect(() => {
    if (user && !isLoading) {
      navigation.replace('Home');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>{user ? `Hello, ${user.name}` : 'Not signed in'}</Text>
      <Button title="Sign in with Google" onPress={() => promptAsync()} />
      {user && <Button title="Sign out" onPress={handleSignOut} />}
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignIn">
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
