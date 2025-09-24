import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper function to create directories recursively
const mkdirRecursive = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export default async function (req, res) {
  const { zipPath, filePath = 'index.html' } = req.query;

  if (!zipPath) {
    return res.status(400).send('Missing zipPath query parameter.');
  }

  const githubRepoOwner = 'Cyanide-App';
  const githubRepoName = 'cyan-assets';
  const githubBranch = 'main';

  const rawGithubUrl = `https://cdn.jsdelivr.net/gh/${githubRepoOwner}/${githubRepoName}@${githubBranch}/${zipPath}`;

  // Create a unique directory for extraction based on the zipPath
  const hash = crypto.createHash('md5').update(zipPath).digest('hex');
  const extractionDir = path.join('/tmp', 'cyanide-zips', hash);
  const zipFilePath = path.join(extractionDir, 'source.zip');

  try {
    // Check if already extracted
    if (!fs.existsSync(extractionDir)) {
      console.log(`Cache miss. Downloading and extracting zip for: ${zipPath}`);
      mkdirRecursive(extractionDir);

      const response = await fetch(rawGithubUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch zip from GitHub: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(zipFilePath, Buffer.from(buffer));

      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(extractionDir, /*overwrite*/ true);
      console.log(`Extraction complete for: ${zipPath}`);
    }

    let requestedFilePath = path.join(extractionDir, filePath);

    // If the path is a directory, look for an index.html inside it.
    if (fs.existsSync(requestedFilePath) && fs.lstatSync(requestedFilePath).isDirectory()) {
        requestedFilePath = path.join(requestedFilePath, 'index.html');
    }

    if (!fs.existsSync(requestedFilePath)) {
        return res.status(404).send('File not found in zip.');
    }

    // Set Content-Type
    const fileExtension = path.extname(requestedFilePath).toLowerCase();
    const contentTypes = {
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
        '.swf': 'application/x-shockwave-flash',
    };
    const contentType = contentTypes[fileExtension] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // If HTML, inject base tag
    if (fileExtension === '.html' || fileExtension === '.htm') {
      let html = fs.readFileSync(requestedFilePath, 'utf-8');
      const baseUrl = `/api/zip-proxy?zipPath=${encodeURIComponent(zipPath)}&filePath=`;
      const modifiedHtml = html.replace(/<head>/i, `<head>\n    <base href="${baseUrl}">`);
      res.send(modifiedHtml);
    } else {
      fs.createReadStream(requestedFilePath).pipe(res);
    }

  } catch (error) {
    console.error('Error in zip proxy:', error);
    res.status(500).send('Internal Server Error while processing zip file. Details: ' + error.message);
  }
}
