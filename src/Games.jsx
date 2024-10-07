import React, { useState, useEffect } from "react";
import { Form } from "react-router-dom";
import { Search, Plus, ArrowLeft } from "lucide-react";
import "./games.css";
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

function Games() {
  const [htmlContent, setHtmlContent] = useState(null);
  const [gameTitle, setGameTitle] = useState("");

  const [emulatorContent, setEmulatorContent] = useState("");
  const [emulatorCore, setEmulatorCore] = useState("");

  const handleClick = async (title, link, type, core = "") => {
    setGameTitle(title);
    switch (type) {
      case "HTML":
        try {
          const response = await fetch(link);
          const html = await response.text();
          setHtmlContent(html);
        } catch (error) {
          console.error("Error loading game:", error);
        }
        break;

      case "EMULATOR":
        try {
          setEmulatorCore(core);
          setEmulatorContent(link);
        } catch (error) {
          console.error("Error loading game:", error);
        }
        break;
      
        case "PROXY":
  try {
    alert("Original link:", link);
    const encodedUrl = window.__uv$config.encodeUrl(link);
    alert("Encoded URL:", encodedUrl);
    const proxyUrl = __uv$config.prefix + encodedUrl;
    alert("Proxy URL:", proxyUrl);
    window.location.href = `/search?url=${encodeURIComponent(proxyUrl)}`;
  } catch (error) {
    console.error("Error loading proxied game:", error);
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
    <div className="games-container">
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
  );
}



export default Games;
