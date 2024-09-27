import React, { useState, useEffect } from "react";
import { Form } from "react-router-dom";
import { Search, Plus, ArrowLeft } from "lucide-react";
import "./games.css";
import gamesData from "./games.json";

/**
 * Renders a card component that displays information about a game.
 * The card can be clicked to load the game's HTML content into a designated div.
 *
 * @param {Object} props - The component props.
 * @param {string} props.title - The title of the game.
 * @param {string} props.imageSrc - The URL of the game's image.
 * @param {string} props.genre - The genre of the game.
 * @param {string} props.type - The type of the game (e.g. "HTML", "EMULATOR", "PROXY", etc).
 * @param {string} props.link - The URL of the game's content.
 */
function Card({ title, imageSrc, genre, type, link }) {
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState(null);
  const [showNavbar, setShowNavbar] = useState(false);

  const handleClick = async () => {
    if (type !== "HTML") {
      // Handle non-HTML games appropriately (display message, etc.)
      console.warn("This game type is not currently supported for loading.");
      return;
    }

    setIsLoading(true);
    setShowNavbar(true);

    try {
      const response = await fetch(link);
      const html = await response.text();
      setHtmlContent(html);
    } catch (error) {
      console.error("Error loading game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    setShowNavbar(false);
    setHtmlContent(null);
  };

  return (
    <div className="card" onClick={handleClick}>
      <Plus strokeWidth={1.5} className="corner-icon top-left" />
      <Plus strokeWidth={1.5} className="corner-icon top-right" />
      <Plus strokeWidth={1.5} className="corner-icon bottom-left" />
      <Plus strokeWidth={1.5} className="corner-icon bottom-right" />

      <img src={imageSrc} alt={title} />
      <h2 className="game-title"> {title}</h2>
      <div className="game-info">
        <p className="game-genre">{genre}</p>
        <p className="spacer">░</p>
        <p className="game-type"> {type} </p>
      </div>

      {isLoading && <div className="loading-overlay">Loading...</div>}

      {htmlContent && (
        <div>
          {showNavbar && (
            <div className="navbar-game">
              <ArrowLeft strokeWidth={1.5} className="back-button" onClick={handleBackClick} />
            </div>
          )}
          <div className="full-page-iframe-container">
            <iframe
              srcDoc={htmlContent}
              title={title}
              className="full-page-iframe"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Games() {
  return (
    <div className="games-container">
      {gamesData.games.map((game, index) => (
        <Card
          key={index}
          title={game.title}
          imageSrc={game.imageSrc}
          genre={game.genre}
          type={game.type}
          link={game.link}
        />
      ))}
    </div>
  );
}

export default Games;