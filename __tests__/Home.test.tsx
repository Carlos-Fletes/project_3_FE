import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Home from '../screens/home';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

describe('Home Screen', () => {
  it('renders the BetSocial logo', () => {
    const { getByText } = render(<NavigationContainer><Home /></NavigationContainer>);
    expect(getByText('🎲 BetSocial')).toBeTruthy();
  });

  it('navigates to Profile when Profile tab is pressed', () => {
    const navigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ navigate });
    const { getByText } = render(<Home />);
    fireEvent.press(getByText('👤 Profile'));
    expect(navigate).toHaveBeenCalledWith('Profile');
  });
});