import React, { useEffect, useRef } from 'react';
import './example.css'; 

function SearchProxy() {
  const urlInputRef = useRef(null);
  const iframeWindowRef = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/uv/sw.js', {
          scope: window.__uv$config.prefix,
        });
      });
    }

    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("searchButton").click();
      }
    };

    const handleClick = (event) => {
      event.preventDefault();

      let url = urlInputRef.current.value;
      let searchUrl = "https://www.google.com/search?q=";

      if (!url.includes(".")) {
        url = searchUrl + encodeURIComponent(url);
      } else {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }
      }

      iframeWindowRef.current.src = window.__uv$config.prefix + window.__uv$config.encodeUrl(url);
    };

    const urlInput = document.getElementById("urlInput");
    const searchButton = document.getElementById("searchButton");

    if (urlInput) {
      urlInput.addEventListener("keydown", handleKeyDown);
    }

    if (searchButton) {
      searchButton.onclick = handleClick;
    }

    return () => {
      if (urlInput) {
        urlInput.removeEventListener("keydown", handleKeyDown);
      }
      if (searchButton) {
        searchButton.onclick = null;
      }
    };
  }, []);

  return (
    <div>
      <input type="text" id="urlInput" placeholder="Enter URL here" ref={urlInputRef} />
      <button id="searchButton">Search Text</button>

      <iframe id="iframeWindow" className="iframeWindow" title="Website Frame" ref={iframeWindowRef} />
    </div>
  );
}

export default SearchProxy;
