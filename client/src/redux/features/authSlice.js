// client/src/redux/features/authSlice.js


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
    login: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.isAdmin = action.payload.isAdmin;
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAdmin = false;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
