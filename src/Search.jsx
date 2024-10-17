import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const encodedUrl = searchParams.get('url');
  const url = window.__uv$config.decodeUrl(encodedUrl); // Decode the URL

  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        const data = await response.text();
        setHtml(data);
      } catch (error) {
        console.error('Error fetching HTML:', error);
        // Handle error, e.g., display an error message
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchHtml();
    } else {
      // Handle case where URL is not provided, e.g., redirect to home
      navigate('/'); 
    }
  }, [url, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Display the proxied HTML content
  return (
    <div className="search-results">
      {/* You can use dangerouslySetInnerHTML to render the HTML */}
      <div dangerouslySetInnerHTML={{ __html: html }} /> 
    </div>
  );
}

export default Search;
