import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LegalContentDisplay = ({ contentType }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/legal/${contentType}`);
        setContent(res.data.content);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setContent('<p>Could not load content.</p>');
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </div>
  );
};

export default LegalContentDisplay; 