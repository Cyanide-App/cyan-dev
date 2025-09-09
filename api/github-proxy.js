import fetch from 'node-fetch';
import path from 'path';

export default async function (req, res) {
  const { assetPath, relativePath } = req.query;

  if (!assetPath) {
    return res.status(400).send('Missing assetPath query parameter.');
  }

  const githubRepoOwner = 'Cyanide-App';
  const githubRepoName = 'cyan-assets';
  const githubBranch = 'main';

  // If a relativePath is provided, resolve it against the assetPath's directory.
  const finalAssetPath = relativePath
    ? path.join(path.dirname(assetPath), relativePath)
    : assetPath;

  const rawGithubUrl = `https://raw.githubusercontent.com/${githubRepoOwner}/${githubRepoName}/${githubBranch}/${finalAssetPath.replace(/\\/g, '/')}`;

  try {
    const response = await fetch(rawGithubUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText} for ${finalAssetPath}`);
      return res.status(response.status).send(`Failed to fetch asset from GitHub: ${response.statusText}`);
    }

    // Determine and set Content-Type based on file extension
    if (finalAssetPath.endsWith('.html') || finalAssetPath.endsWith('.htm')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (finalAssetPath.endsWith('.js') || finalAssetPath.endsWith('.ts')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (finalAssetPath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (finalAssetPath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (finalAssetPath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (finalAssetPath.endsWith('.jpg') || finalAssetPath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (finalAssetPath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (finalAssetPath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (finalAssetPath.endsWith('.swf')) {
      res.setHeader('Content-Type', 'application/x-shockwave-flash');
    } else if (finalAssetPath.endsWith('.love')) { // Added for .love files
      res.setHeader('Content-Type', 'application/x-love-game'); // Or application/octet-stream
    }
    else {
      // Fallback to the content-type provided by GitHub or a generic binary type
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      } else {
        res.setHeader('Content-Type', 'application/octet-stream'); // Generic binary fallback
      }
    }

    if (finalAssetPath.endsWith('.html') || finalAssetPath.endsWith('.htm')) {
      let html = await response.text();
      // Replace relative paths in the HTML
      html = html.replace(/(href|src)="\.\//g, `$1="/api/github-proxy?assetPath=${assetPath}&relativePath=`);
      res.send(html);
    } else {
      response.body.pipe(res);
    }

  } catch (error) {
    console.error('Error in GitHub proxy:', error);
    res.status(500).send('Internal Server Error while proxying GitHub asset.');
  }
}
