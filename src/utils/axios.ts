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

// Request interceptor para monitoreo ligero
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
    const originalRequest = error.config;
    // Si hay un mensaje estructurado proveído por nuestro custom exception handler de DRF
    const serverMessage = error.response?.data?.message;

    // Manejo Automático de Rotación de Tokens (401 Expirado)
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('auth/') && !originalRequest.url?.includes('token/refresh/')) {
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
        // Solicitar rotación silenciosa al Backend FAANG (CustomTokenRefreshView)
        // Usamos axios plano para no caer en el interceptor circular
        await axios.post(`${api.defaults.baseURL}token/refresh/`, {}, { withCredentials: true, xsrfCookieName: 'csrftoken', xsrfHeaderName: 'X-CSRFToken' });
        processQueue(null, 'refreshed');
        return api(originalRequest); // Repetir la solicitud fallida transparente!
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
    
    // Si falla 401 directo en endpoints auth o login (no es rotatorio)
    if (error.response?.status === 401 && originalRequest.url?.includes('auth/')) {
      if (!originalRequest.url?.includes('me/')) {
         toast.error(serverMessage || 'Acceso Denegado.');
      }
    } else if (error.response?.status === 403) {
      toast.error(serverMessage || 'No tienes permisos para realizar esta acción.');
    } else if (error.response?.status >= 500) {
      toast.error('Error interno del servidor. Intenta de nuevo más tarde.');
    } else if (serverMessage) {
      // Cualquier otro error manejado por el backend con mensaje válido (Ej: 400 Bad Request)
      toast.error(serverMessage);
    } else if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      // Ignoramos errores de red momentáneos para evitar cierres de sesión agresivos
      console.warn('Micro-corte de red detectado. Reintentando silenciosamente o esperando estabilidad.');
    } else {
      toast.error('Ocurrió un error inesperado en la solicitud.');
    }

    return Promise.reject(error);
  }
);

export default api;
