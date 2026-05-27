import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignIn from './SignIn';
import * as AuthContext from '../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignIn Page Component', () => {
  let mockLogin;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn();
    AuthContext.useAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      loading: false,
    });
    globalThis.fetch = vi.fn();
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <SignIn />
    </BrowserRouter>
  );

  const fillLoginForm = (container, role = 'Buyer') => {
    fireEvent.change(screen.getByRole('combobox'), { target: { value: role } });
    fireEvent.change(container.querySelector('input[type="text"]'), { target: { value: 'testuser' } });
    fireEvent.change(container.querySelector('input[type="password"]'), { target: { value: 'Password1!' } });
  };

  it('renders the login form and navigation links', () => {
    renderComponent();

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/signup');
  });

  it('updates role, username, and password fields', () => {
    const { container } = renderComponent();

    fillLoginForm(container, 'Seller');

    expect(screen.getByRole('combobox')).toHaveValue('Seller');
    expect(container.querySelector('input[type="text"]')).toHaveValue('testuser');
    expect(container.querySelector('input[type="password"]')).toHaveValue('Password1!');
  });

  it('shows a local validation error when required fields are missing', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText('Please fill all fields')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls the signin API, stores auth context, and navigates sellers to the seller dashboard', async () => {
    const { container } = renderComponent();
    fillLoginForm(container, 'Seller');
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'jwt-token',
        user: { _id: 'u1', username: 'seller1', role: 'Seller' },
      }),
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(
      'jwt-token',
      { _id: 'u1', username: 'seller1', role: 'Seller' }
    ));
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/signin$/), expect.objectContaining({
      method: 'POST',
      credentials: 'include',
    }));
    expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body)).toEqual({
      username: 'testuser',
      password: 'Password1!',
      role: 'Seller',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/seller');
  });

  it('displays the backend error message when login fails', async () => {
    const { container } = renderComponent();
    fillLoginForm(container, 'Buyer');
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid password' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid password')).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('switches to email verification when backend requires verification', async () => {
    const { container } = renderComponent();
    fillLoginForm(container, 'Buyer');
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        requireVerification: true,
        email: 'buyer@example.com',
        message: 'Please verify your email first.',
      }),
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('heading', { name: /verify email/i })).toBeInTheDocument();
    expect(screen.getByText(/buyer@example.com/i)).toBeInTheDocument();
    expect(screen.getByText('Please verify your email first.')).toBeInTheDocument();
  });

  it('opens forgot-password flow and requests an OTP for the entered email', async () => {
    renderComponent();
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();

    fireEvent.change(document.querySelector('input[type="email"]'), { target: { value: 'buyer@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send otp/i }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/forgot-password$/), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'buyer@example.com' }),
    })));
    expect(await screen.findByText('OTP sent! Check your email.')).toBeInTheDocument();
  });
});
