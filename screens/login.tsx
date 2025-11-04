import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define stack routes so typescript knows about them
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
};

//Tell useNavigation what type it is
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Later, replace this with real auth
    navigation.navigate('Home');
  };

  const handleGuest = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BetSocial </Text>
      <Text style={styles.subtitle}>Bet your reputation. Predict the future.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.guestButton} onPress={handleGuest}>
        <Text style={styles.guestButtonText}>Continue as Guest</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>Don't have an account? Sign up soon 🚀</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE9FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B3EFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#6B4EFF',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  guestButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6B4EFF',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  guestButtonText: {
    color: '#6B4EFF',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    color: '#777',
    marginTop: 20,
  },
});
