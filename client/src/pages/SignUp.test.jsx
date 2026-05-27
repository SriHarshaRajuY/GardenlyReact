import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('./../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe('SignUp Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <SignUp />
    </BrowserRouter>
  );

  const fillValidForm = (container, role = 'Buyer') => {
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: role } });
    const username = container.querySelector('input[type="text"]');
    const email = container.querySelector('input[type="email"]');
    const mobile = container.querySelector('input[type="tel"]');
    const password = container.querySelector('input[type="password"]');

    fireEvent.change(username, { target: { value: 'buyer1' } });
    fireEvent.change(email, { target: { value: 'buyer@example.com' } });
    fireEvent.change(mobile, { target: { value: '9876543210' } });
    fireEvent.change(password, { target: { value: 'Password1!' } });
  };

  it('renders signup form and navigation links', () => {
    renderComponent();

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Mobile Number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/signin');
  });

  it('validates email format before calling the API', () => {
    const { container } = renderComponent();
    fillValidForm(container);
    fireEvent.change(container.querySelector('input[type="email"]'), { target: { value: 'bad-email' } });

    fireEvent.submit(container.querySelector('form'));

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('validates mobile number length before calling the API', () => {
    const { container } = renderComponent();
    fillValidForm(container);
    fireEvent.change(container.querySelector('input[type="tel"]'), { target: { value: '12345' } });

    fireEvent.submit(container.querySelector('form'));

    expect(screen.getByText('Mobile must be 10 digits')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('shows expertise choices and requires expertise for expert signup', () => {
    const { container } = renderComponent();
    fillValidForm(container, 'Expert');

    expect(screen.getByText('Expertise')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /General Gardening/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(screen.getByText('Select expertise')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('calls the signup API and moves to OTP verification after successful registration', async () => {
    const { container } = renderComponent();
    fillValidForm(container, 'Seller');
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        requireVerification: true,
        email: 'buyer@example.com',
      }),
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/auth\/signup$/), expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })));
    expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body)).toEqual({
      username: 'buyer1',
      email: 'buyer@example.com',
      mobile: '9876543210',
      password: 'Password1!',
      role: 'Seller',
    });
    expect(await screen.findByRole('heading', { name: /verify email/i })).toBeInTheDocument();
    expect(screen.getByText(/buyer@example.com/i)).toBeInTheDocument();
  });

  it('displays backend signup errors without navigating', async () => {
    const { container } = renderComponent();
    fillValidForm(container, 'Buyer');
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'User with this username/email/mobile already exists' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText('User with this username/email/mobile already exists')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
