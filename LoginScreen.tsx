import React, { useEffect } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  navigation: any;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '859878511345-10q6cd9telk3anbd7kf8vgh0reqt7pid.apps.googleusercontent.com',
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'token',
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === 'success') {
        const { access_token } = response.params;
        try {
          const res = await axios.post('http://10.0.2.2:8080/api/auth/google', {
            token: access_token,
          });

          const appToken = res.data.token;
          console.log('Backend JWT:', appToken);
          navigation.replace('Home');
        } catch (error) {
          console.error('Auth failed:', error);
        }
      }
    };
    handleAuthResponse();
  }, [response]);

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" disabled={!request} onPress={() => promptAsync()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LoginScreen;
