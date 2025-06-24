import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';

function UsersDashboard() {
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useContext(NotificationContext);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [showForm, setShowForm] = useState(false);
  const isNewUser = !editingUser;

  const fetchUsers = async () => {
    if (user.role !== 'admin') return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user.role]);

  useEffect(() => {
    if (showForm && !isNewUser) {
      setValue('name', editingUser.name);
      setValue('email', editingUser.email);
      setValue('whatsappNumber', editingUser.whatsappNumber);
      setValue('role', editingUser.role);
    } else {
      reset();
    }
  }, [showForm, editingUser, isNewUser, setValue, reset]);

  const onUserSubmit = async (data) => {
    try {
      if (isNewUser) {
        await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/users/staff`, data, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        showSuccess('User added successfully');
      } else {
        await axios.patch(
          `${import.meta.env.VITE_REACT_API_URL}/api/users/${editingUser._id}`,
          data,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        showSuccess('User updated successfully');
      }
      fetchUsers();
      reset();
      setShowForm(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      showError('Error saving user');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(users.filter(u => u._id !== userId));
      showSuccess('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Error deleting user. Please try again.';
      showError(errorMessage);
    }
  };
  
  const handleAddNewClick = () => {
    setEditingUser(null);
    setShowForm(true);
    reset();
  };
  
  const handleEditClick = (user) => {
      setEditingUser(user);
      setShowForm(true);
  }

  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    reset();
  };

  if (user.role !== 'admin') {
    return <p>You are not authorized to view this page.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <button onClick={handleAddNewClick} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add New User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onUserSubmit)} className="mb-8 p-4 border rounded">
          <h3 className="text-xl mb-4">{isNewUser ? 'Add New User' : 'Edit User'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input {...register('name', { required: true })} placeholder="Name" className="p-2 border rounded" />
            <input {...register('email', { required: true })} placeholder="Email" className="p-2 border rounded" />
            {isNewUser && (
                <input {...register('password', { required: true })} placeholder="Password" type="password" className="p-2 border rounded" />
            )}
            <input {...register('whatsappNumber')} placeholder="WhatsApp Number" className="p-2 border rounded" />
            <select {...register('role')} className="p-2 border rounded">
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                {isNewUser ? 'Add User' : 'Update User'}
            </button>
            <button type="button" onClick={cancelForm} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">WhatsApp</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Joined</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td className="py-2 px-4 border-b">{u.name}</td>
                <td className="py-2 px-4 border-b">{u.email}</td>
                <td className="py-2 px-4 border-b">{u.whatsappNumber}</td>
                <td className="py-2 px-4 border-b">{u.role}</td>
                <td className="py-2 px-4 border-b">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleEditClick(u)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => deleteUser(u._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersDashboard; 