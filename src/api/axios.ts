import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://mockapi.io/api/v1",
  timeout: 10000,
});

export default api;
