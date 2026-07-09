export const ENV = {
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/api/ws',
  APP_NAME: 'ConnectHub',
} as const;
