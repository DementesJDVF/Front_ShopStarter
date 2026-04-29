import axios, { InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const ACCESS_TOKEN_KEY = 'access';
const REFRESH_TOKEN_KEY = 'refresh';

const getStoredToken = (key: string): string | null => {
  const value = localStorage.getItem(key);
  return value && value !== 'undefined' && value !== 'null' ? value : null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<any> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken(ACCESS_TOKEN_KEY);

    if (!token && config.url && !config.url.includes('users/auth/login/')) {
      return Promise.reject(new Error('No access token available'));
    }

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;

    if (!isUnauthorized || !originalRequest) {
      return Promise.reject(error);
    }

    const refresh = getStoredToken(REFRESH_TOKEN_KEY);
    const isAuthEndpoint = originalRequest.url?.includes('users/auth/login/') || originalRequest.url?.includes('token/refresh/');

    if (!refresh || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(`${api.defaults.baseURL}token/refresh/`, { refresh });
      const newAccess = refreshResponse.data?.access;

      if (!newAccess) {
        throw new Error('Refresh succeeded without new access token');
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
      processQueue(null, newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('user');
      toast.error('Tu sesión expiró. Inicia sesión nuevamente.');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
