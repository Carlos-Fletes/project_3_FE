import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Home from '../screens/home';
import * as navigation from '@react-navigation/native';

// Mock navigation: keep the real module but override useNavigation
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: jest.fn(),
  };
});

// Mock AsyncStorage to avoid native error
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock useUser so Home can render without a real provider
jest.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    user: {
      first_name: 'Home',
      last_name: 'User',
      name: 'Home User',
      obrobucks: 50,
    },
    setUser: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Avoid making a real network request from Home's useEffect
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), // no polls
  })
) as jest.Mock;

describe('Home Screen', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the BetSocial logo', () => {
    // Provide a dummy navigation object
    (navigation as any).useNavigation.mockReturnValue({ navigate: jest.fn() });

    const { getByText } = render(<Home />);

    // Match the exact text used in your component: "BetSocial"
    expect(getByText('BetSocial')).toBeTruthy();
  });

  it('navigates to Profile when Profile tab is pressed', () => {
    const navigate = jest.fn();
    (navigation as any).useNavigation.mockReturnValue({ navigate });

    const { getByText } = render(<Home />);

    // The Profile tab text in your component is just "Profile"
    fireEvent.press(getByText('Profile'));

    expect(navigate).toHaveBeenCalledWith('Profile');
  });
});
