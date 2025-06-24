import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const { register: registerUser, resendVerification } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data.name, data.email, data.whatsappNumber, data.password);
      
      if (result && result.requiresVerification) {
        setRequiresVerification(true);
        setUserEmail(data.email);
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.message === 'Email verification required') {
        setRequiresVerification(true);
        setUserEmail(data.email);
      } else {
        setError('Registration failed');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification(userEmail);
    } catch (err) {
      setError('Failed to resend verification email');
    }
  };

  if (requiresVerification) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Verify Your Email</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification link to <strong>{userEmail}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in your email to verify your account and start using Oh Thanks.
            </p>
          </div>

          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Resend Verification Email
            </button>
            
            <Link
              to="/login"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back to Login
            </Link>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Didn't receive the email?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes and try resending</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-md">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Register</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
            <input
              type="tel"
              {...register('whatsappNumber', { required: 'WhatsApp number is required', pattern: { value: /^\d{10}$/, message: 'Please enter a 10-digit phone number' } })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            />
            {errors.whatsappNumber && <p className="text-red-600 text-sm">{errors.whatsappNumber.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;