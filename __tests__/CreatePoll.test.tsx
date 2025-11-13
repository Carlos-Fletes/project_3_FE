import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreatePoll from '../screens/createPoll';

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true })
) as jest.Mock;

describe('CreatePoll Screen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows alert if fields are empty', async () => {
    const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {});
    const { getByText } = render(<CreatePoll />);
    fireEvent.press(getByText('Submit Poll'));
    expect(alertSpy).toHaveBeenCalled();
  });

  it('calls fetch with correct payload when form is valid', async () => {
    const { getByPlaceholderText, getByText } = render(<CreatePoll />);

    fireEvent.changeText(getByPlaceholderText('Poll Question'), 'will there be a quiz for Dr. C tommorrow?');
    fireEvent.changeText(getByPlaceholderText('Options (comma separated)'), 'Yes,No');
    fireEvent.changeText(getByPlaceholderText('Category'), 'School');
    fireEvent.changeText(getByPlaceholderText('End Date (YYYY-MM-DDTHH:mm:ss)'), '2025-11-30T12:00:00');

    fireEvent.press(getByText('Submit Poll'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/polls',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });
});