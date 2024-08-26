// src/components/UrlPreview.jsx

import React, { useState, useEffect } from 'react';
import {fetchUrlMetadata} from '../../firestore'

const UrlPreview = ({ url }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMetadata = async () => {
        try {
          const meta = await fetchUrlMetadata(url);
          setMetadata(meta);
        } catch (err) {
          console.error('Error fetching metadata:', err);
          setError('Failed to load URL preview');
        } finally {
          setLoading(false);
        }
      };
  
      getMetadata();
  }, [url]);

  if (loading) return <p>Loading preview...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="url-preview">
      {metadata?.hybridGraph?.image && <img src={metadata.hybridGraph.image} alt="Preview" />}
      <h4>{metadata?.hybridGraph?.title || 'No title available'}</h4>
      <p>{metadata?.hybridGraph?.description || 'No description available'}</p>
      <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    </div>
  );
};

export default UrlPreview;
