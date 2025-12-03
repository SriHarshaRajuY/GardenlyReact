// client/src/redux/features/cartSlice.js
// Example cart slice for demo

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    dummyAddToCart: (state, action) => {
      const item = action.payload;
      state.items.push(item);
      state.totalQuantity += 1;
      state.totalPrice += item.price || 0;
    },
    dummyRemoveFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((p) => p._id !== id);
      state.totalQuantity = state.items.length;
      state.totalPrice = state.items.reduce(
        (sum, p) => sum + (p.price || 0),
        0
      );
    },
    dummyClearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

export const {
  dummyAddToCart,
  dummyRemoveFromCart,
  dummyClearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
