import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});
