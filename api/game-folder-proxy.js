// api/game-folder-proxy.js

import fetch from 'node-fetch';
import path from 'path';

// Memory cache: { [folderPath]: { [filePath]: Buffer } }
const cache = {};

/**
 * Recursively fetch all files in a folder from GitHub
 */
async function fetchAllFiles(folderPath, branch = 'main', repoOwner = 'Cyanide-App', repoName = 'cyan-assets') {
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}?ref=${branch}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Failed to list folder: ${folderPath}`);
  const items = await res.json();

  let files = {};

  for (const item of items) {
    if (item.type === 'file') {
      // Download file
      const fileRes = await fetch(item.download_url);
      if (!fileRes.ok) throw new Error(`Failed to download file: ${item.download_url}`);
      const buffer = await fileRes.buffer();
      // Store under folderPath/fileName
      const relPath = path.posix.relative(folderPath, item.path);
      files[relPath] = buffer;
    } else if (item.type === 'dir') {
      // Recursively fetch subfolder
      const subFiles = await fetchAllFiles(item.path, branch, repoOwner, repoName);
      for (const [subRelPath, buf] of Object.entries(subFiles)) {
        files[path.posix.join(item.name, subRelPath)] = buf;
      }
    }
  }
  return files;
}

/**
 * API handler
 */
export default async function handler(req, res) {
  const { folderPath = 'HTML/BTTS', filePath = 'index.html' } = req.query;

  // Check cache
  if (!cache[folderPath]) {
    try {
      // Fetch and cache all files in folder
      cache[folderPath] = await fetchAllFiles(folderPath);
      console.log('Cached folder:', folderPath);
    } catch (e) {
      console.error(e);
      return res.status(500).send('Failed to cache folder');
    }
  }

  // Serve file from cache
  const fileBuffer = cache[folderPath][filePath];
  if (!fileBuffer) return res.status(404).send('File not found in cache');

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

    // Rewrite src and href
    html = html.replace(/(src|href)=["'](?!http|data:|#|\/\/|\/)([^"']+)["']/gi, (match, attr, url) => {
      const newPath = path.posix.join(currentDir, url);
      return `${attr}="/api/game-folder-proxy?folderPath=${encodeURIComponent(folderPath)}&filePath=${encodeURIComponent(newPath)}"`;
    });

    res.send(html);
  } else {
    res.send(fileBuffer);
  }
}