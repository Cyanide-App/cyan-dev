// setup uv on vercel: https://github.com/crllect/UV-on-vercel

import React, { useState, useEffect, useRef } from "react";
import {
  HashRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Search, Plus } from "lucide-react";
import Chat from "./Chat";
import "./App.css";
import { Form } from "react-router-dom";
import ASCII from './ASCII';

function SplashText() {
  const [text, setText] = useState("");
  const splashTexts = [1, 2, 3, 4];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * splashTexts.length);
    setText(splashTexts[randomIndex].toString());
  }, []);

  return <h4 className="splash-text">{text}</h4>;
}



function SearchBar() {
  const urlInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/uv/sw.js", {
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

      const encodedUrl = window.__uv$config.encodeUrl(url);
      // Pass encodedUrl as a query parameter
      navigate(`/search?url=${encodedUrl}`);
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
    <div className="search-input-wrapper">
      <Search className="search-icon" />
      <input
        type="text"
        id="urlInput"
        placeholder="Search with google or enter adresss"
        ref={urlInputRef}
      />
      <button id="searchButton">Search Text</button>
    </div>
  );
}


export default function App() {

  
  return (
    <section className="layout">
      <div className="header frame">
        <Plus strokeWidth={1.5} className="corner-icon top-left" />
        <Plus strokeWidth={1.5} className="corner-icon top-right" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-right" />
        <ASCII />

        <h4 className="title">:header</h4>
        <div className="hero">

          <h1 className="hero-title">cyλn</h1>
          {/* <SplashText /> */}
        </div>
      </div>

      <div className="search-bar frame">
        <Plus strokeWidth={1.5} className="corner-icon top-left" />
        <Plus strokeWidth={1.5} className="corner-icon top-right" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-right" />
        <h4 className="title">:search</h4>
        <SearchBar />

        {/* <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input type="text" placeholder="Search with Google or Enter Address" className="search-input" />
        </div> */}
      </div>

      <div className="navbar">
        <Plus strokeWidth={1.5} className="corner-icon top-left" />
        <Plus strokeWidth={1.5} className="corner-icon top-right" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-right" />
        <h4 className="title">:navbar</h4>

        <nav>
          <ul>
            <li>
              |
              <NavLink className="nav-link" to="games" onClick={(event) => {
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    canvas.remove();
    navigate(`/games`);
    
  });
}}>                {" "}
                Games{" "}
              </NavLink>
              |
              <NavLink
                className="nav-link"
                to="chat"
                onClick={(e) => {
                  // e.preventDefault();
                  document.querySelector(".navbar").style.position = "unset";
                }}
              >
                {" "}
                Chat{" "}
              </NavLink>{" "}
              |
              <NavLink className="nav-link" to="/Settings">
                {" "}
                Settings{" "}
              </NavLink>
              |
            </li>
          </ul>
        </nav>
        {/* 
            <Routes>
              <Route path="/Chat" element={<Chat />} />
              <Route path="/search" element={<SearchResult />} />

              
            </Routes> */}
      </div>
    </section>
  );
}