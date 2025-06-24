import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { CategoryContext } from '../context/CategoryContext.jsx';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { categories, fetchCategories } = useContext(CategoryContext);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoriesClick = (e) => {
    e.preventDefault();
    setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen);
  };

  const closeDropdowns = () => {
    setIsCategoriesDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-xl backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/ohthanks-icon.png" 
                alt="Oh Thanks Logo" 
                className="h-10 w-auto lg:h-12 transition-transform duration-300 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="hidden sm:block text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Oh Thanks
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 relative z-60"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} 
              />
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/" 
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            
            <Link 
              to="/products" 
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">Products</span>
              <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            
            {/* Desktop Categories Dropdown */}
            <div className="relative">
              <button
                onClick={handleCategoriesClick}
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium flex items-center space-x-1 relative group"
              >
                <span className="relative z-10">Categories</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
              
              {/* Desktop Dropdown Menu */}
              <div className={`${isCategoriesDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'} absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-white/20 min-w-64 z-50 transition-all duration-200`}>
                <div className="p-2">
                  <Link 
                    to="/categories" 
                    className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 font-medium"
                    onClick={closeDropdowns}
                  >
                    All Categories
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/categories/${category._id}`}
                      className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 flex items-center space-x-3"
                      onClick={closeDropdowns}
                    >
                      {category.randomImage ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200">
                          <img 
                            src={`${import.meta.env.VITE_REACT_API_URL}/${category.randomImage}`}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-4 py-3 text-gray-500 text-sm italic">
                      No categories available
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link 
              to="/cart" 
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">Cart</span>
              <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            
            <Link 
              to="/wishlist" 
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">Wishlist</span>
              <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            
            <Link 
              to="/contact" 
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium relative group"
            >
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </Link>
            
            {user ? (
              <Link 
                to="/profile" 
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium relative group"
              >
                <span className="relative z-10">Profile</span>
                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium relative group"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            )}
            
            {user && (user.role === 'admin' || user.role === 'staff') && (
              <Link 
                to="/admin" 
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 font-medium relative group border border-white/20"
              >
                <span className="relative z-10">{user.role === 'admin' ? 'Admin' : 'Staff'}</span>
                <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-gradient-to-b from-blue-600 to-indigo-700 border-t border-white/10 relative z-40`}>
        <nav className="px-4 py-6 space-y-2">
          <Link 
            to="/" 
            className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium" 
            onClick={closeDropdowns}
          >
            Home
          </Link>
          
          <Link 
            to="/products" 
            className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium" 
            onClick={closeDropdowns}
          >
            Products
          </Link>
          
          {/* Mobile Categories Section */}
          <div className="border-t border-white/10 pt-2">
            <button
              onClick={handleCategoriesClick}
              className="w-full text-left py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium flex items-center justify-between"
            >
              Categories
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Mobile Categories Dropdown */}
            <div className={`${isCategoriesDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300 ease-in-out ml-4 mt-2 border-l-2 border-white/20`}>
              <div className="space-y-1 py-2">
                <Link 
                  to="/categories" 
                  className="block py-2 px-4 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={closeDropdowns}
                >
                  All Categories
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/categories/${category._id}`}
                    className="block py-2 px-4 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 flex items-center space-x-3"
                    onClick={closeDropdowns}
                  >
                    {category.randomImage ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                        <img 
                          src={`${import.meta.env.VITE_REACT_API_URL}/${category.randomImage}`}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/20">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    )}
                    <span>{category.name}</span>
                  </Link>
                ))}
                {categories.length === 0 && (
                  <div className="py-2 px-4 text-blue-200 text-sm italic">
                    No categories available
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link 
            to="/cart" 
            className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium" 
            onClick={closeDropdowns}
          >
            Cart
          </Link>
          
          {user && (
            <Link 
              to="/wishlist" 
              className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium" 
              onClick={closeDropdowns}
            >
              Wishlist
            </Link>
          )}
          
          <Link 
            to="/contact" 
            className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium" 
            onClick={closeDropdowns}
          >
            Contact
          </Link>
          
          {user ? (
            <Link 
              to="/profile" 
              className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium" 
              onClick={closeDropdowns}
            >
              Profile
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium" 
              onClick={closeDropdowns}
            >
              Login
            </Link>
          )}
          
          {user && (user.role === 'admin' || user.role === 'staff') && (
            <Link 
              to="/admin" 
              className="block py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 font-medium border border-white/20" 
              onClick={closeDropdowns}
            >
              {user.role === 'admin' ? 'Admin' : 'Staff'}
            </Link>
          )}
        </nav>
      </div>
      
      {/* Overlay for mobile dropdown */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={closeDropdowns}
        />
      )}
    </header>
  );
}

export default Header;