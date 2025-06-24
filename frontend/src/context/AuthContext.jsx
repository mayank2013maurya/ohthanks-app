import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { handleApiError, NOTIFICATION_MESSAGES } from '../utils/notificationUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children, notificationFunctions = null }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to safely call notification functions
  const notify = useCallback((type, message, title) => {
    if (notificationFunctions && notificationFunctions[type]) {
      notificationFunctions[type](message, title);
    }
  }, [notificationFunctions]);

  const showLoading = useCallback((message) => {
    if (notificationFunctions?.showLoading) {
      return notificationFunctions.showLoading(message);
    }
    return null;
  }, [notificationFunctions]);

  const removeNotification = useCallback((id) => {
    if (notificationFunctions?.removeNotification && id) {
      notificationFunctions.removeNotification(id);
    }
  }, [notificationFunctions]);

  useEffect(() => {
    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
          } catch (error) {
            localStorage.removeItem('token');
            // Don't show notification for auto-login failures
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
    }
    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    const loadingId = showLoading('Logging in...');
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/auth/login`, { email, password });
      
      // Check if user needs email verification
      if (response.data.requiresVerification) {
        removeNotification(loadingId);
        notify('showError', 'Please verify your email before logging in. Check your inbox for a verification link.');
        throw new Error('Email verification required');
      }
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      removeNotification(loadingId);
      notify('showSuccess', NOTIFICATION_MESSAGES.LOGIN_SUCCESS);
      return response.data;
    } catch (error) {
      removeNotification(loadingId);
      
      // Check if it's an email verification error (401 status)
      if (error.response && error.response.status === 401 && error.response.data && error.response.data.requiresVerification) {
        notify('showError', 'Please verify your email before logging in. Check your inbox for a verification link.');
        throw new Error('Email verification required');
      }
      
      // Handle other errors
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  }, [showLoading, removeNotification, notify]);

  const register = useCallback(async (name, email, whatsappNumber, password) => {
    const loadingId = showLoading('Creating account...');
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/auth/register`, {
        name,
        email,
        whatsappNumber,
        password,
      });
      
      removeNotification(loadingId);
      
      // Check if verification is required
      if (response.data.requiresVerification) {
        notify('showSuccess', 'Registration successful! Please check your email to verify your account.');
        return { requiresVerification: true, email };
      }
      
      // If no verification required (shouldn't happen with new system)
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      notify('showSuccess', NOTIFICATION_MESSAGES.REGISTER_SUCCESS);
      return response.data;
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  }, [showLoading, removeNotification, notify]);

  const verifyEmail = useCallback(async (token) => {
    const loadingId = showLoading('Verifying email...');
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/auth/verify-email/${token}`);
      removeNotification(loadingId);
      notify('showSuccess', 'Email verified successfully! You can now log in.');
      return response.data;
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  }, [showLoading, removeNotification, notify]);

  const resendVerification = useCallback(async (email) => {
    const loadingId = showLoading('Sending verification email...');
    
    try {
      await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/auth/resend-verification`, { email });
      removeNotification(loadingId);
      notify('showSuccess', 'Verification email sent successfully! Please check your inbox.');
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  }, [showLoading, removeNotification, notify]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    notify('showSuccess', NOTIFICATION_MESSAGES.LOGOUT_SUCCESS);
  }, [notify]);

  const forgotPassword = useCallback(async (email) => {
    const loadingId = showLoading('Sending reset email...');
    
    try {
      await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/auth/forgot-password`, { email });
      removeNotification(loadingId);
      notify('showSuccess', NOTIFICATION_MESSAGES.PASSWORD_RESET_SENT);
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  }, [showLoading, removeNotification, notify]);

  const resetPassword = useCallback(async (token, password) => {
    const loadingId = showLoading('Resetting password...');
    
    try {
      await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/auth/reset-password`, { token, password });
      removeNotification(loadingId);
      notify('showSuccess', NOTIFICATION_MESSAGES.PASSWORD_RESET_SUCCESS);
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  }, [showLoading, removeNotification, notify]);

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    const loadingId = showLoading('Changing password...');
    
    try {
      await axios.patch(
        `${import.meta.env.VITE_REACT_API_URL}/api/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      removeNotification(loadingId);
      notify('showSuccess', NOTIFICATION_MESSAGES.PASSWORD_CHANGED);
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  }, [showLoading, removeNotification, notify]);

  const updateProfile = useCallback(async (profileData) => {
    const loadingId = showLoading('Updating profile...');
    
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_API_URL}/api/users/me`,
        profileData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setUser(response.data);
      removeNotification(loadingId);
      notify('showSuccess', NOTIFICATION_MESSAGES.PROFILE_UPDATED);
      return response.data;
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  }, [showLoading, removeNotification, notify]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      forgotPassword, 
      resetPassword, 
      changePassword,
      updateProfile,
      verifyEmail,
      resendVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};