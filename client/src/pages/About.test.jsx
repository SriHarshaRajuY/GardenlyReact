import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from './About';

describe('About Page Component', () => {
  it('renders the Gardenly brand and mission section', () => {
    render(<About />);

    expect(screen.getByRole('heading', { name: /About Gardenly/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Our Mission/i })).toBeInTheDocument();
    expect(screen.getByText(/gardening should be accessible and rewarding/i)).toBeInTheDocument();
  });

  it('renders the mission image with accessible alt text', () => {
    render(<About />);

    const image = screen.getByRole('img', { name: /gardening/i });
    expect(image).toHaveAttribute('src', expect.stringContaining('images.unsplash.com'));
  });

  it('shows marketplace credibility metrics', () => {
    render(<About />);

    expect(screen.getByText('50k+')).toBeInTheDocument();
    expect(screen.getByText('Happy Gardeners')).toBeInTheDocument();
    expect(screen.getByText('10k+')).toBeInTheDocument();
    expect(screen.getByText('Verified Plants')).toBeInTheDocument();
  });

  it('renders all four value proposition cards', () => {
    render(<About />);

    expect(screen.getByRole('heading', { name: /Eco Friendly/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Community Driven/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Global Vision/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Verified Sellers/i })).toBeInTheDocument();
  });
});
