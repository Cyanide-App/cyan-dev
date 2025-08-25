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

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // IMPORTANT: For HTML files, to ensure relative paths work within the iframe
    // we need to set a <base> tag. However, directly piping won't allow this.
    // A more robust solution for HTML files might involve reading the content,
    // adding a base tag, and then sending it, but for direct iframe src, it often works.
    // For other asset types (JS, CSS, images), direct piping is fine.

    // If it's an HTML file and you want to ensure relative paths work, you might need
    // to read the text, modify it with a <base> tag, and then send.
    // However, given the current GamePage.jsx logic for HTML games (using src directly),
    // the browser *might* correctly infer the base from the iframe's src.

    response.body.pipe(res);

  } catch (error) {
    console.error('Error in GitHub proxy:', error);
    res.status(500).send('Internal Server Error while proxying GitHub asset.');
  }
}