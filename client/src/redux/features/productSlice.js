// client/src/redux/features/productSlice.js


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.list = action.payload;
      state.status = "succeeded";
    },
    startLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },
    loadingFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { setProducts, startLoading, loadingFailed } = productSlice.actions;
export default productSlice.reducer;
