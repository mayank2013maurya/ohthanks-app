import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { CategoryContext } from '../../context/CategoryContext.jsx';
import { NotificationContext } from '../../context/NotificationContext.jsx';

function CategoriesDashboard() {
  const { categories, fetchCategories } = useContext(CategoryContext);
  const { showSuccess, showError } = useContext(NotificationContext);
  const [editingCategory, setEditingCategory] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setValue('name', editingCategory.name);
      setValue('description', editingCategory.description);
      setShowForm(true);
    } else {
      reset();
    }
  }, [editingCategory, setValue, reset]);

  const onCategorySubmit = async (data) => {
    try {
      if (editingCategory) {
        await axios.patch(
          `${import.meta.env.VITE_REACT_API_URL}/api/categories/${editingCategory._id}`,
          data,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_REACT_API_URL}/api/categories`,
          data,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
      }
      fetchCategories();
      reset();
      setEditingCategory(null);
      setShowForm(false);
      showSuccess('Category saved successfully');
    } catch (error) {
      console.error('Error saving category:', error);
      showError('Error saving category');
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchCategories();
      showSuccess('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || 'Error deleting category. Please try again.';
      showError(errorMessage);
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setShowForm(false);
    reset();
  };
  
  const handleAddNewClick = () => {
    setEditingCategory(null);
    reset();
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Categories</h2>
        <button onClick={handleAddNewClick} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add New Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCategorySubmit)} className="mb-8 p-4 border rounded">
          <h3 className="text-xl mb-4">{editingCategory ? 'Edit Category' : 'Add a new category'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input {...register('name', { required: true })} placeholder="Name" className="p-2 border rounded" />
            <textarea {...register('description')} placeholder="Description" className="p-2 border rounded"></textarea>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mr-2">
              {editingCategory ? 'Update' : 'Add'} Category
            </button>
            <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul>
        {categories.map(category => (
          <li key={category._id} className="border p-4 rounded mb-2 flex justify-between items-center">
            <div>
              <h4 className="font-bold">{category.name}</h4>
              <p>{category.description}</p>
              <p className="text-sm text-gray-500 mt-2">Created: {new Date(category.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex">
              <button
                onClick={() => setEditingCategory(category)}
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => deleteCategory(category._id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoriesDashboard; 