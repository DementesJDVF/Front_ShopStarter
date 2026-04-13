import axios, { InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', // Local backend by default
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token');

    // No enviamos token en rutas de auth públicas para evitar errores con tokens viejos (como token_not_valid)
    const isPublicAuthRoute =
      config.url?.includes('auth/login') || config.url?.includes('auth/register');

    if (token && !isPublicAuthRoute) {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si hay un mensaje estructurado proveído por nuestro custom exception handler de DRF
    const serverMessage = error.response?.data?.message;
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Solo redireccionamos si NO estamos ya en el Landing o en Login/Register
      const isPublicPath = window.location.pathname === '/' || window.location.pathname.startsWith('/auth');
      if (!isPublicPath) {
        toast.error('Sesión expirada. Por favor, inicia sesión de nuevo.');
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 403) {
      toast.error(serverMessage || 'No tienes permisos para realizar esta acción.');
    } else if (error.response?.status >= 500) {
      toast.error('Error interno del servidor. Intenta de nuevo más tarde.');
    } else if (serverMessage) {
      // Cualquier otro error manejado por el backend con mensaje válido (Ej: 400 Bad Request)
      toast.error(serverMessage);
    } else if (error.message === 'Network Error') {
      toast.error('Error de red. Verifica tu conexión a internet o el estado del servidor.');
    } else {
      toast.error('Ocurrió un error inesperado en la solicitud.');
    }

    return Promise.reject(error);
  }
);

export default api;
