import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../../context/NotificationContext';

function InquiriesDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const { showSuccess, showError } = useContext(NotificationContext);

  const fetchInquiries = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/inquiry`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setInquiries(response.data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };
  
  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateInquiryStatus = async (inquiryId, status) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_API_URL}/api/inquiry/${inquiryId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setInquiries(inquiries.map(inq => inq._id === inquiryId ? response.data : inq));
      showSuccess('Inquiry status updated');
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      showError('Error updating inquiry status');
    }
  };

  const deleteInquiry = async (inquiryId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/inquiry/${inquiryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setInquiries(inquiries.filter(i => i._id !== inquiryId));
      showSuccess('Inquiry deleted successfully');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      const errorMessage = error.response?.data?.message || 'Error deleting inquiry. Please try again.';
      showError(errorMessage);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Inquiries</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Whatsapp Number</th>
              <th className="py-2 px-4 border-b">Address</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Submitted</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map(inquiry => (
              <tr key={inquiry._id}>
                <td className="py-2 px-4 border-b">{inquiry.userDetails.name}</td>
                <td className="py-2 px-4 border-b"><a href={`https://wa.me/${inquiry.userDetails.whatsappNumber}`} target="_blank" rel="noopener noreferrer">{inquiry.userDetails.whatsappNumber}</a></td>
                <td className="py-2 px-4 border-b">{inquiry.userDetails.address}</td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={inquiry.status}
                    onChange={(e) => updateInquiryStatus(inquiry._id, e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => deleteInquiry(inquiry._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InquiriesDashboard; 