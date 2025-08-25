import fetch from 'node-fetch';

export default async function (req, res) {
  const { assetPath } = req.query;

  if (!assetPath) {
    return res.status(400).send('Missing assetPath query parameter.');
  }

  const githubRepoOwner = 'Cyanide-App';
  const githubRepoName = 'cyan-assets';
  const githubBranch = 'main';

  const rawGithubUrl = `https://raw.githubusercontent.com/${githubRepoOwner}/${githubRepoName}/${githubBranch}/${assetPath}`;

  try {
    const response = await fetch(rawGithubUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText}`);
      return res.status(response.status).send(`Failed to fetch asset from GitHub: ${response.statusText}`);
    }

    // Explicitly set Content-Type for HTML files
    if (assetPath.endsWith('.html') || assetPath.endsWith('.htm')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else {
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
    }

    response.body.pipe(res);

  } catch (error) {
    console.error('Error in GitHub proxy:', error);
    res.status(500).send('Internal Server Error while proxying GitHub asset.');
  }
}