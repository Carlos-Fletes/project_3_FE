import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Login from '../screens/login';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

describe('Login Screen', () => {
  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = render(
      <NavigationContainer>
        <Login />
      </NavigationContainer>
    );
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('navigates to Home on Login press', () => {
    const navigate = jest.fn();
    jest
      .spyOn(require('@react-navigation/native'), 'useNavigation')
      .mockReturnValue({ navigate });

    const { getByText } = render(<Login />);
    fireEvent.press(getByText('Login'));
    expect(navigate).toHaveBeenCalledWith('Home');
  });
});