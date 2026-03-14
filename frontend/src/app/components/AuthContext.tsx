import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, name: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('deepfake_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string) => {
    // Demo: Check against stored users or use demo credentials
    const users = JSON.parse(localStorage.getItem('deepfake_users') || '[]');
    
    // Admin demo account
    if (email === 'admin@deepfake.com' && password === 'admin123') {
      const adminUser = {
        id: 'admin-1',
        email: 'admin@deepfake.com',
        name: 'Admin User',
        role: 'admin' as const
      };
      setUser(adminUser);
      localStorage.setItem('deepfake_user', JSON.stringify(adminUser));
      return true;
    }

    // Regular user check
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role || 'user'
      };
      setUser(userData);
      localStorage.setItem('deepfake_user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const signup = (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem('deepfake_users') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return false;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: 'user' as const
    };

    users.push(newUser);
    localStorage.setItem('deepfake_users', JSON.stringify(users));

    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };
    setUser(userData);
    localStorage.setItem('deepfake_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('deepfake_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated: !!user
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
