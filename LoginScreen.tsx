import React, { useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useGoogleAuth } from './auth';

interface LoginScreenProps {
  onLoginSuccess: (info: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login, request, userInfo } = useGoogleAuth();

  useEffect(() => {
    if (userInfo) {
      console.log('User info:', userInfo);
      onLoginSuccess(userInfo);
    }
  }, [userInfo]);

  return (
    <View style={styles.container}>
      <Button disabled={!request} title="Login with Google" onPress={login} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
