// src/redux/slices/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Helper load từ localStorage an toàn
const loadCart = () => {
  if (typeof window !== "undefined" && localStorage.getItem("cart")) {
    try {
      return JSON.parse(localStorage.getItem("cart"));
    } catch {
      return [];
    }
  }
  return [];
};

const saveCart = (items) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(items));
  }
};

const initialState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex(
        (item) => item.sanpham_id === product.sanpham_id
      );

      if (index >= 0) {
        state.items[index].so_luong += product.so_luong || 1;
        state.items[index].selected = false; // mặc định chưa chọn
      } else {
        state.items.push({
          ...product,
          so_luong: product.so_luong || 1,
          selected: false, // mặc định chưa chọn
        });
      }

      saveCart(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.sanpham_id !== action.payload
      );
      saveCart(state.items);
    },

    updateQuantity: (state, action) => {
      const { sanpham_id, so_luong } = action.payload;
      const index = state.items.findIndex(
        (item) => item.sanpham_id === sanpham_id
      );
      if (index >= 0) {
        state.items[index].so_luong = so_luong > 0 ? so_luong : 1;
      }
      saveCart(state.items);
    },

    toggleSelect: (state, action) => {
      const index = state.items.findIndex(
        (item) => item.sanpham_id === action.payload
      );
      if (index >= 0) {
        state.items[index].selected = !state.items[index].selected;
      }
      saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },

    clearPaidItems: (state) => {
      state.items = state.items.filter((item) => !item.selected);
      saveCart(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  toggleSelect,
  clearCart,
  clearPaidItems,
} = cartSlice.actions;

export default cartSlice.reducer;
