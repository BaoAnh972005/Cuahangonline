import axios from "axios";

// ĐỊNH NGHĨA BASE URL CHO BACKEND FLASK
const FLASK_BASE_URL = "http://localhost:5000/api";

const api_Python = {
  // API cho Sản phẩm giảm giá (Tương ứng với xem_SP / SP_client)
  // Endpoint Flask: /api/products/discount
  getDiscountProducts: () => {
    return axios.get(`${FLASK_BASE_URL}/products/discount`);
  },

  // API cho Sản phẩm bán chạy (Tương ứng với bestseller)
  // Endpoint Flask: /api/products/bestseller
  getBestsellerProducts: () => {
    return axios.get(`${FLASK_BASE_URL}/products/bestseller`);
  },

  // API cho Sản phẩm gợi ý (Tương ứng với random20)
  // Endpoint Flask: /api/products/suggested
  getSuggestedProducts: () => {
    return axios.get(`${FLASK_BASE_URL}/products/suggested`);
  },
};

export default api_Python;