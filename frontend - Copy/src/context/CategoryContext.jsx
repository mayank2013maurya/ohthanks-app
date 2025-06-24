import { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/categories`);
      console.log(response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};