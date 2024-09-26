import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SquareRoot from '../src/Pages/SquareRoot';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ result: 4, executionTime: 0.1 }),
  })
);

describe('SquareRoot Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders without crashing', () => {
    render(<SquareRoot />);
    expect(screen.getByText(/Square Root Calculator/i)).toBeInTheDocument();
  });

  test('calculates square root correctly', async () => {
    render(<SquareRoot />);
    const input = screen.getByPlaceholderText(/Enter a number/i);
    const select = screen.getByRole('combobox');
    const button = screen.getByRole('button', { name: /Calculate/i });

    fireEvent.change(input, { target: { value: '16' } });
    fireEvent.change(select, { target: { value: 'api' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/4/)).toBeInTheDocument();
    });
  });

  test('shows error for negative input', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ error: 'Cannot calculate square root of a negative number' }),
      })
    );

    render(<SquareRoot />);
    const input = screen.getByPlaceholderText(/Enter a number/i);
    const select = screen.getByRole('combobox');
    const button = screen.getByRole('button', { name: /Calculate/i });

    fireEvent.change(input, { target: { value: '-4' } });
    fireEvent.change(select, { target: { value: 'api' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Cannot calculate square root of a negative number/i)).toBeInTheDocument();
    });
  });
});
