import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';

function CartPage() {
  const { cart, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [inquiryForm, setInquiryForm] = useState({ name: '', whatsappNumber: '', address: '' });

  const handleInquiry = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_API_URL}/api/inquiry/cart`,
        user ? {} : inquiryForm,
        user ? { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } : {}
      );
      window.location.href = response.data.whatsappLink;
    } catch (error) {
      console.error('Error creating cart inquiry:', error);
      alert('Failed to create inquiry.');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {cart.map(product => (
                <div key={product._id} className="relative">
                  <ProductCard key={product._id} product={product} />
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    aria-label="Remove from cart"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/3">
            {!user && (
              <form onSubmit={handleInquiry} className="bg-white p-6 rounded-lg shadow-md">
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
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Cart Summary</h2>
                <p className="text-gray-600 mb-4">Total Items: {cart.length}</p>
                <button
                  onClick={handleInquiry}
                  className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Inquire via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;