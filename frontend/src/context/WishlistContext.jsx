import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { handleApiError, NOTIFICATION_MESSAGES } from '../utils/notificationUtils';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children, notificationFunctions = null }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

  // Helper function to safely call notification functions
  const notify = (type, message, title) => {
    if (notificationFunctions && notificationFunctions[type]) {
      notificationFunctions[type](message, title);
    }
  };

  const showLoading = (message) => {
    if (notificationFunctions?.showLoading) {
      return notificationFunctions.showLoading(message);
    }
    return null;
  };

  const removeNotification = (id) => {
    if (notificationFunctions?.removeNotification && id) {
      notificationFunctions.removeNotification(id);
    }
  };

  useEffect(() => {
    const syncWishlist = async () => {
      if (user) {
        // Sync localStorage wishlist to backend
        const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (localWishlist.length > 0) {
          const productIds = localWishlist.map(item => item._id);
          try {
            await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/wishlist/sync`, { productIds }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            localStorage.removeItem('wishlist');
            notify('showSuccess', 'Your guest wishlist has been merged.');
          } catch (error) {
            console.error('Error syncing wishlist:', error);
            notify('showError', 'Failed to sync local wishlist.');
          }
        }
        
        // Fetch wishlist from backend
        try {
          const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/wishlist`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setWishlist(response.data);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          notify('showError', 'Failed to load wishlist');
        }
      } else {
        // Use localStorage for guest users
        const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlist(localWishlist);
      }
    };
    syncWishlist();
  }, [user]);

  const addToWishlist = async (product) => {
    const loadingId = showLoading('Adding to wishlist...');
    
    try {
      if (user) {
        await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/wishlist/${product._id}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setWishlist(response.data);
      } else {
        const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!localWishlist.find(item => item._id === product._id)) {
          localWishlist.push(product);
          localStorage.setItem('wishlist', JSON.stringify(localWishlist));
          setWishlist(localWishlist);
        }
      }
      
      removeNotification(loadingId);
      notify('showSuccess', NOTIFICATION_MESSAGES.PRODUCT_ADDED_TO_WISHLIST);
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    const loadingId = showLoading('Removing from wishlist...');
    
    try {
      if (user) {
        await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setWishlist(response.data);
      } else {
        const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]').filter(item => item._id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(localWishlist));
        setWishlist(localWishlist);
      }
      
      removeNotification(loadingId);
      notify('showSuccess', NOTIFICATION_MESSAGES.PRODUCT_REMOVED_FROM_WISHLIST);
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  };

  const clearWishlist = async () => {
    const loadingId = showLoading('Clearing wishlist...');
    
    try {
      if (user) {
        await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setWishlist([]);
      } else {
        localStorage.removeItem('wishlist');
        setWishlist([]);
      }
      
      removeNotification(loadingId);
      notify('showSuccess', 'Wishlist cleared successfully');
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError: (msg, title) => notify('showError', msg, title) });
      throw error;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};