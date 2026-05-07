import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/env";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15000,
});
console.log(API_URL);
// ✅ REQUEST (AQUÍ SE ENVÍA EL TOKEN)
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest?._retry) {
      originalRequest._retry = true;
      await new Promise((res) => setTimeout(res, 1500));

      return api(originalRequest);
    }

    console.log("API ERROR:", error?.response?.data || error.message);

    return Promise.reject(error);
  }
);