import axios from "axios";

// Base URL KHÔNG /api
const axiosPython = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // 🔥 BẮT BUỘC
});

const api_Python = {
  getDiscountProducts: () =>
    axiosPython.get("/api/products/discount"),

  getBestsellerProducts: () =>
    axiosPython.get("/api/products/bestseller"),

  getSuggestedProducts: () =>
    axiosPython.get("/api/products/suggested"),

  getProductDetails: (id) =>
    axiosPython.get(`/api/products/${id}`),

  register: (data) =>
    axiosPython.post("/api/auth/register", data),

  login: (data) =>
    axiosPython.post("/api/auth/login", data),

  logout: () =>
    axiosPython.post("/api/auth/logout"),
};

export default api_Python;
