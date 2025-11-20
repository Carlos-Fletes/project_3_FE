import React, { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/home';
import Profile from './screens/profile';
import EditProfile from './screens/EditProfile';
import Gambling from './screens/gambling';
import { UserProvider, useUser } from './contexts/UserContext';

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Gambling: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function SignInScreen({ navigation }: any) {
  const { user, login, logout, isLoading } = useUser();

  // --- Google OAuth ---
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    androidClientId: '127612041741-3j8btuc7ol6immrjslqvkbrlj89o2ggf.apps.googleusercontent.com',
    iosClientId: '127612041741-4ijq4rq0bejfsnvn183frhdf9g7rs4ue.apps.googleusercontent.com',
    webClientId: '127612041741-30t2l6pgdt18ij22gvvr03r1kf4org0h.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ scheme: 'com.cfletes.project3fe' }),
  });

  useEffect(() => {
    if (googleResponse?.type === 'success' && googleResponse.params?.access_token) {
      fetchGoogleUser(googleResponse.params.access_token);
    }
  }, [googleResponse]);

  const fetchGoogleUser = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const googleUser = await res.json();
      await login(googleUser);
      navigation.replace('Home');
    } catch (error) {
      console.log('Google user fetch error:', error);
    }
  };

  // --- GitHub OAuth ---
  const githubClientId = 'Ov23li1MaKxzTImvJ2lK';
  const githubRedirectUri = makeRedirectUri();

  console.log('GitHub Redirect URI:', githubRedirectUri);

  const githubDiscovery = {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  };

  const [githubRequest, githubResponse, githubPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: githubClientId,
      scopes: ['read:user', 'user:email'],
      redirectUri: githubRedirectUri,
    },
    githubDiscovery
  );

  useEffect(() => {
    if (githubResponse?.type === 'success' && githubResponse.params?.code) {
      const code = githubResponse.params.code;

      // Normally, you would exchange this code for an access token via your backend
      const githubUser = { name: 'GitHub User', code };
      login(githubUser);
      navigation.replace('Home');
    }
  }, [githubResponse]);

  // --- Sign out function ---
  const handleSignOut = async () => {
    try {
      await logout();
      navigation.replace('SignIn');
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  // Auto-navigate if already logged in
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
      <Button title="Sign in with Google" onPress={() => googlePromptAsync()} />
      <Button title="Sign in with GitHub" onPress={() => githubPromptAsync()} />
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
          <Stack.Screen 
            name="Home" 
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={Profile}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfile} 
            options={{ title: 'Edit Profile' }} 
          />
          <Stack.Screen 
            name="Gambling" 
            component={Gambling}
            options={{ headerShown: false }}
          />
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