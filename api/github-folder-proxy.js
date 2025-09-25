
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';

async function getFolderContents(owner, repo, path, branch = 'main') {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch folder contents: ${response.statusText}`);
  }
  return response.json();
}

async function downloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  return response.buffer();
}

export default async function (req, res) {
  const { owner, repo, path, branch } = req.query;

  if (!owner || !repo || !path) {
    return res.status(400).send('Missing owner, repo, or path query parameter.');
  }

  const zip = new AdmZip();

  try {
    const contents = await getFolderContents(owner, repo, path, branch);

    async function processEntries(entries, currentPath) {
      for (const item of entries) {
        if (item.type === 'file') {
          console.log(`Downloading file: ${item.path}`);
          const fileContent = await downloadFile(item.download_url);
          zip.addFile(item.path.substring(path.length), fileContent);
        } else if (item.type === 'dir') {
          console.log(`Processing directory: ${item.path}`);
          const subEntries = await getFolderContents(owner, repo, item.path, branch);
          await processEntries(subEntries, item.path);
        }
      }
    }

    await processEntries(contents, path);

    const zipBuffer = zip.toBuffer();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${repo}-${path.replace(/\//g, '-')}.zip`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Error in GitHub folder proxy:', error);
    res.status(500).send('Internal Server Error while proxying GitHub folder.');
  }
}
