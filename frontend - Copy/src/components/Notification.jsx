import { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'loading':
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getStyles = () => {
    const baseStyles = "flex items-start p-4 mb-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out transform";
    const visibilityStyles = isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0";
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-green-50 border-green-400 text-green-800`;
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case 'info':
        return `${baseStyles} ${visibilityStyles} bg-blue-50 border-blue-400 text-blue-800`;
      case 'loading':
        return `${baseStyles} ${visibilityStyles} bg-gray-50 border-gray-400 text-gray-800`;
      default:
        return `${baseStyles} ${visibilityStyles} bg-gray-50 border-gray-400 text-gray-800`;
    }
  };

  return (
    <div className={getStyles()}>
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="text-sm font-medium mb-1">
            {notification.title}
          </h4>
        )}
        <p className="text-sm">
          {notification.message}
        </p>
      </div>
      {notification.type !== 'loading' && (
        <button
          onClick={handleRemove}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification, clearAllNotifications } = useContext(NotificationContext);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] w-96 max-w-sm">
      {notifications.length > 1 && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={clearAllNotifications}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer; 