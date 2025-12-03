// client/src/redux/features/productSlice.js
// Example product slice – just for showing Redux usage

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
    dummySetProducts: (state, action) => {
      state.list = action.payload || [];
      state.status = "succeeded";
    },
    dummyStartLoading: (state) => {
      state.status = "loading";
      state.error = null;
    },
    dummyLoadingFailed: (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Something went wrong";
    },
  },
});

export const {
  dummySetProducts,
  dummyStartLoading,
  dummyLoadingFailed,
} = productSlice.actions;

export default productSlice.reducer;
