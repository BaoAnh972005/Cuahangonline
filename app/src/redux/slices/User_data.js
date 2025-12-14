import { createSlice } from "@reduxjs/toolkit";
import fetchUserFromCookie from "./userThunk";

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
};
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isLoggedIn = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserFromCookie.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isLoggedIn = true;
      })
      .addCase(fetchUserFromCookie.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
      });
  },
});

export const { logout, loginSuccess } = userSlice.actions;
export default userSlice.reducer;
