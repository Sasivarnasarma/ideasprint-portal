import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthAPI } from '../api/admin';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const userData = await adminAuthAPI.getMe();
          setAdminUser(userData);
        } catch (error) {
          console.error('Failed to verify session', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminRole');
        }
      }
      setIsLoading(false);
    };
    verifyToken();
  }, []);

  const login = (token, role, username) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminRole', role);
    setAdminUser({ username, role });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    setAdminUser(null);
  };

  const value = {
    adminUser,
    isLoading,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export default AdminAuthContext;
