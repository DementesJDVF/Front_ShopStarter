import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';


interface User {
  id: string;
  email: string;
  username: string;
  role: 'CLIENTE' | 'VENDEDOR' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const isPublicPath = window.location.pathname === '/' || window.location.pathname.startsWith('/auth');

      try {
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Validación silenciosa de sesión HttpOnly contra el servidor
          const res = await api.get('auth/me/');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          return;
        }

        // Evitamos 401 innecesario en páginas públicas cuando no hay sesión local
        if (!isPublicPath) {
          const res = await api.get('auth/me/');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setUser(null);
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = (userData: User, accessToken: string, refreshToken?: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access', accessToken);
    if (refreshToken) localStorage.setItem('refresh', refreshToken);
  };

  const logout = async () => {
    try {
        // 1. Notificar al backend para invalidar la sesión y borrar Cookies HttpOnly
        await api.post('auth/logout/');
    } catch (error) {
        console.error("Logout falló en servidor, forzando limpieza local:", error);
    } finally {
        // 2. LIMPIEZA ABSOLUTA DE ESTADO (Principio Fail-Secure)
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Por si acaso hubiera basura
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setToken(null);
        sessionStorage.clear();
        
        // 3. REDIRECCIÓN FORZADA
        // Usamos window.location.href para resetear todo el estado de React y la caché
        window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
