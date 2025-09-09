import fetch from 'node-fetch';
import path from 'path';

export default async function (req, res) {
  const { assetPath } = req.query;

  if (!assetPath) {
    return res.status(400).send('Missing assetPath query parameter.');
  }

  const baseProxyUrl = 'https://cdn.jsdelivr.net/gh/Cyanide-App/cyan-assets@main/HTML/Poke_Rouge/pokerogue-beta/';
  const fullUrl = `${baseProxyUrl}${assetPath}`;

  try {
    const response = await fetch(fullUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from CDN: ${response.status} ${response.statusText} for ${fullUrl}`);
      return res.status(response.status).send(`Failed to fetch asset from CDN: ${response.statusText}`);
    }

    const extension = path.extname(assetPath).toLowerCase();

    // Correct the MIME type for TypeScript files
    if (extension === '.ts') {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else {
       const contentType = response.headers.get('content-type');
       if (contentType) {
         res.setHeader('Content-Type', contentType);
       }
    }
    
    // For the main HTML file, remove the base tag.
    if (assetPath.endsWith('index.html')) {
        let html = await response.text();
        html = html.replace(/<base\s+href=".*">/gi, '');
        res.send(html)
    } else {
        response.body.pipe(res);
    }


  } catch (error) {
    console.error('Error in PokeRogue proxy:', error);
    res.status(500).send('Internal Server Error while proxying PokeRogue asset.');
  }
}
