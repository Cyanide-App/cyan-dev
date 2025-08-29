const createGameHtml = (game) => {
  if (!game) return '';

  const title = game.title;
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

    default:
      content = `Unsupported game type: ${game.type}`;
  }

  return content;
};

export default createGameHtml;
