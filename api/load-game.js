
// api/load-game.js

import fetch from 'node-fetch';
import path from 'path';

const repoOwner = 'Cyanide-App';
const repoName = 'cyan-assets';
const branch = 'main';

/**
 * API handler
 */
export default async function handler(req, res) {
  const { folderPath } = req.query;

  if (!folderPath) {
    return res.status(400).send('Missing folderPath query parameter.');
  }

  // The initial file to load is always index.html for a game folder.
  const filePath = 'index.html';
  const fullAssetPath = path.posix.join(folderPath, filePath);

  // Fetch from GitHub
  const rawGithubUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${fullAssetPath}`;

  try {
    const response = await fetch(rawGithubUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText} for ${fullAssetPath}`);
      return res.status(response.status).send(`Failed to fetch asset from GitHub: ${response.statusText}`);
    }

    const fileBuffer = await response.arrayBuffer().then(ab => Buffer.from(ab));

    // The proxy expects HTML to be rewritten to point to the asset proxy.
    let html = fileBuffer.toString('utf-8');
    const currentDir = path.posix.dirname(filePath); // This will be '.'

    // Rewrite src and href for relative paths to use the game-folder-proxy
    html = html.replace(/(src|href)=["'](?!http|data:|#|\/\/|\/)([^"']+)["']/gi, (match, attr, url) => {
      const newPath = path.posix.join(currentDir, url);
      return `${attr}="/api/game-folder-proxy?folderPath=${encodeURIComponent(folderPath)}&filePath=${encodeURIComponent(newPath)}"`;
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  } catch (error) {
    console.error('Error in game loader proxy:', error);
    return res.status(500).send('Internal Server Error while proxying GitHub asset.');
  }
}
