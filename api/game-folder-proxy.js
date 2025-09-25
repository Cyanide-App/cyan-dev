// api/game-folder-proxy.js

import fetch from 'node-fetch';
import path from 'path';

// Memory cache: { [fullAssetPath]: Buffer }
const cache = {};
const repoOwner = 'Cyanide-App';
const repoName = 'cyan-assets';
const branch = 'main';

/**
 * API handler
 */
export default async function handler(req, res) {
  const { folderPath, filePath } = req.query;

  if (!folderPath || !filePath) {
    return res.status(400).send('Missing folderPath or filePath query parameter.');
  }

  const fullAssetPath = path.posix.join(folderPath, filePath);

  let fileBuffer;

  // Check cache
  if (cache[fullAssetPath]) {
    fileBuffer = cache[fullAssetPath];
  } else {
    // Fetch from GitHub
    const rawGithubUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${fullAssetPath}`;

    try {
      const response = await fetch(rawGithubUrl);

      if (!response.ok) {
        console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText} for ${fullAssetPath}`);
        return res.status(response.status).send(`Failed to fetch asset from GitHub: ${response.statusText}`);
      }

      // Use arrayBuffer() and convert to Buffer
      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      // Cache the file
      cache[fullAssetPath] = fileBuffer;
      console.log('Cached file:', fullAssetPath);

    } catch (error) {
      console.error('Error in game folder proxy:', error);
      return res.status(500).send('Internal Server Error while proxying GitHub asset.');
    }
  }

  if (!fileBuffer) {
    return res.status(404).send('File not found');
  }

  // Content-Type
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.webmanifest': 'application/manifest+json',
  }[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', mime);

  // If HTML, rewrite asset links for proxy
  if (ext === '.html' || ext === '.htm') {
    let html = fileBuffer.toString('utf-8');
    const currentDir = path.posix.dirname(filePath);

    // Rewrite src and href for relative paths
    html = html.replace(/(src|href)=["'](?!http|data:|#|\/\/|\/)([^"']+)["']/gi, (match, attr, url) => {
      // Resolve relative paths like ../
      const newPath = path.posix.join(currentDir, url);
      return `${attr}="/api/game-folder-proxy?folderPath=${encodeURIComponent(folderPath)}&filePath=${encodeURIComponent(newPath)}"`;
    });

    res.send(html);
  } else {
    res.send(fileBuffer);
  }
}