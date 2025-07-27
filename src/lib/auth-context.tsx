import type { User, RegisterData } from './api';
import React, { useState, useEffect, type ReactNode } from 'react';
import { authService } from './api';
import { AuthContext } from './auth-context-def';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const { user } = await authService.me();
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        } catch {
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authService.register(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no registro';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 