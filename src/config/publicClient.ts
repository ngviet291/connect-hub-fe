import axios, { type AxiosInstance } from 'axios';
import { ENV } from './env';

const publicClient: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

publicClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data ?? error),
);

export default publicClient;