import React, { useState, useEffect } from "react";
import { Search, Plus, ArrowLeft, Gamepad } from "lucide-react";
import "./games.css";
import {
  HashRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { EmulatorJS } from "react-emulatorjs";
import gamesData from "./games.json";

function GameContent({ htmlContent, handleBackClick }) {
  return (
    <div className="game-content">
      <div className="navbar-game">
        <ArrowLeft
          strokeWidth={1.5}
          className="back-button"
          onClick={handleBackClick}
        />
      </div>
      <div className="full-page-iframe-container">
        <iframe
          srcDoc={htmlContent}
          title="Game Content"
          className="full-page-iframe"
        />
      </div>
    </div>
  );
}

function ProxyContent({ proxyContent, handleBackClick }) {
  return (
    <div className="game-content">
      <div className="navbar-game">
        <ArrowLeft
          strokeWidth={1.5}
          className="back-button"
          onClick={handleBackClick}
        />
      </div>
      <div className="full-page-iframe-container">
        <iframe
          src={proxyContent}
          title="Game Content"
          className="full-page-iframe"
        />
      </div>
    </div>
  );
}

function StatusBar({ siteTitle, gameCount }) {
  const currentDate = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString(undefined, options);
  const formattedTime = currentDate.toLocaleTimeString();

  return (
    <div className="status-bar">
      <div className="left-side">
        <span className="status-title">{siteTitle}</span> ▨:{gameCount}
      </div>
      <div className="right-side">
        {formattedDate} {formattedTime}
      </div>
    </div>
  );
}
function Games() {
  const [htmlContent, setHtmlContent] = useState(null);
  const [gameTitle, setGameTitle] = useState("");

  const [emulatorContent, setEmulatorContent] = useState("");
  const [emulatorCore, setEmulatorCore] = useState("");

  const [proxyContent, setProxyContent] = useState("");


  const handleClick = async (title, link, type, core = "") => {
    setGameTitle(title);
    switch (type) {
      case "HTML":
        try {
          const response = await fetch(link);
          const html = await response.text();
          setHtmlContent(html);
        } catch (error) {
          console.error("Error loading html game:", error);
        }
        break;

      case "PROXY":
          try {
            const response = await fetch(link);
            setProxyContent(response.url);
          } catch (error) {
            console.error("Error loading proxy game:", error);
          }
          break;
      case "EMULATOR":
        try {
          setEmulatorCore(core);
          setEmulatorContent(link);
        } catch (error) {
          console.error("Error loading emulated game:", error);
        }
        break;

      case "FLASH":
        try {
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
        
          const flashContent = `
            <object style="width: ${windowWidth}px; height: ${windowHeight}px;">
              <embed src="${link}" width="${windowWidth}" height="${windowHeight}" />
            </object>
            <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
          `;
          setHtmlContent(flashContent);
        
        
        } catch (error) {
          console.error("Error loading flash game:", error);
        }
        break;
      
      
      default:
              // Handle other types or provide a default action
        console.error(`Unsupported game type: ${type}`);
    }
  };

  const handleBackClick = () => {
    setHtmlContent(null);
    setEmulatorContent("");
  };

  return (
    <>
    <div className="games-navbar">
        <Plus strokeWidth={1.5} className="corner-icon top-left" />
        <Plus strokeWidth={1.5} className="corner-icon top-right" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
        <Plus strokeWidth={1.5} className="corner-icon bottom-right" />
        <h4 className="title">:navbar</h4>

        <nav>
          <ul>
            <li>
              |
              <NavLink className="nav-link" to="/" onClick={(event) => {
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach(canvas => {
    canvas.remove();
    navigate(`/`);
    
  });
}}>                {" "}
                Home{" "}
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
    
    <div className="games-layout">
      
      
   <StatusBar siteTitle="cyλn" gameCount={gamesData.games.length} />

      <div className="search-container ">
      <Plus strokeWidth={1.5} className="corner-icon top-left" />
              <Plus strokeWidth={1.5} className="corner-icon top-right" />
              <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
              <Plus strokeWidth={1.5} className="corner-icon bottom-right" />
              <h4 className="title">:search</h4>

      <div className="search-input-wrapper">
      <Search className="search-icon" />
      <input
        type="text"
        id="urlInput"
        placeholder="Search with google or enter adresss"
        
      />
      <button id="searchButton">Search Text</button>
    </div>
      </div>
    <div className="games-container">
    <Plus strokeWidth={1.5} className="corner-icon top-left" />
              <Plus strokeWidth={1.5} className="corner-icon top-right" />
              <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
              <Plus strokeWidth={1.5} className="corner-icon bottom-right" />

        <h4 className="title">:games</h4>
      <div className="games-grid">
        {gamesData.games
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((game, index) => (
            <div
              className="card"
              key={index}
              onClick={() =>
                handleClick(game.title, game.link, game.type, game.core)
              }
            >
              <Plus strokeWidth={1.5} className="corner-icon top-left" />
              <Plus strokeWidth={1.5} className="corner-icon top-right" />
              <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
              <Plus strokeWidth={1.5} className="corner-icon bottom-right" />

              <img src={game.imageSrc} alt={game.title} />
              <h2 className="game-title"> {game.title}</h2>
              <div className="game-info">
                <p className="game-genre">{game.genre}</p>
                <p className="spacer">█</p>
                <p className="game-type"> {game.type} </p>
              </div>
            </div>
          ))}
      </div>

      {htmlContent && (
        <GameContent
          htmlContent={htmlContent}
          handleBackClick={handleBackClick}
        />
      )}

{proxyContent && (
        <ProxyContent
          htmlContent={proxyContent}
          handleBackClick={handleBackClick}
        />
      )}

      {emulatorContent && (
        <div className="game-content">
          <div className="navbar-game">
            <ArrowLeft
              strokeWidth={1.5}
              className="back-button"
              onClick={handleBackClick}
            />
            <p className="NavTitle">{gameTitle}</p>
          </div>
          <div className="full-page-iframe-container">
            <EmulatorJS
              width={window.innerWidth}
              height={window.innerHeight * 0.97}
              EJS_core={emulatorCore} // emulator core
              EJS_gameUrl={emulatorContent} // game url
              //  EJS_gameName = {game.title}
              EJS_alignStartButton="center"
              EJS_backgroundColor="#000"
              EJS_color="#413a61"
            />
          </div>
        </div>
      )}
    </div>
    </div>
    </>
  );
}




export default Games;
