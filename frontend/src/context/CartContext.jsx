import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext.jsx';
import { useNotifications, handleApiError, NOTIFICATION_MESSAGES } from '../utils/notificationUtils';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);
  const { showSuccess, showError, showLoading, removeNotification } = useNotifications();

  const fetchFullProducts = async (productIds) => {
    try {
      const products = await Promise.all(
        productIds.map(id => 
          axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/products/${id}`)
            .then(response => response.data)
        )
      );
      return products;
    } catch (error) {
      console.error('Error fetching full products:', error);
      showError('Failed to load cart items');
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch cart from backend
      axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then(response => setCart(response.data))
        .catch(error => {
          console.error('Error fetching cart:', error);
          showError('Failed to load cart');
        });

      // Sync localStorage cart to backend
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/cart/sync`, { cart: localCart }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
          .then(response => {
            setCart(response.data);
            localStorage.removeItem('cart');
            showSuccess('Cart synced successfully');
          })
          .catch(error => {
            console.error('Error syncing cart:', error);
            showError('Failed to sync cart');
          });
      }
    } else {
      // Use localStorage for guest users and fetch full product data
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        fetchFullProducts(localCart).then(products => setCart(products));
      } else {
        setCart([]);
      }
    }
  }, [user]);

  const addToCart = async (productId) => {
    const loadingId = showLoading('Adding to cart...');
    
    try {
      if (user) {
        await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/cart/${productId}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCart(response.data);
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!localCart.includes(productId)) {
          localCart.push(productId);
          localStorage.setItem('cart', JSON.stringify(localCart));
          const products = await fetchFullProducts(localCart);
          setCart(products);
        }
      }
      
      removeNotification(loadingId);
      showSuccess(NOTIFICATION_MESSAGES.PRODUCT_ADDED_TO_CART);
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError });
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    const loadingId = showLoading('Removing from cart...');
    
    try {
      if (user) {
        await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/cart/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCart(response.data);
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]').filter(id => id !== productId);
        localStorage.setItem('cart', JSON.stringify(localCart));
        if (localCart.length > 0) {
          const products = await fetchFullProducts(localCart);
          setCart(products);
        } else {
          setCart([]);
        }
      }
      
      removeNotification(loadingId);
      showSuccess(NOTIFICATION_MESSAGES.PRODUCT_REMOVED_FROM_CART);
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError });
      throw error;
    }
  };

  const clearCart = async () => {
    const loadingId = showLoading('Clearing cart...');
    
    try {
      if (user) {
        await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCart([]);
      } else {
        localStorage.removeItem('cart');
        setCart([]);
      }
      
      removeNotification(loadingId);
      showSuccess(NOTIFICATION_MESSAGES.CART_CLEARED);
    } catch (error) {
      removeNotification(loadingId);
      handleApiError(error, { showError });
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};