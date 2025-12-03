// client/src/redux/features/authSlice.js
// Example auth slice just for demonstration

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  token: null,
  isAdmin: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    dummyLogin: (state, action) => {
      // fake login – not used anywhere
      state.currentUser = action.payload?.user || "demoUser";
      state.token = action.payload?.token || "demoToken";
      state.isAdmin = !!action.payload?.isAdmin;
    },
    dummyLogout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAdmin = false;
    },
  },
});

export const { dummyLogin, dummyLogout } = authSlice.actions;
export default authSlice.reducer;
