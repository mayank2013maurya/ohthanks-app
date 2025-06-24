import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { CategoryContext } from '../context/CategoryContext.jsx';

function ProductListingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', price: '', stock: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { categories } = useContext(CategoryContext);
  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/products`);
        const allProducts = response.data;
        setTotalPages(Math.ceil(allProducts.length / productsPerPage));
        const start = (page - 1) * productsPerPage;
        const paginatedProducts = allProducts.slice(start, start + productsPerPage);
        setProducts(paginatedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page]);

  const filteredProducts = products.filter(product => {
    return (
      (!filters.category || product.category._id === filters.category) &&
      (!filters.price || (
        filters.price === 'low' ? product.price <= 2000 :
        filters.price === 'medium' ? product.price > 2000 && product.price <= 10000 :
        product.price > 10000
      )) &&
      (!filters.stock || (filters.stock === 'in' ? product.stockStatus : !product.stockStatus))
    );
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">All Products</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-1/4 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <select
              value={filters.price}
              onChange={e => setFilters({ ...filters, price: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Prices</option>
              <option value="low">Up to ₹2,000</option>
              <option value="medium">₹2,000 - ₹10,000</option>
              <option value="high">Above ₹10,000</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              value={filters.stock}
              onChange={e => setFilters({ ...filters, stock: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All</option>
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </aside>
        <div className="md:w-3/4">
          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <p className="text-center col-span-full text-gray-500">No products found.</p>
                )}
              </div>
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-800">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductListingPage;