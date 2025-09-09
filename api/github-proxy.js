// dude all this shit was made with ai idk how proxies work D:
import fetch from 'node-fetch';
import path from 'path';

export default async function (req, res) {
  const { assetPath } = req.query;

  if (!assetPath) {
    return res.status(400).send('Missing assetPath query parameter.');
  }

  const githubRepoOwner = 'Cyanide-App';
  const githubRepoName = 'cyan-assets';
  const githubBranch = 'main';

  // Normalize the path to prevent directory traversal attacks and use forward slashes for the URL.
  const normalizedAssetPath = path.normalize(assetPath).replace(/\\/g, '/');
  
  if (normalizedAssetPath.startsWith('..')) {
    return res.status(400).send('Invalid asset path.');
  }

  const rawGithubUrl = `https://raw.githubusercontent.com/${githubRepoOwner}/${githubRepoName}/${githubBranch}/${normalizedAssetPath}`;

  try {
    const response = await fetch(rawGithubUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText} for ${normalizedAssetPath}`);
      return res.status(response.status).send(`Failed to fetch asset from GitHub: ${response.statusText}`);
    }
    
    const extension = path.extname(normalizedAssetPath).toLowerCase();
    let contentType;
    let isTextBased = false;

    // A map of extensions to content types
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
        '.swf': 'application/x-shockwave-flash',
        '.love': 'application/x-love-game',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'font/otf',
        '.webmanifest': 'application/manifest+json',
    };
    
    contentType = mimeTypes[extension] || response.headers.get('content-type') || 'application/octet-stream';
    isTextBased = ['.html', '.htm', '.css', '.js', '.ts', '.svg', '.json', '.webmanifest'].includes(extension);

    res.setHeader('Content-Type', contentType);

    if (isTextBased && response.body) {
      let content = await response.text();
      const currentDir = path.posix.dirname(normalizedAssetPath);

      const rewriteUrl = (url) => {
        if (!url || url.startsWith('data:') || url.startsWith('http') || url.startsWith('//') || url.startsWith('/')) {
          return url;
        }
        
        // Use posix path functions for URL manipulation
        const newAssetPath = path.posix.normalize(path.posix.join(currentDir, url));
        return `/api/github-proxy?assetPath=${newAssetPath}`;
      };

      if (extension === '.css') {
        content = content.replace(/url\((['"]?)(.*?)\1\)/gi, (match, quote, url) => {
          return `url(${quote}${rewriteUrl(url)}${quote})`;
        });
      } else if (extension === '.html' || extension === '.htm') {
        // Remove the base tag
        content = content.replace(/<base\s+href=".*">/gi, '');
        // Rewrite src and href attributes
        content = content.replace(/(src|href)=(['"])(?!#)(.*?)\2/gi, (match, attr, quote, url) => {
          return `${attr}=${quote}${rewriteUrl(url)}${quote}`;
        });
        // Also handle inline styles with url()
        content = content.replace(/url\((['"]?)(.*?)\1\)/gi, (match, quote, url) => {
          return `url(${quote}${rewriteUrl(url)}${quote})`;
        });
        // Handle service worker registration
        content = content.replace(/navigator\.serviceWorker\.register\((['"])(.*?)\1/gi, (match, quote, url) => {
          return `navigator.serviceWorker.register(${quote}${rewriteUrl(url)}${quote}`;
        });
      } else if (extension === '.js' || extension === '.ts') {
        // Handle import statements and dynamic imports
        content = content.replace(/(import|export)\s*(\{.*\}|\* as \w+)?\s*from\s*(['"])(.*?)\3/gi, (match, action, specifier, quote, url) => {
            if (url.startsWith('phaser')) return match;
            return `${action} ${specifier || ''} from ${quote}${rewriteUrl(url)}${quote}`;
        });
        content = content.replace(/import\((['"])(.*?)\1\)/gi, (match, quote, url) => {
          return `import(${quote}${rewriteUrl(url)}${quote})`;
        });

        // Handle service worker importScripts
        if (normalizedAssetPath.endsWith('service-worker.js')) {
            content = content.replace(/importScripts\((.*)\)/gi, (match, urls) => {
                const urlArray = urls.split(',').map(u => u.trim().replace(/['"]/g, ''));
                const rewrittenUrls = urlArray.map(url => `'${rewriteUrl(url)}'`).join(',');
                return `importScripts(${rewrittenUrls})`;
            });
        }
      }


      res.send(content);
    } else {
      response.body.pipe(res);
    }

  } catch (error) {
    console.error('Error in GitHub proxy:', error);
    res.status(500).send('Internal Server Error while proxying GitHub asset.');
  }
}
