import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GamesList.css';
import gamesData from './games.json';
import StatusBar from './StatusBar';
import ASCII from './ASCII';


const GamesList = () => {
  const [games, setGames] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    setGames(gamesData.games);
  }, []);

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleGameClick = (game) => {
    navigate(`/game/${game.title}`);
  };

  return (
    <>
      <div className="btop-container" onMouseMove={handleMouseMove}>
      <ASCII/>
      <h4 className='title'>:Games</h4>

      <div className="btop-box">
          <div className="btop-table-container">
            <table className="btop-table">
              <thead>
                <tr>
                  <th>Title:</th>
                  <th>Genre:</th>
                  <th>Type:</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, index) => (
                  <tr key={index} onClick={() => handleGameClick(game)}>
                    <td 
                      onMouseEnter={() => setPreviewData({ src: game.imageSrc, title: game.title })}
                      onMouseLeave={() => setPreviewData(null)}
                      className="game-title"
                    >
                      {game.title}
                    </td>
                    <td className="game-genre">{game.genre}</td>
                    <td className="game-type">{game.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* <div className="btop-footer">
            <span>Games: {games.length}</span>
          </div>  */}
        </div>
        {previewData && (
          <div
            className="game-preview"
            style={{
              top: `${mousePosition.y + 15}px`,
              left: `${mousePosition.x + 15}px`,
            }}
          >
            <img src={previewData.src} alt="Game Preview" />
            <p className="preview-caption">{previewData.title}</p>
          </div>
        )}
      </div>
      <StatusBar />
    </>
  );
};

export default GamesList;
