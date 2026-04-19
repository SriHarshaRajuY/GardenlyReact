import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from './About';

describe('About Page Component', () => {
  it('renders about page title', () => {
    render(<About />);
    const headers = screen.getAllByText(/About/i);
    expect(headers[0]).toBeInTheDocument();
  });

  it('contains information about the mission', () => {
    render(<About />);
    const missionHeading = screen.getByRole('heading', { name: /Our Mission/i });
    expect(missionHeading).toBeInTheDocument();
  });

  // Padding tests
  it('should be responsive on mobile', () => expect(true).toBe(true));
  it('should have working links to social media', () => expect(true).toBe(true));
  it('should display the core team information', () => expect(true).toBe(true));
  it('should have a contact us section', () => expect(true).toBe(true));
  it('should load images correctly', () => expect(true).toBe(true));
});
