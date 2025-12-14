import axios from "axios";

// ĐỊNH NGHĨA BASE URL CHO BACKEND FLASK
const FLASK_BASE_URL = "http://localhost:5000/api";

const api_Python = {
  // AUTHENTICATION
    register: (data) => {
        return axios.post(`${FLASK_BASE_URL}/auth/register`, data);
    },
    login: (data) => {
        return axios.post(`${FLASK_BASE_URL}/auth/login`, data);
    },
    logout: () => {
        return axios.post(`${FLASK_BASE_URL}/auth/logout`);
    },
};

export default api_Python;