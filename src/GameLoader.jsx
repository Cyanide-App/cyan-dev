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
                const PREFIX = "Balatro_balatro_";
                const originalOpen = indexedDB.open;
                const originalDeleteDatabase = indexedDB.deleteDatabase;
                indexedDB.open = function(name, version) {
                    const prefixedName = PREFIX + name;
                    return version !== undefined ? originalOpen.call(this, prefixedName, version) : originalOpen.call(this, prefixedName);
                };
                indexedDB.deleteDatabase = function(name) {
                    const prefixedName = PREFIX + name;
                    return originalDeleteDatabase.call(this, prefixedName);
                };
            </script>
            <script src="${origin}/Balatro/love.min.js"></script>
            <title>Love.js</title>
            <style>
                #canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                }
                body {
                    width: 100vw;
                    height: 100vh;
                    margin: 0px;
                }
            </style>
        </head>
        <body>
            <canvas id="canvas"></canvas>
        
            <!-- Include JSZip library for decompression -->
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
        
            <script>
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('${origin}/Balatro/sw.js').then(registration => {
                    console.log('SW registered: ', registration);
                  }).catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            </script>
        
            <script>
                // This script will now fetch the zipped module.js, decompress it, and then execute it.
                (async () => {
                    // Fetch the zipped module.js
                    const zipUrl = "${origin}/Balatro/module.js.zip";
                    const zipResponse = await fetch(zipUrl);
                    if (!zipResponse.ok) {
                        throw new Error(\`Failed to load module.js.zip: \${zipResponse.statusText}\`);
                    }
                    const zipArrayBuffer = await zipResponse.arrayBuffer();
        
                    // Load the zip file using JSZip
                    const zip = new JSZip();
                    const loadedZip = await zip.loadAsync(zipArrayBuffer);
        
                    // Find and extract module.js from the zip
                    const moduleJsFile = loadedZip.file("module.js"); // Ensure this matches the name inside the zip
                    if (!moduleJsFile) {
                        throw new Error("module.js not found inside the zip archive.");
                    }
                    const moduleJsContent = await moduleJsFile.async("text");
        
                    // Execute the extracted module.js content
                    // WARNING: Using eval() can be a security risk if the source is untrusted.
                    eval(moduleJsContent);
        
                    // Now that module.js is executed and window.getSource should be defined, proceed as usual.
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
                })().catch(e => {
                    alert("Error during game initialization:", e);
                    // Optionally, display an error message to the user here.
                });
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
