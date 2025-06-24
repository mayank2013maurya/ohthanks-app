import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../../context/NotificationContext.jsx';

function ContactsDashboard() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { showSuccess, showError } = useContext(NotificationContext);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      console.log("hello");

      setLoading(true);
      const token = localStorage.getItem('token');
      console.log(import.meta.env.VITE_REACT_API_URL);

      const response = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showError('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (contactId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_REACT_API_URL}/api/contacts/${contactId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setContacts(prev => prev.map(contact => 
        contact._id === contactId ? { ...contact, status } : contact
      ));
      
      showSuccess('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status');
    }
  };

  const deleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_REACT_API_URL}/api/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setContacts(prev => prev.filter(contact => contact._id !== contactId));
      showSuccess('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      showError('Failed to delete contact');
    }
  };

  const openContactModal = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-red-100 text-red-800', label: 'New' },
      read: { color: 'bg-yellow-100 text-yellow-800', label: 'Read' },
      replied: { color: 'bg-green-100 text-green-800', label: 'Replied' }
    };
    
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact Requests</h2>
        <p className="text-gray-600">Manage contact form submissions from customers</p>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No contact requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.whatsappNumber}</div>
                        {contact.address && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{contact.address}</div>
                        )}
                        {contact.addToMailingList && (
                          <div className="text-xs text-blue-600 font-medium">✓ Mailing List</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {contact.message}
                      </div>
                      <button
                        onClick={() => openContactModal(contact)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        View full message
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={contact.status}
                          onChange={(e) => updateStatus(contact._id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                        <button
                          onClick={() => deleteContact(contact._id)}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name:</label>
                  <p className="text-sm text-gray-900">{selectedContact.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp:</label>
                  <p className="text-sm text-gray-900">{selectedContact.whatsappNumber}</p>
                </div>
                
                {selectedContact.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address:</label>
                    <p className="text-sm text-gray-900">{selectedContact.address}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message:</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mailing List:</label>
                  <p className="text-sm text-gray-900">
                    {selectedContact.addToMailingList ? 'Yes' : 'No'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted:</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedContact.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactsDashboard; 