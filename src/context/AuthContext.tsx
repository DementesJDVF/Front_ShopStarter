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
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (storedAccessToken) setToken(storedAccessToken);
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Validación silenciosa obligatoria de sesión HttpOnly contra el servidor
        api.get('auth/me/').then(res => {
            setUser(res.data);
        }).catch((err) => {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
        }).finally(() => {
          setLoading(false);
        });

      } catch (e) {
        logout();
      }
    } else {
        // Evitar llamadas innecesarias (y 401 en consola) para usuarios invitados.
        // Solo intentamos recuperación silente si existe algún token persistido.
        if (storedAccessToken) {
          api.get('auth/me/').then(res => {
              setUser(res.data);
              localStorage.setItem('user', JSON.stringify(res.data));
          }).catch(() => {}).finally(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
        return;
    }
    setLoading(false);
  }, []);

  const login = (userData: User, accessToken?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (accessToken) {
      setToken(accessToken);
      sessionStorage.setItem('access_token', accessToken);
    }
    // NUNCA guardamos el Token en LocalStorage para evitar XSS.
    // El servidor lo ha guardado en una Cookie HttpOnly de este origen.
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
        localStorage.removeItem('access_token');
        sessionStorage.removeItem('access_token');
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
