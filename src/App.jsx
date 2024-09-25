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

function SplashText() {
  const [text, setText] = useState("");
  const splashTexts = [1, 2, 3, 4];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * splashTexts.length);
    setText(splashTexts[randomIndex].toString());
  }, []);

  return <h4 className="splash-text">{text}</h4>;
}

const AsciiArtAnimation = () => {
  const containerRef = useRef(null);

  let timeA;
  let timeB;

  var timeA_config = [0.001, 0.01, 0.1, 1];

  var timeB_config = [0.001, 0.01, 0.1, 1];

  var text_list = [
    "   .:-=+*#%@",
    "1627d4t3987ebr24tb9r40s949m2034u",
    "█▓▒░ ",
    " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@",
    "$$$XXXXXXXxxxxxxx=======+++++++;;;;;;;:::::::........           ......",
    "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
  ];

  const randomIndexA = Math.floor(Math.random() * timeA_config.length);
  const randomIndexB = Math.floor(Math.random() * timeB_config.length);
  const randomIndexText = Math.floor(Math.random() * text_list.length);

  timeA = timeA_config[randomIndexA];
  timeB = timeB_config[randomIndexB];

  // ASCII art configuration
  const M = window.innerWidth / 10; // Width of the ASCII art
  const height = window.innerHeight / 45;
  const T = []; // Array to hold lines of ASCII art
  const A = text_list[randomIndexText].split(""); // ASCII characters for different brightness levels
  let z, P;

  // Helper functions
  const F = Math.sqrt;
  const W = Math.max;
  const H = Math.round;
  const J = (x, min, max) => Math.min(Math.max(x, min), max);
  const q = Math.cos;
  const D = Math.sin;
  const V = (a, b, t) => a * (1 - t) + b * t;

  // Initialize ASCII art
  useEffect(() => {
    const container = containerRef.current;
    for (let i = 0; i < height; i++) {
      const line = document.createElement("div");
      T.push(line);
      container.appendChild(line);
    }
  }, []);

  // Main animation function
  useEffect(() => {
    let rafId;

    const K = (e) => {
      rafId = requestAnimationFrame(K);
      if (!z) z = timeA * e;
      if (!P) P = e;
      if ("visible" === document.visibilityState && e - P >= 42) {
        P = e;
        const a = timeB * e - z;
        const t = (e) =>
          e < 0.5
            ? (1 - F(1 - Math.pow(2 * e, 2))) / 2
            : (F(1 - Math.pow(-2 * e + 2, 2)) + 1) / 2;
        const animationProgress = t(J(0.5 * (a - 1), 0, 1));

        for (let n = 0; n < T.length; n++) {
          let i = "";
          const s = 1 - (2 * n) / T.length;
          for (let c = 0; c < M; c++) {
            const o = (2 * c) / M - 1;
            const d = F(o * o + s * s);
            const l = (0.1 * a) / W(0.1, d);
            const f = q(l);
            const b = D(l);
            const u = o * f - s * b;
            const m = H(((o * b + s * f + 1) / 2) * M);
            const h = H(((u + 1) / 2) * A.length) % A.length;
            const g = m < 0 || m >= M || h < 0 || h >= A.length ? " " : A[h];
            i += g;
          }
          T[n].textContent = i;
        }
      }
    };

    K(0);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return <div className="ascii" ref={containerRef} />;
};

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
      let searchUrl = "https://search.brave.com/search?q=";

      if (!url.includes(".")) {
        url = searchUrl + encodeURIComponent(url);
      } else {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }
      }

      const encodedUrl = window.__uv$config.encodeUrl(url);
      navigate(`/search?url=${encodeURIComponent(encodedUrl)}`);
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

function SearchResult() {
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

export default function App() {
  return (
    <section className="layout">
      <div className="header frame">
        <Plus strokeWidth={1.5} className="corner-icon top-left" />
        <Plus strokeWidth={1.5} className="corner-icon top-right" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-right" />
        <AsciiArtAnimation />
        <h4 className="title">:header</h4>
        <div className="hero">
          <h1 className="hero-title">cyλn</h1>
          <SplashText />
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
              <NavLink className="nav-link" to="games">
                {" "}
                Games{" "}
              </NavLink>
              |
              <NavLink
                className="nav-link"
                to="/Chat"
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
