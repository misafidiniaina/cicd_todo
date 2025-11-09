import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import { registerUser } from '../services/auth';

// Mock the auth module
vi.mock('../services/auth');

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders register form with all elements', () => {
    renderWithRouter(<RegisterForm />);
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up to get started/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('allows typing in all fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'newuser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    expect(usernameInput).toHaveValue('newuser');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  test('shows error when username is empty', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
  });

  test('shows error when password is empty', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);
    await user.type(screen.getByLabelText(/username/i), 'testuser');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('shows error when confirm password is empty', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  test('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password456');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('shows error when terms checkbox is not checked', async () => {
    const user = userEvent.setup();
    registerUser.mockResolvedValue({ token: 'mock-token', message: 'Account created' });
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/you must agree to the terms and conditions/i)
      ).toBeInTheDocument();
    });
  });

  test('handles successful registration', async () => {
    const user = userEvent.setup();
    registerUser.mockResolvedValue({
      token: 'mock-token-123',
      message: 'Account created successfully',
    });
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith('newuser', 'password123');
      expect(localStorage.getItem('token')).toBe('mock-token-123');
    });
  });

  test('shows success message on successful registration', async () => {
    const user = userEvent.setup();
    registerUser.mockResolvedValue({
      token: 'mock-token',
      message: 'Registration successful',
    });
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/✅/)).toBeInTheDocument();
    });
  });

  test('shows error message on failed registration', async () => {
    const user = userEvent.setup();
    registerUser.mockRejectedValue(
      new Error('Username already exists')
    );
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'existinguser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
    });
  });

  test('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    registerUser.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() =>
            resolve({ token: 'test-token', message: 'Success' }), 100
          )
        )
    );
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument();
    });
  });

  test('disables submit button while loading', async () => {
    const user = userEvent.setup();
    registerUser.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ token: 'test-token' }), 500)
        )
    );
    renderWithRouter(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    expect(submitButton).not.toBeDisabled();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  test('toggles password visibility with eye icon', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const passwordEyeButtons = screen.getAllByTitle(/show password/i);
    await user.click(passwordEyeButtons[0]);

    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(passwordEyeButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('toggles confirm password visibility with eye icon', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const confirmPasswordEyeButtons = screen.getAllByTitle(/show password/i);
    await user.click(confirmPasswordEyeButtons[1]);

    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    await user.click(confirmPasswordEyeButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('toggles terms checkbox correctly', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree/i });
    expect(termsCheckbox).not.toBeChecked();

    await user.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();

    await user.click(termsCheckbox);
    expect(termsCheckbox).not.toBeChecked();
  });

  test('calls registerUser with correct credentials', async () => {
    const user = userEvent.setup();
    registerUser.mockResolvedValue({
      token: 'test-token',
      message: 'Success',
    });
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser123');
    await user.type(screen.getByLabelText(/^password$/i), 'securepass456');
    await user.type(screen.getByLabelText(/confirm password/i), 'securepass456');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith('testuser123', 'securepass456');
      expect(registerUser).toHaveBeenCalledTimes(1);
    });
  });

  test('stores token in localStorage on successful registration', async () => {
    const user = userEvent.setup();
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    registerUser.mockResolvedValue({
      token: mockToken,
      message: 'Registered',
    });
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(mockToken);
    });
  });

  test('clears errors when user starts typing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'testuser');

    await waitFor(() => {
      expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument();
    });
  });

  test('displays link to login page', () => {
    renderWithRouter(<RegisterForm />);
    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('renders social signup buttons', () => {
    renderWithRouter(<RegisterForm />);
    expect(screen.getByTitle(/continue with google/i)).toBeInTheDocument();
    expect(screen.getByTitle(/continue with facebook/i)).toBeInTheDocument();
    expect(screen.getByTitle(/continue with linkedin/i)).toBeInTheDocument();
  });

  test('handles network error gracefully', async () => {
    const user = userEvent.setup();
    registerUser.mockRejectedValue(new Error('Network Error'));
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('shows error message with proper styling', async () => {
    const user = userEvent.setup();
    registerUser.mockRejectedValue(new Error('Registration failed'));
    renderWithRouter(<RegisterForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree/i }));
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      const errorMessage = screen.getByText(/registration failed/i);
      expect(errorMessage).toHaveClass('text-red-700');
    });
  });

  test('does not submit form with validation errors', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RegisterForm />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    expect(registerUser).not.toHaveBeenCalled();
  });
});