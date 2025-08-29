const createGameHtml = (game) => {
  if (!game) return '';

  const title = game.title;
  const origin = window.location.origin;
  let content = '';

  switch (game.type) {
    case 'PROXY':
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${game.link}"></iframe>
        </body>
        </html>`;
      break;

    case 'FLASH':
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            object, embed { width: 100%; height: 100%; }
          </style>
          <script>
            window.RufflePlayer = window.RufflePlayer || {};
            window.RufflePlayer.config = {
                // Force scaling to fill the entire area
                "scale": "exactfit",
            };
          </script>
          <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
        </head>
        <body>
          <object>
            <embed src="${game.link}" />
          </object>
        </body>
        </html>`;
      break;

    case 'EMULATOR':
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
            #game { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="game"></div>
          <script>
            window.EJS_pathtodata = "https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/";
            window.EJS_core = "${game.core}";
            window.EJS_gameUrl = "${game.link}";
            window.EJS_player = "#game";
          </script>
          <script src="https://cdn.jsdelivr.net/gh/ethanaobrien/emulatorjs@main/data/loader.js"></script>
        </body>
        </html>`;
      break;
    
    case 'LOVE':
        content = `
        <!DOCTYPE html>
        <html>
        <head>
            <script>
                // --- Communication with Parent Window for IndexedDB Persistence ---
                let isDataLoaded = false;
                let startGameFunction = null;

                window.addEventListener('message', event => {
                    if (event.data && event.data.type === 'loadData') {
                        const dbData = event.data.payload;
                        if (!dbData || Object.keys(dbData).length === 0) {
                            console.log('No save data from parent, starting fresh.');
                            isDataLoaded = true;
                            if (startGameFunction) startGameFunction();
                            return;
                        }

                        const dbName = Object.keys(dbData)[0];
                        const request = indexedDB.open(dbName, 1);

                        request.onupgradeneeded = e => {
                            const db = e.target.result;
                            const storeData = dbData[dbName];
                            for (const storeName in storeData) {
                                if (!db.objectStoreNames.contains(storeName)) {
                                    db.createObjectStore(storeName);
                                }
                            }
                        };

                        request.onsuccess = e => {
                            const db = e.target.result;
                            const storeData = dbData[dbName];
                            const storeNames = Object.keys(storeData);
                            if (storeNames.length === 0) {
                                isDataLoaded = true;
                                if (startGameFunction) startGameFunction();
                                return;
                            }

                            const transaction = db.transaction(storeNames, 'readwrite');
                            transaction.oncomplete = () => {
                                console.log('Local IndexedDB populated from parent.');
                                isDataLoaded = true;
                                if (startGameFunction) startGameFunction();
                            };
                            transaction.onerror = err => console.error('Error populating local IndexedDB:', err);

                            for (const storeName of storeNames) {
                                const store = transaction.objectStore(storeName);
                                store.clear();
                                storeData[storeName].forEach(record => {
                                    store.put(record.value, record.key);
                                });
                            }
                        };
                        request.onerror = err => console.error("Error opening local DB for population:", err);
                    }
                });

                const originalTransaction = IDBDatabase.prototype.transaction;
                IDBDatabase.prototype.transaction = function(...args) {
                    const transaction = originalTransaction.apply(this, args);
                    const dbName = this.name;
                    const mode = args[1];

                    if (mode === 'readwrite') {
                        transaction.addEventListener('complete', () => {
                            console.log('Readwrite transaction completed, sending data to parent.');
                            const storeNames = Array.from(args[0]);
                            const finalDbState = { [dbName]: {} };

                            const readTx = this.transaction(storeNames, 'readonly');
                            let storesCompleted = 0;

                            storeNames.forEach(storeName => {
                                const store = readTx.objectStore(storeName);
                                const allRecords = [];
                                finalDbState[dbName][storeName] = allRecords;
                                
                                store.openCursor().onsuccess = event => {
                                    const cursor = event.target.result;
                                    if (cursor) {
                                        allRecords.push({ key: cursor.key, value: cursor.value });
                                        cursor.continue();
                                    } else {
                                        storesCompleted++;
                                        if (storesCompleted === storeNames.length) {
                                            window.parent.postMessage({ type: 'saveData', payload: finalDbState }, '*');
                                        }
                                    }
                                };
                            });
                        });
                    }
                    return transaction;
                };

                window.parent.postMessage({ type: 'iframeReady' }, '*');
            </script>
            <script src="${origin}/Balatro/love.min.js"></script>
            <title>Love.js</title>
            <style>
                #canvas { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; }
                body { width: 100vw; height: 100vh; margin: 0px; }
            </style>
        </head>
        <body>
            <canvas id="canvas"></canvas>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
            <script>
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('${origin}/Balatro/sw.js').then(r => console.log('SW registered: ', r)).catch(e => console.log('SW registration failed: ', e));
                });
              }
            </script>
            <script>
                const startGame = async () => {
                    const zipUrl = "${origin}/Balatro/module.js.zip";
                    const zipResponse = await fetch(zipUrl);
                    const zipArrayBuffer = await zipResponse.arrayBuffer();
                    const zip = new JSZip();
                    const loadedZip = await zip.loadAsync(zipArrayBuffer);
                    const moduleJsFile = loadedZip.file("module.js");
                    const moduleJsContent = await moduleJsFile.async("text");
                    eval(moduleJsContent);
                    const d = await getSource();
                    Module = {
                        INITIAL_MEMORY: 2 ** 28,
                        canvas: canvas,
                        printErr: console.error,
                        arguments: ["game.love"]
                    };
                    Module.preRun = [function() {
                        Module.addRunDependency("fp game.love");
                        var ptr = Module.getMemory(d.length);
                        Module['HEAPU8'].set(d, ptr);
                        Module.FS_createDataFile('/', "game.love", d, true, true, true);
                        Module.removeRunDependency("fp game.love")
                    }];
                    Love(Module)
                };
                startGameFunction = () => {
                    startGame().catch(e => {
                        alert("Error during game initialization:", e);
                    });
                };
                if (isDataLoaded) {
                    startGameFunction();
                }
            </script>
        </body>
        </html>`;
        break;

    default:
      content = `Unsupported game type: ${game.type}`;
  }

  return content;
};

export default createGameHtml;
