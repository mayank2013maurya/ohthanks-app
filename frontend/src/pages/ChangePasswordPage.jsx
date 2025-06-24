import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

function ChangePasswordPage() {
  const { changePassword, user } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    return <Navigate to="/login" />;
  }

  const onSubmit = async (data) => {
    try {
      await changePassword(data.oldPassword, data.newPassword);
      setMessage('Password changed successfully.');
      setError('');
    } catch (err) {
      setError('Failed to change password.');
      setMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-md">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">Change Password</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Old Password</label>
            <input
              type="password"
              {...register('oldPassword', { required: 'Old password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            />
            {errors.oldPassword && <p className="text-red-600 text-sm">{errors.oldPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600"
            />
            {errors.newPassword && <p className="text-red-600 text-sm">{errors.newPassword.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;