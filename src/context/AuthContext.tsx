import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearAuthStorage } from '../utils/axios';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'CLIENTE' | 'VENDEDOR' | 'ADMIN';
}

interface LoginResponse {
  access?: string;
  access_token?: string;
  refresh?: string;
  user: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const response = await api.get<AuthUser>('api/auth/me/');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      setUser(null);
      clearAuthStorage();
      throw error;
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const response = await api.post<LoginResponse>('users/auth/login/', { email, password });
    const accessToken = response.data.access ?? response.data.access_token;

    if (!accessToken || !response.data.refresh || !response.data.user) {
      throw new Error('Respuesta de login inválida: faltan tokens o usuario');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    setUser(response.data.user);
    return response.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('auth/logout/');
    } catch (_error) {
      // No bloqueamos el cierre de sesión local por fallo del backend.
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const bootstrapSession = async () => {
      const hasToken = Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
      const cachedUser = localStorage.getItem('user');

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }

      if (!hasToken) {
        setLoading(false);
        return;
      }

      try {
        await loadUser();
      } catch {
        // loadUser limpia estado si falla
      } finally {
        setLoading(false);
      }
    };

    void bootstrapSession();
  }, [loadUser]);

  useEffect(() => {
    const handleForcedLogout = async () => {
      await logout();
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [logout]);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      loadUser,
    }),
    [user, loading, login, logout, loadUser],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
