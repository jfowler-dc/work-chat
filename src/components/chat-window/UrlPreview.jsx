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
          console.error(err.response.data.error.message);
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
      {metadata?.openGraph?.image && <img src={metadata.openGraph.image} alt="Preview" />}
      {metadata?.openGraph?.title && <h4>{metadata.openGraph.title}</h4>}
      {metadata?.openGraph?.description && <p>{metadata.openGraph.description}</p>}
      <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
    </div>
  );
};

export default UrlPreview;
