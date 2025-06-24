import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { CategoryContext } from '../../context/CategoryContext';
import { NotificationContext } from '../../context/NotificationContext';
import ProductCard from '../ProductCard';

function ProductsDashboard() {
  const { categories } = useContext(CategoryContext);
  const { showSuccess, showError } = useContext(NotificationContext);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setValue('title', editingProduct.title);
      setValue('description', editingProduct.description);
      setValue('price', editingProduct.price);
      setValue('category', editingProduct.category._id);
      setValue('stockStatus', editingProduct.stockStatus.toString());
      setShowForm(true);
    } else {
      reset();
    }
  }, [editingProduct, setValue, reset]);

  const onProductSubmit = async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('stockStatus', data.stockStatus);
    if (data.images && data.images.length > 0) {
      for (let file of data.images) {
        formData.append('images', file);
      }
    }

    try {
      let response;
      if (editingProduct) {
        response = await axios.patch(
          `${import.meta.env.VITE_REACT_API_URL}/api/products/${editingProduct._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setProducts(products.map(p => p._id === editingProduct._id ? response.data : p));
        setEditingProduct(null);
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_REACT_API_URL}/api/products`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setProducts([...products, response.data]);
      }
      reset();
      setShowForm(false);
      fetchProducts();
      showSuccess('Product saved successfully');
    } catch (error) {
      console.error('Error saving product:', error);
      showError('Error saving product');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setProducts(products.filter(p => p._id !== productId));
      showSuccess('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Error deleting product. Please try again.';
      showError(errorMessage);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setShowForm(false);
    reset();
  };
  
  const handleAddNewClick = () => {
    setEditingProduct(null);
    setShowForm(true);
    reset();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <button onClick={handleAddNewClick} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add New Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onProductSubmit)} className="mb-8 p-4 border rounded">
        <h3 className="text-xl mb-4">{editingProduct ? 'Edit Product' : 'Add a new product'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input {...register('title', { required: true })} placeholder="Title" className="p-2 border rounded" />
        {errors.title && <p className="text-red-500">Title is required.</p>}
        
        <textarea {...register('description', { required: true })} placeholder="Description" className="p-2 border rounded"></textarea>
        {errors.description && <p className="text-red-500">Description is required.</p>}

        <input type="number" {...register('price', { required: true, valueAsNumber: true })} placeholder="Price" className="p-2 border rounded" />
        {errors.price && <p className="text-red-500">Price is required.</p>}

        <select {...register('category', { required: true })} className="p-2 border rounded">
            <option value="">Select Category</option>
            {categories.map(category => (
            <option key={category._id} value={category._id}>{category.name}</option>
            ))}
        </select>
        {errors.category && <p className="text-red-500">Category is required.</p>}

        <select {...register('stockStatus', { required: true })} className="p-2 border rounded">
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
        </select>
        
        <input type="file" {...register('images')} multiple className="p-2 border rounded" />
        </div>
        {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
            <div className="mt-4">
                <p>Current Images:</p>
                <div className="flex space-x-2">
                    {editingProduct.images.map((image, index) => (
                        <img key={index} src={`${import.meta.env.VITE_REACT_API_URL}/${image}`} alt="Product" className="w-24 h-24 object-cover" />
                    ))}
                </div>
            </div>
        )}
        <div className="flex justify-end mt-4">
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                {editingProduct ? 'Update' : 'Add'} Product
            </button>
            <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
            </button>
        </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product._id} className="border p-4 rounded">
            <ProductCard product={product} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setEditingProduct(product)}
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProduct(product._id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Created: {new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsDashboard; 