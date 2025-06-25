import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext.jsx';

// Custom hook to use notifications - only use this in components, not in context providers
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return fallback functions instead of throwing an error
    return {
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      showLoading: () => null,
      removeNotification: () => {},
      addNotification: () => null,
      clearAllNotifications: () => {},
      notifications: [],
    };
  }
  return context;
}; 