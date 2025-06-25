import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext.jsx';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ResetPasswordPage() {
  const { resetPassword } = useContext(AuthContext);
  const { token } = useParams();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Watch password for confirmation validation
  const password = watch('password');

  useEffect(() => {
    // Validate token format
    if (!token) {
      setIsValidToken(false);
      setError('No reset token provided. Please use the link from your email.');
      return;
    }

    if (token.length < 10) {
      setIsValidToken(false);
      setError('Invalid reset link format. Please request a new password reset.');
      return;
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!isValidToken) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await resetPassword(token, data.password);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Error handling is already done in AuthContext
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Invalid Reset Link</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          
          <Link 
            to="/forgot-password" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Request New Reset Link
          </Link>
          <p className="text-center text-sm mt-4">
            <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-md">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Reset Password</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600 text-center">
            Enter your new password below. Make sure it's secure and at least 6 characters long.
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              {...register('password', { 
                required: 'Password is required', 
                minLength: { 
                  value: 6, 
                  message: 'Password must be at least 6 characters' 
                } 
              })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Enter new password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
        
        <p className="text-center text-sm mt-4">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;