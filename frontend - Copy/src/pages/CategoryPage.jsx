import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';

function CategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const [categoryResponse, productsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/categories/${id}`),
          axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/products?category=${id}`)
        ]);
        setCategory(categoryResponse.data);
        setProducts(productsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching category/products:', error);
        setLoading(false);
      }
    };
    fetchCategoryAndProducts();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!category) return <p className="text-center text-gray-500">Category not found.</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">{category.name}</h1>
      <p className="text-gray-600 mb-6">{category.description || 'No description available.'}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">No products in this category.</p>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;