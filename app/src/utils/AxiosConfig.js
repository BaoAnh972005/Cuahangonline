import axios from "axios";

// Use VITE_BACKENDHOST when provided; otherwise default to the running
// Flask backend API URL. If the env value is a relative path like
// "/api", resolve it to the backend host so the dev server doesn't
// intercept requests (avoids requests going to http://localhost:5174/api/...)
const DEFAULT_BACKEND = "http://localhost:5000/api";
const envHost = import.meta.env.VITE_BACKENDHOST;
let baseURL = DEFAULT_BACKEND;
if (envHost) {
  // If envHost is a relative path like '/api', resolve to backend host
  if (envHost.startsWith('/')) {
    baseURL = `http://localhost:5000${envHost}`;
  } else {
    baseURL = envHost;
  }
}

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // rất quan trọng: gửi cookie tự động
  credentials: "include",
});
// Debug: show resolved baseURL in browser console for quick diagnosis
try {
  // eslint-disable-next-line no-console
  console.debug("[AxiosConfig] resolved baseURL:", baseURL);
} catch (e) {}

export default axiosInstance;
