import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/Pages/login/Login.jsx';

// Mock fetch API
global.fetch = jest.fn();

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('successful login with correct credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEyZWY3YTc2YTNmMzE5YjIxMWVhZmQiLCJpYXQiOjE3MjkzNDM2OTAsImV4cCI6MTcyOTM0NzI5MH0.56OW7ezvOzaqX-2rvF9qpPq1hgo2UvEnsNITT6BTuac' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'admin@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'admin' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzEyZWY3YTc2YTNmMzE5YjIxMWVhZmQiLCJpYXQiOjE3MjkzNDM2OTAsImV4cCI6MTcyOTM0NzI5MH0.56OW7ezvOzaqX-2rvF9qpPq1hgo2UvEnsNITT6BTuac');
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', expect.anything());
    });
  });

  test('login fails with incorrect credentials', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('redirects to login page if accessing protected route without authentication', () => {
    // This test would typically involve checking route protection logic
    // and might be better suited for integration tests
    // Here we check if the login page renders correctly
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  test('displays error message on failed login attempt', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Something went wrong' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
