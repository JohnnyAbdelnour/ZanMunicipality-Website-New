
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AppUser } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AppUser | null;
  login: (user: AppUser) => void;
  logout: () => void;
  hasPermission: (module: string) => boolean;
  isLoading: boolean;
  logoUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'); // Transparent placeholder

  useEffect(() => {
    // 1. Check local storage for session
    const storedUser = localStorage.getItem('zan_admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Fetch Logo from Settings
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from('settings').select('data').eq('id', 1).single();
        if (data && data.data && data.data.logo) {
          setLogoUrl(data.data.logo);
        }
      } catch (error) {
        console.error("Error fetching logo settings:", error);
      }
    };
    
    fetchSettings();
    setIsLoading(false);
  }, []);

  const login = (userData: AppUser) => {
    setUser(userData);
    localStorage.setItem('zan_admin_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zan_admin_user');
  };

  const hasPermission = (module: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin' || (user.permissions && user.permissions.includes('all'))) return true;
    return user.permissions.includes(module);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isLoading, logoUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
