import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';
import toast from 'react-hot-toast';


interface User {
  id: string;
  email: string;
  username: string;
  role: 'CLIENTE' | 'VENDEDOR' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  hasToken: boolean;
  login: (userData: User, dummyToken?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
                logout();
            }
        }).catch((err) => {
          const status = err.response?.status;
          // 401/403 son errores esperados, cualquier otro (como 500) también limpiamos sesión
          if (status === 401 || status === 403 || status === 500 || status === 502) {
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
        // Tratar de recuperar la sesión silente si navegamos y hay una Cookie válida
        api.get('auth/me/').then(res => {
            if (res.data.isAuthenticated) {
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            }
        }).catch((err) => {
          const status = err.response?.status;
          // Ignoramos errores de autenticación pero no crasheamos la app
          if (status !== 401 && status !== 403 && status !== 500) {
            console.warn('Auth check failed:', err.message);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const login = (userData: User, dummyToken?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // NUNCA guardamos el Token en LocalStorage para evitar XSS.
    // El servidor lo ha guardado en una Cookie HttpOnly de este origen.
  };

  const logout = async () => {
    // 1. LIMPIEZA LOCAL INMEDIATA (Principio de Optimismo/Seguridad)
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.clear();

    try {
        // 2. Notificar al backend de forma secundaria
        await api.post('auth/logout/').catch((err) => {
          // Mostrar toast de advertencia si el logout backend falla
          console.warn('Logout backend warning:', err);
          toast.error('No se pudo cerrar sesión en el servidor. Por favor, inténtalo de nuevo.');
        }); 
    } catch (error) {
        // Ignoramos errores de red en logout, la prioridad es la limpieza local
    } finally {
        // 3. REDIRECCIÓN FORZADA PARA RESETEAR ESTADO GLOBAL
        window.location.href = '/';
    }
  };

   return (
      <AuthContext.Provider value={{ user, hasToken: !!user, login, logout, isAuthenticated: !!user, loading }}>
        {children}
      </AuthContext.Provider>
    );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
