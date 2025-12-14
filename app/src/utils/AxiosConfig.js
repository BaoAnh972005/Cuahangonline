import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKENDHOST, // ⚠️ frontend dùng import.meta.env
  timeout: 10000,
  withCredentials: true, // rất quan trọng: gửi cookie tự động
  credentials: "include",
});

export default axiosInstance;
