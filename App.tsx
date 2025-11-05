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

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function SignInScreen({ navigation }: any) {
  const [userInfo, setUserInfo] = useState<any>(null);

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
    const storedUser = await AsyncStorage.getItem('@user');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
      navigation.replace('Home');
    }
  };

  const getUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      setUserInfo(user);
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      navigation.replace('Home');
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('@user');
    setUserInfo(null);
  };

  return (
    <View style={styles.container}>
      <Text>{userInfo ? `Hello, ${userInfo.name}` : 'Not signed in'}</Text>
      <Button title="Sign in with Google" onPress={() => promptAsync()} />
      <Button title="Sign out" onPress={handleSignOut} />
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
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
