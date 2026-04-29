import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const ACCESS_TOKEN_KEY = 'access';
const REFRESH_TOKEN_KEY = 'refresh';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 15000);

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const getStorageToken = (key: string): string | null => {
  const value = localStorage.getItem(key);
  return value && value !== 'undefined' && value !== 'null' ? value : null;
};

const clearAuthStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const resolvePendingQueue = (error?: unknown, token?: string) => {
  pendingQueue.forEach((promise) => {
    if (error || !token) promise.reject(error);
    else promise.resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getStorageToken(ACCESS_TOKEN_KEY);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? '';
    const isRefreshRequest = requestUrl.includes('/api/auth/refresh/');
    const isLoginRequest = requestUrl.includes('users/auth/login/');

    if (isRefreshRequest || isLoginRequest) {
      return Promise.reject(error);
    }

    const refreshToken = getStorageToken(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      clearAuthStorage();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((queueError) => Promise.reject(queueError));
    }

    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/api/auth/refresh/`,
        { refresh: refreshToken },
        {
          timeout: API_TIMEOUT_MS,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      const newAccessToken = refreshResponse.data?.access ?? refreshResponse.data?.access_token;

      if (!newAccessToken) {
        throw new Error('Refresh endpoint response does not contain a new access token');
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      resolvePendingQueue(undefined, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      resolvePendingQueue(refreshError);
      clearAuthStorage();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export { clearAuthStorage, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
export default api;
