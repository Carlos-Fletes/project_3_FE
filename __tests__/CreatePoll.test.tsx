import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePoll from '../screens/createPoll';

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true })
) as jest.Mock;

describe('CreatePoll Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows alert if fields are empty', () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(jest.fn());

    const { getByText } = render(<CreatePoll />);

    fireEvent.press(getByText('Submit Poll'));

    expect(alertSpy).toHaveBeenCalled();
  });

  it('calls fetch with correct payload when form is valid', async () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(jest.fn());

    const { getByPlaceholderText, getByText } = render(<CreatePoll />);

    fireEvent.changeText(
      getByPlaceholderText('Poll Question'),
      'will there be a quiz for Dr. C tommorrow?',
    );
    fireEvent.changeText(
      getByPlaceholderText('Options (comma separated)'),
      'Yes,No',
    );
    fireEvent.changeText(
      getByPlaceholderText('Category'),
      'School',
    );
    fireEvent.changeText(
      getByPlaceholderText('End Date (MM/DD/YYYY HH:MM AM/PM)'),
      '12/31/2025 11:59 PM', // valid format for parseEndDate
    );

    fireEvent.press(getByText('Submit Poll'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/polls'), // matches `${API_BASE}/api/polls`
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });
});
