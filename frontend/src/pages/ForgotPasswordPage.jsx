import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const { forgotPassword } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);
    } catch (err) {
      // Error handling is already done in AuthContext
      console.error('Forgot password error:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-md">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Forgot Password</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required', 
                pattern: { 
                  value: /^\S+@\S+$/i, 
                  message: 'Please enter a valid email address' 
                } 
              })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Send Reset Link
          </button>
        </form>
        
        <p className="text-center text-sm mt-4">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;