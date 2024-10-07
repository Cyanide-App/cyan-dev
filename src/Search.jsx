import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function Search() {
  const iframeWindowRef = useRef(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const encodedUrl = searchParams.get("url");

  useEffect(() => {
    if (encodedUrl) {
      iframeWindowRef.current.src =
        window.__uv$config.prefix + decodeURIComponent(encodedUrl);
    }
  }, [encodedUrl]);

  return (
    <iframe
      id="iframeWindow"
      className="iframeWindow"
      title="Website Frame"
      ref={iframeWindowRef}
    />
  );
}

export default Search;
