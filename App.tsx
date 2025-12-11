import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
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
import CreatePoll from './screens/createPoll';
import { UserProvider, useUser } from './contexts/UserContext';

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Gambling: undefined;
  CreatePoll: undefined;
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
    const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const googleUser = await res.json();
    await login(googleUser);
    navigation.replace('Home');
  };

  // --- GitHub OAuth ---
  const githubClientId = 'Ov23li1MaKxzTImvJ2lK';
  const githubRedirectUri = makeRedirectUri();

  const githubDiscovery = {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  };

  const [githubRequest, githubResponse, githubPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: githubClientId,
      scopes: ['read:user', 'user:email'],
      redirectUri: githubRedirectUri,
      usePKCE: false,
    },
    githubDiscovery
  );

  useEffect(() => {
    if (githubResponse?.type === 'success' && githubResponse.params?.code) {
      exchangeGitHubCodeForToken(githubResponse.params.code);
    }
  }, [githubResponse]);

  const exchangeGitHubCodeForToken = async (code: string) => {
    try {
      const response = await fetch(
        'https://betsocial-fde6ef886274.herokuapp.com/api/users/auth/github',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        await login(data);
        navigation.replace('Home');
      } else {
        const errorText = await response.text();
        console.error('GitHub token exchange failed:', errorText);
      }
    } catch (error) {
      console.log('GitHub token exchange error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigation.replace('SignIn');
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

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
      <Text style={styles.title}>{user ? `Hello, ${user.name}` : 'Welcome'}</Text>

      <TouchableOpacity style={styles.button} onPress={() => googlePromptAsync()}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => githubPromptAsync()}>
        <Text style={styles.buttonText}>Sign in with GitHub</Text>
      </TouchableOpacity>

      {user && (
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignIn">
          <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Edit Profile' }} />
          <Stack.Screen name="Gambling" component={Gambling} options={{ headerShown: false }} />
          <Stack.Screen name="CreatePoll" component={CreatePoll} options={{ title: 'Create Poll' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 40,
    color: '#333',
  },

  button: {
    width: '100%',
    backgroundColor: '#7C6FD8',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,

    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  logoutButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
