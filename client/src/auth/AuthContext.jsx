import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await axiosClient.get('/auth/connect-user');
      setUser(res.data.user);
    } catch (err) {
      console.error('Auth check failed:', err.response?.data?.message || err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await axiosClient.get('/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err.response?.data?.message || err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, justLoggedIn, setJustLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};