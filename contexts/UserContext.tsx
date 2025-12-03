import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://betsocial-fde6ef886274.herokuapp.com';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  bio: string;
  obrobucks: number;
  google_id: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (googleUser: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from AsyncStorage on app start
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findOrCreateUser = async (googleUser: any): Promise<User> => {
    try {
      // First, try to find user by Google ID
      const findResponse = await fetch(`${API_BASE_URL}/api/users/google/${googleUser.id}`);
      
      if (findResponse.ok) {
        // User exists, return them
        const existingUser = await findResponse.json();
        return existingUser;
      } else if (findResponse.status === 404) {
        // User doesn't exist, create new one
        const baseUsername = googleUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomSuffix = Math.floor(Math.random() * 1000);
        
        const newUserData = {
          email: googleUser.email,
          name: googleUser.name,
          username: `${baseUsername}${randomSuffix}`, // Add random suffix to avoid conflicts
          bio: `Hello, I'm ${googleUser.name}!`,
          obrobucks: 100, // Starting balance
          google_id: googleUser.id,
          first_name: googleUser.given_name || googleUser.name.split(' ')[0] || '',
          last_name: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' ') || '',
          profile_picture_url: googleUser.picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          last_login: null
        };

        console.log('Creating user with data:', newUserData);

        const createResponse = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUserData),
        });

        if (createResponse.ok) {
          const newUser = await createResponse.json();
          return newUser;
        } else {
          const errorText = await createResponse.text();
          console.error('Create user failed:', createResponse.status, errorText);
          throw new Error(`Failed to create user: ${createResponse.status} - ${errorText}`);
        }
      } else {
        throw new Error('Failed to check user existence');
      }
    } catch (error) {
      console.error('Error finding or creating user:', error);
      throw error;
    }
  };

  const login = async (googleUser: any) => {
    setIsLoading(true);
    try {
      const userData = await findOrCreateUser(googleUser);
      setUser(userData);
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    // Only send updatable fields (exclude read-only fields like id, created_at, etc.)
    const updatePayload: any = {};
    
    // Updatable fields according to backend
    const updatableFields = [
      'name', 'first_name', 'last_name', 
      'username', 'bio', 'obrobucks',
      'profile_picture_url',
      'access_token', 'refresh_token', 'token_expires_at'
    ];

    // Copy only the fields that exist in userData and are updatable
    updatableFields.forEach(field => {
      if (field in userData) {
        updatePayload[field] = userData[field as keyof User];
      }
    });
    
    console.log('Updating user with ID:', user.id);
    console.log('Update payload:', updatePayload);
    console.log('Update payload (stringified):', JSON.stringify(updatePayload, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      console.log('Update response status:', response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('User updated successfully:', updatedUser);
        setUser(updatedUser);
        await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      } else {
        const errorText = await response.text();
        console.error('Update failed:', response.status, errorText);
        throw new Error(`Failed to update user: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  // New function: Refresh user data from backend
  const refreshUser = async () => {
    if (!user || !user.id) {
      console.error('No user logged in to refresh');
      return;
    }

    try {
      console.log('Refreshing user data for ID:', user.id);
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`);
      
      if (response.ok) {
        const refreshedUser = await response.json();
        console.log('User data refreshed:', refreshedUser);
        setUser(refreshedUser);
        await AsyncStorage.setItem('@user', JSON.stringify(refreshedUser));
      } else {
        const errorText = await response.text();
        console.error('Failed to refresh user:', response.status, errorText);
        throw new Error(`Failed to refresh user: ${response.status}`);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};