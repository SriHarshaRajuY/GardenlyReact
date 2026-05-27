import { describe, it, expect } from 'vitest';
import cartReducer, { addToCart, removeFromCart } from './cartSlice';

describe('Cart Redux Slice', () => {
  const initialState = {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  };

  it('returns the initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('adds an item and updates quantity and total price', () => {
    const newItem = { id: '1', name: 'Aloe', price: 15 };
    const state = cartReducer(initialState, addToCart(newItem));

    expect(state.items).toEqual([newItem]);
    expect(state.totalQuantity).toBe(1);
    expect(state.totalPrice).toBe(15);
  });

  it('adds multiple entries and sums their prices', () => {
    const state = [{ id: '1', name: 'Aloe', price: 15 }, { id: '2', name: 'Fern', price: 20 }]
      .reduce((current, item) => cartReducer(current, addToCart(item)), initialState);

    expect(state.items).toHaveLength(2);
    expect(state.totalQuantity).toBe(2);
    expect(state.totalPrice).toBe(35);
  });

  it('keeps duplicate products as separate line items in the current slice behavior', () => {
    const item = { id: '1', name: 'Aloe', price: 15 };
    const once = cartReducer(initialState, addToCart(item));
    const twice = cartReducer(once, addToCart(item));

    expect(twice.items).toEqual([item, item]);
    expect(twice.totalQuantity).toBe(2);
    expect(twice.totalPrice).toBe(30);
  });

  it('removes all entries matching an item id and recalculates totals', () => {
    const stateWithItems = {
      items: [
        { id: '1', name: 'Aloe', price: 15 },
        { id: '2', name: 'Fern', price: 20 },
        { id: '1', name: 'Aloe', price: 15 },
      ],
      totalQuantity: 3,
      totalPrice: 50,
    };

    const nextState = cartReducer(stateWithItems, removeFromCart('1'));

    expect(nextState.items).toEqual([{ id: '2', name: 'Fern', price: 20 }]);
    expect(nextState.totalQuantity).toBe(1);
    expect(nextState.totalPrice).toBe(20);
  });

  it('leaves totals consistent when removing an id that is not in the cart', () => {
    const stateWithItems = {
      items: [{ id: '1', name: 'Aloe', price: 15 }],
      totalQuantity: 1,
      totalPrice: 15,
    };

    const nextState = cartReducer(stateWithItems, removeFromCart('missing'));

    expect(nextState.items).toEqual(stateWithItems.items);
    expect(nextState.totalQuantity).toBe(1);
    expect(nextState.totalPrice).toBe(15);
  });
});
