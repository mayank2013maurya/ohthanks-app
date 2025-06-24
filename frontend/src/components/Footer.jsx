import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { NotificationContext } from '../context/NotificationContext.jsx';

function Footer() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useContext(NotificationContext);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!whatsappNumber.trim()) {
      showError('Please enter your WhatsApp number');
      return;
    }

    // Basic WhatsApp number validation
    const whatsappRegex = /^\d{10}$/;
    if (!whatsappRegex.test(whatsappNumber)) {
      showError('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/newsletter/subscribe`, {
        whatsappNumber: whatsappNumber.trim(),
        source: 'footer'
      });
      
      if (response.data.success) {
        showSuccess(response.data.message);
        setWhatsappNumber('');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      const message = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/ohthanks-icon.png"
                alt="Oh Thanks Logo"
                className="h-8 w-auto opacity-80"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Oh Thanks
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
            "Oh Thanks is your go-to destination for trendy fashion and thoughtful gifting. We blend style with sentiment, offering a curated collection of clothing, accessories, and unique gifts that make every moment special. Whether you're dressing up or celebrating someone, Oh Thanks helps you do it with flair and meaning.            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/ohthanks.in/" target="_blank" className="text-gray-400 hover:text-white transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="40" viewBox="0,0,256,256">
<g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style={{mixBlendMode: "normal"}}><g transform="scale(5.33333,5.33333)"><path d="M16.5,5c-6.33361,0 -11.5,5.16639 -11.5,11.5v15c0,6.33276 5.16621,11.5 11.5,11.5h15c6.33294,0 11.5,-5.16706 11.5,-11.5v-15c0,-6.33379 -5.16724,-11.5 -11.5,-11.5zM16.5,8h15c4.71124,0 8.5,3.78779 8.5,8.5v15c0,4.71106 -3.78894,8.5 -8.5,8.5h-15c-4.71221,0 -8.5,-3.78876 -8.5,-8.5v-15c0,-4.71239 3.78761,-8.5 8.5,-8.5zM34,12c-1.105,0 -2,0.895 -2,2c0,1.105 0.895,2 2,2c1.105,0 2,-0.895 2,-2c0,-1.105 -0.895,-2 -2,-2zM24,14c-5.50482,0 -10,4.49518 -10,10c0,5.50482 4.49518,10 10,10c5.50482,0 10,-4.49518 10,-10c0,-5.50482 -4.49518,-10 -10,-10zM24,17c3.88318,0 7,3.11682 7,7c0,3.88318 -3.11682,7 -7,7c-3.88318,0 -7,-3.11682 -7,-7c0,-3.88318 3.11682,-7 7,-7z"></path></g></g>
</svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></span>
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></span>
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></span>
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></span>
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Legal
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></span>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></span>
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-all duration-200 flex items-center group"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full mr-3 group-hover:bg-blue-500 transition-colors duration-200"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4 relative">
              Contact
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a className="hover:text-white transition-colors duration-200 cursor-pointer" href="mailto:support@ohthanks.in">support@ohthanks.in</a>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-400">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
                <a className="hover:text-white transition-colors duration-200 cursor-pointer" href="https://wa.me/919389807622">+91 9389-807-622</a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="pt-4">
              <h4 className="text-sm font-medium text-white mb-2">Stay Updated</h4>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Oh Thanks. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy
              </Link>
              <Link to="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms
              </Link>
              <Link to="/disclaimer" className="text-gray-400 hover:text-white transition-colors duration-200">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;