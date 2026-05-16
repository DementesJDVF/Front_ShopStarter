import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

declare global {
  interface Window {
    __isLoggingOut?: boolean;
  }
}

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
    // Si acabamos de hacer logout, no ejecutar auth/me
    if (sessionStorage.getItem('__logging_out') === 'true') {
      sessionStorage.removeItem('__logging_out');
      setLoading(false);
      return;
    }
    
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Validación silenciosa obligatoria de sesión HttpOnly contra el servidor
        api.get('auth/me/').then(res => {
            if (res.data.isAuthenticated) {
                setUser(res.data);
            } else {
                // El servidor dice que no estamos autenticados (200 OK pero con flag false)
                // Solo hacer logout si no estamos ya en proceso de logout
                if (!window.__isLoggingOut) {
                  logout();
                }
            }
        }).catch((err) => {
          if (!window.__isLoggingOut && (err.response?.status === 401 || err.response?.status === 403)) {
            logout();
          }
        }).finally(() => {
          setLoading(false);
        });

      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
        setLoading(false);
    }
  }, []);

  const login = (userData: User, dummyToken?: string) => {
    window.__isLoggingOut = false;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // NUNCA guardamos el Token en LocalStorage para evitar XSS.
    // El servidor lo ha guardado en una Cookie HttpOnly de este origen.
  };

   const logout = async () => {
      // Marcar que estamos en logout para prevenir bucle
      sessionStorage.setItem('__logging_out', 'true');
      window.__isLoggingOut = true;
      
      // 1. LIMPIEZA LOCAL INMEDIATA (Principio de Optimismo/Seguridad)
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // 2. REDIRECCIÓN INMEDIATA - no esperar al backend
      window.location.replace('/');
   };

  return (
    <AuthContext.Provider value={{ user, token: "secure_httponly_token", login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
