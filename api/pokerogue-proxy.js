import fetch from 'node-fetch';
import path from 'path';

export default async function (req, res) {
  const { assetPath } = req.query;

  if (!assetPath) {
    return res.status(400).send('Missing assetPath query parameter.');
  }

  const baseCdnUrl = 'https://cdn.jsdelivr.net/gh/Cyanide-App/cyan-assets@main/HTML/Poke_Rouge/pokerogue-beta/';
  const fullUrl = `${baseCdnUrl}${assetPath}`;

  try {
    const response = await fetch(fullUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from CDN: ${response.status} ${response.statusText} for ${fullUrl}`);
      return res.status(response.status).send(`Failed to fetch asset from CDN: ${response.statusText}`);
    }

    const extension = path.extname(assetPath).toLowerCase();

    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.htm': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.ts': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ttf': 'font/ttf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.webmanifest': 'application/manifest+json',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.flac': 'audio/flac',
      '.opus': 'audio/opus',
    };

    const contentType = mimeTypes[extension] || response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    if (extension === '.html' || extension === '.htm') {
      let html = await response.text();

      // Remove the base tag since we are rewriting all paths to be absolute to our proxy
      html = html.replace(/<base\s+href=".*">/gi, '');

      const currentDir = path.posix.dirname(assetPath);

      const rewriteUrl = (url) => {
        if (!url || url.startsWith('data:') || url.startsWith('http') || url.startsWith('//') || url.startsWith('/') || url.startsWith('#')) {
          return url;
        }
        // Resolve the relative path against the current file's directory
        const newAssetPath = path.posix.join(currentDir, url);
        // Return the new path through our proxy
        return `/api/pokerogue-proxy?assetPath=${newAssetPath}`;
      };

      // Rewrite src and href attributes, ignoring hash links (#)
      html = html.replace(/(src|href)=(['"])(?!#)(.*?)\2/gi, (match, attr, quote, url) => {
        return `${attr}=${quote}${rewriteUrl(url)}${quote}`;
      });
      
      // Rewrite service worker registration paths
      html = html.replace(/navigator\.serviceWorker\.register\((['"])(.*?)\1/gi, (match, quote, url) => {
        return `navigator.serviceWorker.register(${quote}${rewriteUrl(url)}${quote}`;
      });

      res.send(html);
    } else {
      response.body.pipe(res);
    }

  } catch (error)
 {
    console.error('Error in PokeRogue proxy:', error);
    res.status(500).send('Internal Server Error while proxying PokeRogue asset.');
  }
}
