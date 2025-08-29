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
        // The stores will be created dynamically based on game data
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

          const transaction = db.transaction(db.objectStoreNames, 'readonly');
          const allData = {};
          let storesCount = db.objectStoreNames.length;
          if (storesCount === 0) {
              iframeRef.current.contentWindow.postMessage({ type: 'loadData', payload: {} }, '*');
              return;
          }

          let storesCompleted = 0;
          const dbNameFromGame = Object.keys(payload)[0]; // Assumes game sends its db name
          allData[dbNameFromGame] = {};
          
          for(const storeName of db.objectStoreNames) {
              const store = transaction.objectStore(storeName);
              const allRecords = [];
              allData[dbNameFromGame][storeName] = allRecords;

              store.openCursor().onsuccess = e => {
                  const cursor = e.target.result;
                  if(cursor) {
                      allRecords.push({ key: cursor.key, value: cursor.value });
                      cursor.continue();
                  } else {
                      storesCompleted++;
                      if (storesCompleted === storesCount) {
                          iframeRef.current.contentWindow.postMessage({ type: 'loadData', payload: allData }, '*');
                      }
                  }
              }
          }
        }

        if (type === 'saveData') {
            const db = dbRef.current;
            if (!db) return;

            const dbNameFromGame = Object.keys(payload)[0];
            const storeData = payload[dbNameFromGame];
            const storeNames = Object.keys(storeData);

            // Dynamically create stores if they don't exist
            const currentStoreNames = new Set(db.objectStoreNames);
            const newStoreNames = storeNames.filter(name => !currentStoreNames.has(name));

            if (newStoreNames.length > 0) {
                const currentVersion = db.version;
                db.close();
                const reopenRequest = indexedDB.open(dbName, currentVersion + 1);
                reopenRequest.onupgradeneeded = event => {
                    const upgradeDb = event.target.result;
                    newStoreNames.forEach(name => upgradeDb.createObjectStore(name));
                };
                reopenRequest.onsuccess = event => {
                    dbRef.current = event.target.result;
                    saveDataToDb(storeData);
                }
            } else {
                saveDataToDb(storeData);
            }
        }
      };
      
      const saveDataToDb = (storeData) => {
        const db = dbRef.current;
        if (!db) return;
        const transaction = db.transaction(Object.keys(storeData), 'readwrite');
        transaction.oncomplete = () => console.log('Parent DB updated.');
        transaction.onerror = err => console.error('Parent DB transaction error:', err);
        
        for(const storeName in storeData) {
            const store = transaction.objectStore(storeName);
            store.clear(); // Clear old data
            storeData[storeName].forEach(record => {
                store.put(record.value, record.key);
            });
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
