import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { NotificationContext } from '../../context/NotificationContext';

function ReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  const { showSuccess, showError } = useContext(NotificationContext);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/reviews/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showError('Could not fetch reviews.');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (editingReview) {
      setValue('name', editingReview.name);
      setValue('review', editingReview.review);
      setValue('rating', editingReview.rating);
    } else {
      reset();
    }
  }, [editingReview, setValue, reset]);

  const onReviewSubmit = async (data) => {
    try {
      if (editingReview) {
        await axios.patch(`${import.meta.env.VITE_REACT_API_URL}/api/reviews/${editingReview._id}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        showSuccess('Review updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_REACT_API_URL}/api/reviews`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        showSuccess('Review added successfully');
      }
      fetchReviews();
      reset();
      setEditingReview(null);
    } catch (error) {
      console.error('Error saving review:', error);
      showError('Error saving review.');
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchReviews();
      showSuccess('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      showError('Error deleting review.');
    }
  };

  const cancelEdit = () => {
    setEditingReview(null);
    reset();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Reviews</h2>
      <form onSubmit={handleSubmit(onReviewSubmit)} className="mb-8 p-4 border rounded">
        <h3 className="text-xl mb-4">{editingReview ? 'Edit Review' : 'Add a New Review'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input {...register('name', { required: true })} placeholder="Customer Name" className="p-2 border rounded" />
          <input type="number" {...register('rating', { required: true, min: 1, max: 5 })} placeholder="Rating (1-5)" className="p-2 border rounded" />
        </div>
        <textarea {...register('review', { required: true })} placeholder="Review text" className="w-full mt-4 p-2 border rounded"></textarea>
        <div className="flex justify-end mt-4">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mr-2">
            {editingReview ? 'Update' : 'Add'} Review
          </button>
          {editingReview && (
            <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul>
        {reviews.map(review => (
          <li key={review._id} className="border p-4 rounded mb-2 flex justify-between items-start">
            <div>
              <h4 className="font-bold">{review.name}</h4>
              <p>Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
              <p className="mt-2">{review.review}</p>
              <p className="text-sm text-gray-500 mt-2">Added on: {new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setEditingReview(review)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteReview(review._id)}
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

export default ReviewsDashboard; 