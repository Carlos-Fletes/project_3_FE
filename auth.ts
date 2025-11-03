// auth.ts
import * as SecureStore from 'expo-secure-store';
import axios, { InternalAxiosRequestConfig } from 'axios';

// ============================
// 🔐 TOKEN STORAGE HELPERS
// ============================

const TOKEN_KEY = 'jwt_token';

export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (err) {
    console.error('Error saving token:', err);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (err) {
    console.error('Error retrieving token:', err);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (err) {
    console.error('Error deleting token:', err);
  }
};

// ============================
// 🌐 AXIOS INSTANCE
// ============================

export const api = axios.create({
  baseURL: 'http://10.0.2.2:8080/api', // local backend (Android emulator)
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Interceptor (type-safe for Axios v1+)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      // Mutate headers safely
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// 🚀 AUTH HELPER FUNCTIONS
// ============================

/**
 * Authenticate with Google token -> backend issues JWT
 */
export const authenticateWithGoogle = async (googleToken: string) => {
  const res = await api.post('/auth/google', { token: googleToken });
  const backendToken: string = res.data.token;
  await saveToken(backendToken);
  return backendToken;
};

/**
 * Get logged-in user info
 */
export const getCurrentUser = async () => {
  const res = await api.get('/user/me');
  return res.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await removeToken();
};
