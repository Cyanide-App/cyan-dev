
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get encoded URL from search params
  const encodedUrl = searchParams.get('url'); 

  // Decode the URL using __uv$config
  const url = window.__uv$config.decodeUrl(encodedUrl); 

  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        // Use the decoded URL in the proxy fetch request
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

    // Fetch HTML only if a URL is provided
    if (url) {
      fetchHtml(); 
    } else {
      // Handle case where URL is not provided, e.g., redirect to home
      navigate('/'); 
    }
  }, [url, navigate]); // Re-fetch when 'url' or 'navigate' changes

  if (loading) {
    return <div>Loading...</div>;
  }

  // Display the proxied HTML content
  return (
    <div className="search-results">
      {/* Use dangerouslySetInnerHTML to render the HTML */}
      <div dangerouslySetInnerHTML={{ __html: html }} /> 
    </div>
  );
}

export default Search;
