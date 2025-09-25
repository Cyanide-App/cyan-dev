import fetch from 'node-fetch';

export default async function (req, res) {
  const { owner, repo, folderPath } = req.query;
  const assetPath = req.url.split('?')[0].substring('/api/game-server'.length);

  if (!owner || !repo || !folderPath) {
    return res.status(400).send('Missing owner, repo, or folderPath query parameter.');
  }

  const githubRepoOwner = owner;
  const githubRepoName = repo;
  const githubBranch = 'main'; // Or get from query param

  // If assetPath is empty, it means we want the index.html of the folder
  const finalAssetPath = assetPath ? `${folderPath}${assetPath}` : `${folderPath}/index.html`;

  const rawGithubUrl = `https://raw.githubusercontent.com/${githubRepoOwner}/${githubRepoName}/${githubBranch}/${finalAssetPath}`;

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch(rawGithubUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText} for ${rawGithubUrl}`);
      return res.status(response.status).send(`Failed to fetch asset from GitHub: ${response.statusText}`);
    }

    // Determine and set Content-Type based on file extension
    if (finalAssetPath.endsWith('.html') || finalAssetPath.endsWith('.htm')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (finalAssetPath.endsWith('.js')) {
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
    } else if (finalAssetPath.endsWith('.love')) {
      res.setHeader('Content-Type', 'application/x-love-game');
    }
    else {
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
    }

    response.body.pipe(res);

  } catch (error) {
    console.error('Error in game server:', error);
    res.status(500).send('Internal Server Error while serving game asset.');
  }
}