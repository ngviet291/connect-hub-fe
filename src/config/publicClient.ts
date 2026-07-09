import axios, { type AxiosInstance } from "axios";
import { ENV } from "./env";

const API_BASE_URL = ENV.API_URL;

const publicClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// chỉ unwrap data, không auth, không refresh
publicClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || error),
);

export default publicClient;