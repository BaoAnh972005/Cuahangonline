import axios from "axios";

const DEFAULT_BACKEND = "http://localhost:5000/api";
const envHost = import.meta.env.VITE_BACKENDHOST;
let baseURL = DEFAULT_BACKEND;

if (envHost) {
  if (envHost.startsWith("/")) {
    baseURL = `http://localhost:5000${envHost}`;
  } else {
    baseURL = envHost;
  }
}

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
