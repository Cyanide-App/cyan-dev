import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import gamesData from './games.json';
import './GamePage.css';
import createGameHtml from './GameLoader';

const GamePage = () => {
  const { title } = useParams();
  const game = gamesData.games.find((g) => g.title === decodeURIComponent(title));
  
  const [gameLaunched, setGameLaunched] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [blobUrl, setBlobUrl] = useState('');
  const iframeRef = useRef(null);
  const dbRef = useRef(null);

  useEffect(() => {
    if (game && game.type === 'LOVE') {
      const dbName = `Balatro_Saves`;
      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('FILE_DATA')) {
          db.createObjectStore('FILE_DATA');
        }
      };

      request.onsuccess = event => {
        dbRef.current = event.target.result;
      };

      request.onerror = event => {
        console.error("Error opening parent IndexedDB:", event.target.errorCode);
      };

      const handleMessage = (event) => {
        if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
          return;
        }

        const { type, payload } = event.data;

        if (type === 'iframeReady') {
          const db = dbRef.current;
          if (!db) return;

          const gameDbName = localStorage.getItem('balatro_db_name');
          if (!gameDbName || db.objectStoreNames.length === 0) {
            iframeRef.current.contentWindow.postMessage({ type: 'loadData', payload: {} }, '*');
            return;
          }
          
          try {
            const transaction = db.transaction(['FILE_DATA'], 'readonly');
            const allData = { [gameDbName]: {} };
            const store = transaction.objectStore('FILE_DATA');
            const allRecords = [];
            allData[gameDbName]['FILE_DATA'] = allRecords;

            store.openCursor().onsuccess = e => {
                const cursor = e.target.result;
                if(cursor) {
                    allRecords.push({ key: cursor.key, value: cursor.value });
                    cursor.continue();
                } else {
                    iframeRef.current.contentWindow.postMessage({ type: 'loadData', payload: allData }, '*');
                }
            }
          } catch (e) {
            console.error("Error reading from IndexedDB. Starting fresh.", e);
            iframeRef.current.contentWindow.postMessage({ type: 'loadData', payload: {} }, '*');
          }
        }

        if (type === 'saveData') {
            const db = dbRef.current;
            if (!db) return;

            const dbNameFromGame = Object.keys(payload)[0];
            localStorage.setItem('balatro_db_name', dbNameFromGame);

            const storeData = payload[dbNameFromGame];
            saveDataToDb(storeData);
        }
      };
      
      const saveDataToDb = (storeData) => {
        const db = dbRef.current;
        if (!db || !storeData || !storeData['FILE_DATA']) return;

        try {
            const transaction = db.transaction(['FILE_DATA'], 'readwrite');
            transaction.oncomplete = () => console.log('Parent DB updated successfully.');
            transaction.onerror = err => console.error('Parent DB transaction error:', err);
            
            const store = transaction.objectStore('FILE_DATA');
            store.clear(); 
            storeData['FILE_DATA'].forEach(record => {
                store.put(record.value, record.key);
            });
        } catch (err) {
            console.error("Failed to create save transaction:", err);
        }
      }

      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
        if (dbRef.current) {
          dbRef.current.close();
        }
      };
    }
  }, [game]);

  useEffect(() => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => { canvas.remove(); });
    
    if (game) {
      if (game.type === 'HTML') {
        setHtmlContent('');
      } else {
        const generatedHtml = createGameHtml(game);
        setHtmlContent(generatedHtml);
        const blob = new Blob([generatedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      }
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [game]);

  if (!game) {
    return <div>Game not found</div>;
  }

  const handleLaunchGame = () => {
    setGameLaunched(true);
  };

  return (
    <div className="game-page-container">
      <div className="game-page-header">
        <span>{game.title}</span>
        <Link to="/" className="back-button">[ Back ]</Link>
      </div>

      <div className="game-content-container">
        {gameLaunched ? (
          game.type === 'HTML' ? (
            <iframe src={game.link} title={game.title} className="game-iframe" />
          ) : (
            <iframe ref={iframeRef} src={blobUrl} title={game.title} className="game-iframe" />
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
      </div>
    </div>
  );
};

export default GamePage;
