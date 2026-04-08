import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { getToken } from "@/lib/auth";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});