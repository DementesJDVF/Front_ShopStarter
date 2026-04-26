import axios, { InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial para enviar y recibir Cookies seguras HttpOnly
  xsrfCookieName: 'csrftoken', // Sincronización Django CSRF
  xsrfHeaderName: 'X-CSRFToken',
});

let isRefreshing = false;
let failedQueue: Array<any> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor para inyectar Token automáticamente
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const token = userData.access || userData.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error("Error al inyectar token:", e);
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
  async (error) => {
    const originalRequest = error.config;
    
    // --- Helper para mapear errores técnicos a humanos ---
    const getFriendlyMessage = (data: any): string | null => {
      if (!data) return null;
      if (typeof data === 'string') return data;
      
      if (typeof data === 'object') {
        if (data.message) return data.message;
        if (data.detail) return data.detail;

        if (data.error) return data.error;
        if (data.detail) return data.detail;

        const errorMap: Record<string, string> = {
          'non_field_errors': 'Credenciales o datos inválidos',
          'email': 'Correo electrónico',
          'username': 'Nombre de usuario',
          'password': 'Contraseña',
          'required': 'Este campo es obligatorio',
        };

        for (const key in data) {
          const fieldError = data[key];
          const friendlyKey = errorMap[key] || key;
          if (Array.isArray(fieldError)) return `${friendlyKey}: ${fieldError[0]}`;
          if (typeof fieldError === 'string') return fieldError;
        }
      }
      return null;
    };

    const serverMessage = getFriendlyMessage(error.response?.data);

    // Manejo Automático de Rotación de Tokens (401 Expirado o Token Inválido)
    const isInvalidToken = error.response?.data?.code === 'token_not_valid' || 
                          (error.response?.data?.detail && error.response.data.detail.includes('token not valid'));

    if (error.response?.status === 401 || isInvalidToken) {
      if (isInvalidToken) {
        // Si el token es basura/inválido, no intentamos refrescar, cerramos sesión de una.
        localStorage.removeItem('user');
        toast.error('Tu sesión es inválida. Inicia sesión de nuevo.');
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      if (!originalRequest._retry && !originalRequest.url?.includes('auth/') && !originalRequest.url?.includes('token/refresh/')) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({resolve, reject})
          }).then(() => {
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Solicitar rotación silenciosa al Backend
          await axios.post(`${api.defaults.baseURL}token/refresh/`, {}, { withCredentials: true, xsrfCookieName: 'csrftoken', xsrfHeaderName: 'X-CSRFToken' });
          processQueue(null, 'refreshed');
          return api(originalRequest); 
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem('user');
          
          const isPublicPath = window.location.pathname === '/' || window.location.pathname.startsWith('/auth');
          if (!isPublicPath) {
            toast.error('Tu sesión ha finalizado por seguridad. Inicia de nuevo.');
            window.location.href = '/auth/login';
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    // Si llegamos aquí y hay un mensaje de error, lo mostramos
    if (serverMessage && !originalRequest.url?.includes('auth/')) {
        toast.error(serverMessage);
    }

    return Promise.reject(error);
  }
);

export default api;
