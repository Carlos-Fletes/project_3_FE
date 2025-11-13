import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../screens/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(JSON.stringify({ name: 'Jane', username: '@jane' }))),
  removeItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    reset: jest.fn(),
  }),
}));

describe('Profile Screen', () => {
  it('loads and displays stored user data', async () => {
    const { findByText } = render(<Profile />);
    expect(await findByText('Jane')).toBeTruthy();
    expect(await findByText('@jane')).toBeTruthy();
  });

  it('calls AsyncStorage.removeItem on logout', async () => {
    const { getByText } = render(<Profile />);
    fireEvent.press(getByText('Log Out'));
    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@user');
    });
  });
});