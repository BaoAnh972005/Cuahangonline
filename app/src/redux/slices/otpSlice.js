import { createSlice } from "@reduxjs/toolkit";

const otpSlice = createSlice({
  name: "otp",
  initialState: {
    popupVisible: false,
    otpSent: false,
    countdown: 0,
    otpValues: ["", "", "", "", "", ""],
    verified: false,
    pendingOrderData: null,
  },
  reducers: {
    setPopupVisible: (state, action) => {
      state.popupVisible = action.payload;
    },
    setOtpSent: (state, action) => {
      state.otpSent = action.payload;
    },
    setCountdown: (state, action) => {
      if (typeof action.payload === "number") {
        state.countdown = action.payload;
      } else if (action.payload === "decrement") {
        state.countdown = state.countdown > 1 ? state.countdown - 1 : 0;
      }
    },

    setOtpValues: (state, action) => {
      state.otpValues = action.payload;
    },
    setVerified: (state, action) => {
      state.verified = action.payload;
    },
    setPendingOrderData: (state, action) => {
      state.pendingOrderData = action.payload;
    },
    clearOtpState: (state) => {
      state.popupVisible = false;
      state.otpSent = false;
      state.countdown = 0;
      state.otpValues = ["", "", "", "", "", ""];
      state.verified = false;
      state.pendingOrderData = null;
    },
  },
});

export const {
  setPopupVisible,
  setOtpSent,
  setCountdown,
  setOtpValues,
  setVerified,
  setPendingOrderData,
  clearOtpState,
} = otpSlice.actions;

export default otpSlice.reducer;
