import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductCard from './ProductCard';
import * as AuthContext from '../context/AuthContext';
import * as CartContext from '../context/CartContext';

// Mock the contexts
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));
vi.mock('../context/CartContext', () => ({
  useCart: vi.fn()
}));

describe('ProductCard Component', () => {
  const mockAddToCart = vi.fn();
  const mockProduct = {
    _id: 'prod1',
    name: 'Monstera Deliciosa',
    category: 'Indoor',
    price: 499,
    quantity: 10,
    image: '/monstera.jpg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    AuthContext.useAuth.mockReturnValue({ user: { role: 'buyer' } });
    CartContext.useCart.mockReturnValue({ addToCart: mockAddToCart });
  });

  it('renders product details correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Monstera Deliciosa')).toBeInTheDocument();
    expect(screen.getByText('Indoor')).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();
    expect(screen.getByText('Available: 10 in stock')).toBeInTheDocument();
  });

  it('shows out of stock when quantity is 0', () => {
    const outOfStockProduct = { ...mockProduct, quantity: 0 };
    render(<ProductCard product={outOfStockProduct} />);
    
    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);
    const button = screen.getByRole('button', { name: /out of stock/i });
    expect(button).toBeDisabled();
  });

  it('calls addToCart when Add To Cart button is clicked', () => {
    render(<ProductCard product={mockProduct} />);
    
    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);
    
    expect(mockAddToCart).toHaveBeenCalledWith('prod1');
  });

  it('calls onView when the card is clicked', () => {
    const mockView = vi.fn();
    render(<ProductCard product={mockProduct} onView={mockView} />);
    
    // Click the card container (it has the onClick handler)
    const card = screen.getByText('Monstera Deliciosa').closest('div').parentElement;
    fireEvent.click(card);
    
    expect(mockView).toHaveBeenCalledWith(mockProduct);
  });

  describe('Seller Controls', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({ user: { role: 'seller' } });
    });

    it('shows edit and delete buttons for sellers', () => {
      const mockEdit = vi.fn();
      const mockDelete = vi.fn();
      render(<ProductCard product={mockProduct} onEdit={mockEdit} onDelete={mockDelete} />);
      
      expect(screen.getByTitle('Edit')).toBeInTheDocument();
      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    it('calls onEdit when edit button clicked', () => {
      const mockEdit = vi.fn();
      render(<ProductCard product={mockProduct} onEdit={mockEdit} />);
      
      fireEvent.click(screen.getByTitle('Edit'));
      expect(mockEdit).toHaveBeenCalledWith(mockProduct);
    });

    it('calls onDelete when delete button clicked', () => {
      const mockDelete = vi.fn();
      render(<ProductCard product={mockProduct} onDelete={mockDelete} />);
      
      fireEvent.click(screen.getByTitle('Delete'));
      expect(mockDelete).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('Image Handling', () => {
    it('uses fallback image if product image is missing', () => {
      const productNoImage = { ...mockProduct, image: null };
      render(<ProductCard product={productNoImage} />);
      
      const img = screen.getByRole('img');
      expect(img.src).toContain('/fallback.png');
    });

    it('correctly handles external http images', () => {
      const externalImage = { ...mockProduct, image: 'https://example.com/plant.jpg' };
      render(<ProductCard product={externalImage} />);
      
      const img = screen.getByRole('img');
      expect(img.src).toBe('https://example.com/plant.jpg');
    });
  });

  describe('Rating System', () => {
    it('renders rating stars if rating is provided', () => {
      const productWithRating = { ...mockProduct, rating: 4 };
      render(<ProductCard product={productWithRating} />);
      
      const stars = screen.getAllByText('★');
      expect(stars).toHaveLength(5);
      
      // 4 yellow, 1 gray
      const yellowStars = stars.filter(star => star.className.includes('text-yellow-400'));
      expect(yellowStars).toHaveLength(4);
    });
  });
});
