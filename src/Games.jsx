import React from "react";
import { Form } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import "./games.css";
import gamesData from "./games.json";

function Card({ title, imageSrc, genre, type, link }) {
  const handleClick = () => {
    if (type === 'HTML') {
      fetch(link)
        .then(response => response.text())
        .then(html => {
          document.open();
          document.write(html);
          document.close();
        })
        .catch(error => console.error('Error loading game:', error));
    }
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
    </div>
  );
}

function Games() {
  return (
    <div className="games-container">
      {gamesData.games.map((game, index) => (
        <Card
          key=      {index}
          title=    {game.title}
          imageSrc= {game.imageSrc}
          genre=    {game.genre}
          type=     {game.type}
          link=     {game.link}
        />
      ))}
    </div>
  );
}

export default Games;
