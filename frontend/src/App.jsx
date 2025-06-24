import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import LandingPage from './pages/LandingPage.jsx';
import ProductListingPage from './pages/ProductListingPage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import CartPage from './pages/CartPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage.jsx';
import DisclaimerPage from './pages/DisclaimerPage.jsx';
import ContactUsPage from './pages/ContactUsPage.jsx';
import { AuthContext, AuthProvider } from './context/AuthContext.jsx';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { NotificationContext, NotificationProvider } from './context/NotificationContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { createNotificationHelpers } from './utils/notificationUtils.js';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return children;
}

function AppContent() {
  const notificationContext = useContext(NotificationContext);
  const notificationHelpers = createNotificationHelpers(notificationContext);
  
  return (
    <AuthProvider notificationFunctions={notificationHelpers}>
      <CartProvider notificationFunctions={notificationHelpers}>
        <WishlistProvider notificationFunctions={notificationHelpers}>
          <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Notification />
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/products" element={<ProductListingPage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/:id" element={<CategoryPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                <Route path="/change-password" element={<ChangePasswordPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['user', 'staff', 'admin']}>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'staff']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;