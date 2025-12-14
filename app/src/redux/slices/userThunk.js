// src/redux/userThunk.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../utils/AxiosConfig"; // file axios bạn đã tạo

// Thunk lấy user từ cookie (refresh token)
const fetchUserFromCookie = createAsyncThunk(
  "user/fetchUserFromCookie",
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API backend lấy user + access token
      const res = await axios.post("/refresh-token"); // cookie tự gửi theo withCredentials
      // backend trả về { user, accessToken }
      return res.data;
    } catch (err) {
      console.error("Không thể fetch user từ cookie:", err);
      return rejectWithValue(err.response?.data || "Error");
    }
  }
);
export default fetchUserFromCookie;
