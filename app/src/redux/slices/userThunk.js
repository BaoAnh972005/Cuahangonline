// src/redux/userThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/AxiosConfig";

const fetchUserFromCookie = createAsyncThunk(
  "user/fetchUserFromCookie",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/refresh-token");
      return res.data; // { user, accessToken }
    } catch (err) {
      // ✅ 401 = CHƯA LOGIN → trạng thái bình thường
      if (err.response?.status === 401) {
        return rejectWithValue(null); // ⛔ KHÔNG log error
      }

      // ❗ Chỉ log khi lỗi khác 401
      console.error("Lỗi refresh token:", err);
      return rejectWithValue("Refresh token failed");
    }
  }
);

export default fetchUserFromCookie;
