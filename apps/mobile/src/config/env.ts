export const ENV = process.env.ENV;

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://veci-api-pm1e.onrender.com";

export const API_V1_URL = API_URL.replace(/\/+$/, "").replace(/(?:\/api\/v1)?$/, "/api/v1");

  export const GEOAPIFY_API_KEY =
  process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY || "";
