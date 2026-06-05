import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, name: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('deepfake_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.getCurrentUser();
        setUser(response.data.user);
      } catch {
        localStorage.removeItem('deepfake_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    localStorage.setItem('deepfake_token', response.data.token);
    setUser(response.data.user);
    return response.data.user as User;
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await apiService.signup(email, password, name);
    localStorage.setItem('deepfake_token', response.data.token);
    setUser(response.data.user);
    return response.data.user as User;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('deepfake_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
