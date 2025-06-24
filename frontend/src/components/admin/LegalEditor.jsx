import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AuthContext } from '../../context/AuthContext';

const LegalEditor = () => {
  const [contentType, setContentType] = useState('privacy-policy');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setMessage('');
      try {
        const res = await axios.get(`${import.meta.env.VITE_REACT_API_URL}/api/legal/${contentType}`, {
          headers: { authorization: `Bearer ${token}` }
        });
        setContent(res.data.content);
      } catch (err) {
        console.error(err);
        setMessage('Failed to load content.');
      }
      setLoading(false);
    };

    fetchContent();
  }, [contentType]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_API_URL}/api/legal/${contentType}`,
        { content },
        { headers: { authorization: `Bearer ${token}` } }
      );
      setMessage('Content saved successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to save content.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Legal Content</h2>
      <div className="mb-4">
        <label htmlFor="contentType" className="block text-gray-700 font-bold mb-2">
          Select Content Type:
        </label>
        <select
          id="contentType"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="privacy-policy">Privacy Policy</option>
          <option value="terms-and-conditions">Terms & Conditions</option>
          <option value="disclaimer">Disclaimer</option>
        </select>
      </div>

      <ReactQuill theme="snow" value={content} onChange={setContent} />

      <button
        onClick={handleSave}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
      >
        {loading ? 'Saving...' : 'Save Content'}
      </button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default LegalEditor; 