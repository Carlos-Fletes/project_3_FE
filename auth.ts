import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

interface UserInfo {
  email?: string;
  name?: string;
  picture?: string;
}

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '859878511345-oq80lj559na0rujgf36ga1d70op7li77.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ native: 'myapp://' }),
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      setAccessToken(authentication?.accessToken ?? null);
      setIdToken(authentication?.idToken ?? null);
    }
  }, [response]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (accessToken) {
        try {
          const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await res.json();
          setUserInfo(data);
        } catch (err) {
          console.error('Failed to fetch user info:', err);
        }
      }
    };
    fetchUserInfo();
  }, [accessToken]);

  const login = async () => {
    await promptAsync();
  };

  return { login, request, accessToken, idToken, userInfo };
}
