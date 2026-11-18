import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexis_token') || null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await authApi.getMe();
      if (data.success) {
        setUser(data.user);
        if (data.studentProfile) {
          setStudentProfile(data.studentProfile);
        }
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      logout(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      if (data.success && data.token) {
        localStorage.setItem('nexis_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`, 'Signed In');
        return data.user;
      }
    } catch (err) {
      toast.error(err.message, 'Login Failed');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      if (data.success && data.token) {
        localStorage.setItem('nexis_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success('Your portal account has been created!', 'Account Registered');
        return data.user;
      }
    } catch (err) {
      toast.error(err.message, 'Registration Failed');
      throw err;
    }
  };

  const logout = async (showNotification = true) => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('nexis_token');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
    if (showNotification) {
      toast.info('You have been logged out securely.', 'Signed Out');
    }
  };

  const updateStudentProfileData = async (payload) => {
    try {
      const data = await authApi.updateStudentProfile(payload);
      if (data.success) {
        setStudentProfile(data.profile);
        toast.success('Your student profile was updated.', 'Profile Saved');
        return data.profile;
      }
    } catch (err) {
      toast.error(err.message, 'Update Failed');
      throw err;
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const value = {
    user,
    studentProfile,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFaculty: user?.role === 'faculty',
    isStudent: user?.role === 'student',
    login,
    register,
    logout,
    refreshUser,
    updateStudentProfileData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
