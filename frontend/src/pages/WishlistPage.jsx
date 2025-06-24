import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Link } from 'react-router-dom';

function WishlistPage() {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  if (!user && wishlist.length === 0) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Your Wishlist</h1>
        <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
        <p className="text-gray-500">
          <Link to="/login" className="text-blue-600 hover:underline">Log in</Link> to see your wishlist or start adding products.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <p className="text-center text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map(product => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={() => addToCart(product._id)}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  aria-label="Add to cart"
                  disabled={!product.stockStatus}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;