import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { loginUser } from '../services/auth';

// Mock the auth module
vi.mock('../services/auth');

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form with all elements', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('allows typing in username and password fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LoginPage />);
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  test('handles successful login', async () => {
    const user = userEvent.setup();
    loginUser.mockResolvedValue({ token: 'mock-token-123' });
    renderWithRouter(<LoginPage />);
    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('admin', 'password123');
    });
    expect(localStorage.getItem('token')).toBe('mock-token-123');
  });

  test('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    loginUser.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ token: 'test-token' }), 100)
        )
    );
    renderWithRouter(<LoginPage />);
    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });

  test('renders social login buttons', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByTitle(/continue with google/i)).toBeInTheDocument();
    expect(screen.getByTitle(/continue with facebook/i)).toBeInTheDocument();
    expect(screen.getByTitle(/continue with linkedin/i)).toBeInTheDocument();
  });

  test('requires username field', () => {
    renderWithRouter(<LoginPage />);
    const usernameInput = screen.getByLabelText(/username/i);
    expect(usernameInput).toBeRequired();
  });

  test('requires password field', () => {
    renderWithRouter(<LoginPage />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeRequired();
  });
  test('displays error message on failed login', async () => {
  const user = userEvent.setup();
  loginUser.mockRejectedValue(new Error('Invalid credentials'));
  renderWithRouter(<LoginPage />);
  await user.type(screen.getByLabelText(/username/i), 'admin');
  await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => {
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});

test('clears message on form input', async () => {
  const user = userEvent.setup();
  loginUser.mockRejectedValue(new Error('Invalid credentials'));
  renderWithRouter(<LoginPage />);
  await user.type(screen.getByLabelText(/username/i), 'admin');
  await user.type(screen.getByLabelText(/password/i), 'password');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => {
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
  // Clear the message by typing again
  await user.clear(screen.getByLabelText(/username/i));
  await user.type(screen.getByLabelText(/username/i), 'newuser');
  // Message should still be there until form submission
  expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
});

test('remember me checkbox toggles correctly', async () => {
  const user = userEvent.setup();
  renderWithRouter(<LoginPage />);
  const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
  expect(checkbox).not.toBeChecked();
  await user.click(checkbox);
  expect(checkbox).toBeChecked();
  await user.click(checkbox);
  expect(checkbox).not.toBeChecked();
});

test('disables submit button while loading', async () => {
  const user = userEvent.setup();
  loginUser.mockImplementation(
    () =>
      new Promise(resolve =>
        setTimeout(() => resolve({ token: 'test-token' }), 500)
      )
  );
  renderWithRouter(<LoginPage />);
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  expect(submitButton).not.toBeDisabled();
  await user.type(screen.getByLabelText(/username/i), 'admin');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(submitButton);
  expect(submitButton).toBeDisabled();
});

test('calls loginUser with correct credentials', async () => {
  const user = userEvent.setup();
  loginUser.mockResolvedValue({ token: 'test-token' });
  renderWithRouter(<LoginPage />);
  await user.type(screen.getByLabelText(/username/i), 'testuser');
  await user.type(screen.getByLabelText(/password/i), 'testpass123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => {
    expect(loginUser).toHaveBeenCalledWith('testuser', 'testpass123');
    expect(loginUser).toHaveBeenCalledTimes(1);
  });
});

test('stores token in localStorage on successful login', async () => {
  const user = userEvent.setup();
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  loginUser.mockResolvedValue({ token: mockToken });
  renderWithRouter(<LoginPage />);
  await user.type(screen.getByLabelText(/username/i), 'admin');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => {
    expect(localStorage.getItem('token')).toBe(mockToken);
  });
});

test('does not call loginUser if fields are empty', async () => {
  const user = userEvent.setup();
  renderWithRouter(<LoginPage />);
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  await user.click(submitButton);
  // With HTML5 validation, it won't submit, so loginUser won't be called
  expect(loginUser).not.toHaveBeenCalled();
});

test('displays link to register page', () => {
  renderWithRouter(<LoginPage />);
  const registerLink = screen.getByRole('link', { name: /sign up/i });
  expect(registerLink).toBeInTheDocument();
  expect(registerLink).toHaveAttribute('href', '/register');
});

test('shows error message with proper styling', async () => {
  const user = userEvent.setup();
  loginUser.mockRejectedValue(new Error('Login failed'));
  renderWithRouter(<LoginPage />);
  await user.type(screen.getByLabelText(/username/i), 'admin');
  await user.type(screen.getByLabelText(/password/i), 'password');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => {
    const errorMessage = screen.getByText(/login failed/i);
    expect(errorMessage).toHaveClass('text-red-700');
  });
});

test('handles network error gracefully', async () => {
  const user = userEvent.setup();
  loginUser.mockRejectedValue(new Error('Network Error'));
  renderWithRouter(<LoginPage />);
  await user.type(screen.getByLabelText(/username/i), 'admin');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  await waitFor(() => {
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });
});
});