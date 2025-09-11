import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GamesList.css';
import gamesData from './games.json';
import StatusBar from './StatusBar';
import Nav from './Nav'
import ASCII from './ASCII';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const [asciiKey, setAsciiKey] = useState(0);
  const asciiBackgroundRef = useRef(null);
  const [activeView, setActiveView] = useState('games');

  useEffect(() => {
    setGames(gamesData.games);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setAsciiKey(prevKey => prevKey + 1);
    }
  }, [location.pathname]);

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const getPreviewTopPosition = () => {
    return mousePosition.y > window.innerHeight * 0.8 ? mousePosition.y - 130 : mousePosition.y + 15; // Adjust 215 based on preview height
  };

  const handleGameClick = (game) => {
    navigate(`/game/${game.title}`);
  };

  const handleNavClick = (view) => {
    setActiveView(view);
  };

  return (
    <>
      <div className="btop-container" onMouseMove={handleMouseMove}>
        <div ref={asciiBackgroundRef} className="ascii-background">
{/*           <ASCII key={asciiKey} mousePosition={mousePosition} /> */}
        </div>
        <Nav 
          activeView={activeView}
          onCyanideClick={() => handleNavClick('games')}
          onSulfurClick={() => handleNavClick('proxy')}
          onFlorideClick={() => handleNavClick('floride')}
        />

        <div className="btop-box">
          <div className={`sliding-container ${activeView}`}>
            <div className="games-list">
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
                          onMouseEnter={() => setPreviewData({
                            src: game.imageSrc,
                            title: game.title,
                            description: game.description,
                            genre: game.genre
                          })}
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
            </div>
            <div className="proxy-page">
              <iframe src="https://sulfur-inky.vercel.app/rx" title="Sulfur Proxy" width="100%" height="100%" style={{ border: 'none' }} />
            </div>
            <div className="floride-page">
              <h4>working on it :)</h4>
            </div>
          </div>
        </div>

        {previewData && (
          <div
            className="game-preview"
            style={{
              top: `${getPreviewTopPosition()}px`,
              left: `${mousePosition.x + 15}px`,
            }}
          >
            <img src={previewData.src} alt="Game Preview" className="preview-image" />
            <div className="preview-details">
              <p className="preview-title">{previewData.title}</p>
              <p className="preview-genre">{previewData.genre}</p>
              <p className="preview-description">{previewData.description || 'No description available.'}</p>
            </div>
          </div>
        )}
      </div>
      <StatusBar />
    </>
  );
};

export default GamesList;
