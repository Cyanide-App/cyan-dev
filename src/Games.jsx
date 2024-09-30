import React, { useState, useEffect } from "react";
import { Form } from "react-router-dom";
import { Search, Plus, ArrowLeft } from "lucide-react";
import "./games.css";
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

  const handleClick = async (link) => {
    try {
      const response = await fetch(link);
      const html = await response.text();
      setHtmlContent(html);
    } catch (error) {
      console.error("Error loading game:", error);
    }
  };

  const handleBackClick = () => {
    setHtmlContent(null);
  };

  return (
    <div className="games-container">
      {gamesData.games.map((game, index) => (
        <div
          className="card"
          key={index}
          onClick={() => handleClick(game.link)}
        >
          <Plus strokeWidth={1.5} className="corner-icon top-left" />
          <Plus strokeWidth={1.5} className="corner-icon top-right" />
          <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
          <Plus strokeWidth={1.5} className="corner-icon bottom-right" />

          <img src={game.imageSrc} alt={game.title} />
          <h2 className="game-title"> {game.title}</h2>
          <div className="game-info">
            <p className="game-genre">{game.genre}</p>
            <p className="spacer">░</p>
            <p className="game-type"> {game.type} </p>
          </div>
        </div>
      ))}

      {htmlContent && (
        <GameContent
          htmlContent={htmlContent}
          handleBackClick={handleBackClick}
        />
      )}
    </div>
  );
}

export default Games;
