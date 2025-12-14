import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../slices/counterSlice";
import userReducer from "../slices/User_data.js";
import cartReducer from "../slices/cart.js";
import otp from "../slices/otpSlice.js";
const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    cart: cartReducer,
    otp: otp,
  },
});

export default store; // ✅ default export
