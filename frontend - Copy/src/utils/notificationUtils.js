import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Utility function to handle API errors
export const handleApiError = (error, showNotification) => {
  let message = 'An unexpected error occurred';
  let title = 'Error';

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        title = 'Bad Request';
        message = data.message || 'Invalid request data';
        break;
      case 401:
        title = 'Unauthorized';
        message = 'Please log in to continue';
        break;
      case 403:
        title = 'Forbidden';
        message = 'You do not have permission to perform this action';
        break;
      case 404:
        title = 'Not Found';
        message = 'The requested resource was not found';
        break;
      case 409:
        title = 'Conflict';
        message = data.message || 'This resource already exists';
        break;
      case 422:
        title = 'Validation Error';
        message = data.message || 'Please check your input and try again';
        break;
      case 429:
        title = 'Too Many Requests';
        message = 'Please wait a moment before trying again';
        break;
      case 500:
        title = 'Server Error';
        message = 'Something went wrong on our end. Please try again later';
        break;
      default:
        message = data.message || `Server error (${status})`;
    }
  } else if (error.request) {
    // Network error
    title = 'Network Error';
    message = 'Unable to connect to the server. Please check your internet connection';
  } else {
    // Other error
    message = error.message || 'An unexpected error occurred';
  }

  showNotification.showError(message, title);
  return { message, title };
};

// Utility function to wrap API calls with loading and error handling
export const withNotification = async (apiCall, showNotification, options = {}) => {
  const {
    loadingMessage = 'Loading...',
    successMessage = 'Operation completed successfully',
    successTitle = 'Success',
    errorTitle = 'Error',
    showSuccess = true,
    showLoading = true,
  } = options;

  let loadingId = null;

  try {
    if (showLoading) {
      loadingId = showNotification.showLoading(loadingMessage);
    }

    const result = await apiCall();

    if (showLoading && loadingId) {
      showNotification.removeNotification(loadingId);
    }

    if (showSuccess) {
      showNotification.showSuccess(successMessage, successTitle);
    }

    return result;
  } catch (error) {
    if (showLoading && loadingId) {
      showNotification.removeNotification(loadingId);
    }

    handleApiError(error, showNotification);
    throw error;
  }
};

// Common notification messages
export const NOTIFICATION_MESSAGES = {
  // Auth messages
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGIN_ERROR: 'Invalid email or password',
  REGISTER_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Successfully logged out',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  EMAIL_VERIFICATION_SENT: 'Verification email sent successfully',
  EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully',
  EMAIL_VERIFICATION_REQUIRED: 'Please verify your email before logging in',

  // Product messages
  PRODUCT_ADDED_TO_CART: 'Product added to cart',
  PRODUCT_REMOVED_FROM_CART: 'Product removed from cart',
  PRODUCT_ADDED_TO_WISHLIST: 'Product added to wishlist',
  PRODUCT_REMOVED_FROM_WISHLIST: 'Product removed from wishlist',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_DELETED: 'Product deleted successfully',

  // Cart messages
  CART_CLEARED: 'Cart cleared successfully',
  CART_UPDATED: 'Cart updated successfully',
  CART_EMPTY: 'Your cart is empty',

  // Profile messages
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_LOAD_ERROR: 'Failed to load profile',

  // General messages
  SAVE_SUCCESS: 'Changes saved successfully',
  DELETE_SUCCESS: 'Item deleted successfully',
  UPDATE_SUCCESS: 'Item updated successfully',
  CREATE_SUCCESS: 'Item created successfully',
  NETWORK_ERROR: 'Network connection error',
  VALIDATION_ERROR: 'Please check your input and try again',
}; 