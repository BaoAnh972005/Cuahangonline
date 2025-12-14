import axios from "axios";
import axiosInstance from "../AxiosConfig";

// Axios dùng cho API Python (port 5000)
const axiosPython = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

// Gom TẤT CẢ API vào 1 object
const api_Python = {
  // 🔐 USER
  getMe: () => axiosInstance.get("/me"),

  register: (data) =>
    axiosPython.post("/api/auth/register", data),

  login: (data) =>
    axiosPython.post("/api/auth/login", data),

  logout: () =>
    axiosPython.post("/api/auth/logout"),

  // 🛒 PRODUCT
  getDiscountProducts: () =>
    axiosPython.get("/api/products/discount"),

  getBestsellerProducts: () =>
    axiosPython.get("/api/products/bestseller"),

  getSuggestedProducts: () =>
    axiosPython.get("/api/products/suggested"),

  getProductDetails: (id) =>
    axiosPython.get(`/api/products/${id}`),
};

export default api_Python;
