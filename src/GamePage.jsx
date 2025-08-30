import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import gamesData from './games.json';
import './GamePage.css';
import createGameHtml from './GameLoader';

const GamePage = () => {
  const { title } = useParams();
  const game = gamesData.games.find((g) => g.title === decodeURIComponent(title));
  const iframeRef = useRef(null);
  
  const [gameLaunched, setGameLaunched] = useState(false);
  const [htmlContent, setHtmlContent] = useState(''); // Reintroduce htmlContent state

  useEffect(() => {
    // delete ascii div on page load cuz idk how to use react lol
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => { canvas.remove(); });
    
    if (game) {
      if (game.type === 'HTML') {
        // For HTML type, we directly use game.link in the iframe src
        setHtmlContent(''); // Clear htmlContent as we're not using srcDoc
      } else {
        // For other types, generate HTML and use srcDoc
        const generatedHtml = createGameHtml(game);
        setHtmlContent(generatedHtml);
      }
    }
  }, [game]);

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

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.mozRequestFullScreen) { /* Firefox */
        iframeRef.current.mozRequestFullScreen();
      } else if (iframeRef.current.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        iframeRef.current.webkitRequestFullscreen();
      } else if (iframeRef.current.msRequestFullscreen) { /* IE/Edge */
        iframeRef.current.msRequestFullscreen();
      }
    }
  };

  return (
    <div className="game-page-container">
      <div className="game-page-header">
        <span>{game.title}</span>
        <div>
          <button onClick={handleFullscreen} className="fullscreen-button">[ Fullscreen ]</button>
          <Link to="/" className="back-button">[ Back ]</Link>
        </div>
      </div>

      <div className="game-content-container">
        {gameLaunched ? (
          game.type === 'HTML' ? (
            <iframe ref={iframeRef} src={game.link} title={game.title} className="game-iframe" />
          ) : (
            <iframe ref={iframeRef} srcDoc={htmlContent} title={game.title} className="game-iframe" />
          )
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