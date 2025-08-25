import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import gamesData from './games.json';
import './GamePage.css';
import createGameHtml from './GameLoader';

const GamePage = () => {
  const { title } = useParams();
  const game = gamesData.games.find((g) => g.title === decodeURIComponent(title));
  
  const [gameLaunched, setGameLaunched] = useState(false);

  useEffect(() => {
    // delete ascii div on page load cuz idk how to use react lol
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => { canvas.remove(); });
 
    if (game) {
      if (game.type === 'HTML') {
        fetchHtmlGame();
      } else {
        const generatedHtml = createGameHtml(game);
        setHtmlContent(generatedHtml);
      }
    }
  }, [game]);

  const htmlContent = game && game.type !== 'HTML' ? createGameHtml(game) : '';

  // No need for the fetchHtmlGame function anymore
  const fetchHtmlGame = () => {}; 

  if (!game) {
    return <div>Game not found</div>;
  }

  const handleLaunchGame = () => {
    setGameLaunched(true);
  };

  const handleDownloadHtml = () => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${game.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="game-page-container">
      <div className="game-page-header">
        <span>{game.title}</span>
        <Link to="/" className="back-button">[ Back ]</Link>
      </div>

      <div className="game-content-container">
        {gameLaunched ? (
          <iframe src={game.link} title={game.title} className="game-iframe" />
        ) : (
          <div className="launch-screen">
             <p className="cdn-loaded-text">CDN Loaded: {game.link}</p>
            <button className="launch-button-game" onClick={handleLaunchGame}>
              {'>'} Launch
            </button>
          </div>
        )}
      </div>

      <div className="game-page-footer">
        <span>Genre: {game.genre} | Type: {game.type}</span>
        {gameLaunched && <button onClick={handleDownloadHtml}>Download HTML</button>}
      </div>
    </div>
  );
};

export default GamePage;
