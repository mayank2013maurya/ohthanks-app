import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.jsx';

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({ name: '', whatsappNumber: '', address: '' });
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_API_URL}/api/inquiry/product/${id}`,
        user ? {} : inquiryForm,
        user ? { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } : {}
      );
      window.location.href = response.data.whatsappLink;
    } catch (error) {
      console.error('Error creating inquiry:', error);
      alert('Failed to create inquiry.');
    }
  };

  if (loading) return <ProductCardSkeleton />;
  if (!product) return <p className="text-center text-gray-500">Product not found.</p>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline flex items-center"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <img
            src={product.images[currentImage] ? `${import.meta.env.VITE_REACT_API_URL}/${product.images[currentImage]}` : 'placeholder.jpg'}
            alt={product.title}
            className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-md"
            loading="lazy"
          />
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={`${import.meta.env.VITE_REACT_API_URL}/${image}`}
                alt={`${product.title} ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-md cursor-pointer ${currentImage === index ? 'border-2 border-blue-600' : 'border'}`}
                onClick={() => setCurrentImage(index)}
              />
            ))}
          </div>
        </div>
        <div className="lg:w-1/2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">{product.title}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-xl font-semibold text-gray-800 mb-2">₹{product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-2">Category: {product.category?.name || 'N/A'}</p>
          <p className="text-sm text-green-600 mb-4">{product.stockStatus ? 'In Stock' : 'Out of Stock'}</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => addToCart(product._id)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={!product.stockStatus}
            >
              Add to Cart
            </button>
            <button
              onClick={() => addToWishlist(product)}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Add to Wishlist
            </button>
          </div>
          {!user && (
            <form onSubmit={handleInquiry} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Inquire via WhatsApp</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={inquiryForm.name}
                  onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input
                  type="tel"
                  value={inquiryForm.whatsappNumber}
                  onChange={e => setInquiryForm({ ...inquiryForm, whatsappNumber: e.target.value })}
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                <input
                  type="text"
                  value={inquiryForm.address}
                  onChange={e => setInquiryForm({ ...inquiryForm, address: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Inquire via WhatsApp
              </button>
            </form>
          )}
          {user && (
            <button
              onClick={handleInquiry}
              className="w-full mt-4 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Inquire via WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;