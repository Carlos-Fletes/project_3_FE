import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Profile from '../screens/profile';

// Mock AsyncStorage so anything in UserContext that uses it won't crash
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock navigation used in Profile
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    reset: jest.fn(),
  }),
}));

// Mock useUser so we don't need a real UserProvider
const mockLogout = jest.fn();

jest.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    user: {
      name: 'Jane',
      username: 'jane',
      obrobucks: 123,
      bio: 'Test bio',
      profile_picture_url: '',
    },
    logout: mockLogout,
  }),
}));

describe('Profile Screen', () => {
  beforeEach(() => {
    mockLogout.mockClear();
  });

  it('loads and displays stored user data', () => {
    const { getByText } = render(<Profile />);

    // From the mocked user above
    expect(getByText('Jane')).toBeTruthy();
    expect(getByText('@jane')).toBeTruthy();
  });

  it('calls logout when "Log Out" is pressed', () => {
    const { getByText } = render(<Profile />);

    fireEvent.press(getByText('Log Out'));

    expect(mockLogout).toHaveBeenCalled();
  });
});
