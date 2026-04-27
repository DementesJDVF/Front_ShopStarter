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
        });

      } catch (e) {
        logout();
      }
    } else {
        // Tratar de recuperar la sesión silente si navegamos y hay una Cookie válida
        api.get('auth/me/').then(res => {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
        }).catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = (userData: User, dummyToken?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // NUNCA guardamos el Token en LocalStorage para evitar XSS.
    // El servidor lo ha guardado en una Cookie HttpOnly de este origen.
  };

  const logout = () => {
    // 1. Invalidad sesión en el servidor (Eliminar Cookies HttpOnly)
    api.post('auth/logout/').catch(() => {
        // Si falla (ej: sin red), intentamos por GET como respaldo
        api.get('auth/logout/').catch(() => {});
    });

    // 2. Limpieza de estado local
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Opcional: Redirigir al login
    window.location.href = '/auth/login';
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
