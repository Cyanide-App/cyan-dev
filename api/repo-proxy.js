import fetch from 'node-fetch';

const GITHUB_REPO_OWNER = 'Cyanide-App';
const GITHUB_REPO_NAME = 'cyan-assets';
const GITHUB_BRANCH = 'main';

async function listAllFiles(repoPath) {
    const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/git/trees/${GITHUB_BRANCH}?recursive=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Cyanide-App' } });
    if (!response.ok) {
        throw new Error(`GitHub API request for git tree failed: ${response.statusText}`);
    }
    const data = await response.json();

    if (data.truncated) {
        console.warn("GitHub API response was truncated. File list may be incomplete.");
    }

    const files = data.tree
        .filter(item => item.type === 'blob' && item.path.startsWith(repoPath + '/'))
        .map(item => item.path.substring(repoPath.length + 1));
    
    return files;
}


export default async function (req, res) {
    const { path: repoPath, file: filePath = 'index.html' } = req.query;

    if (!repoPath) {
        return res.status(400).send('Missing path query parameter.');
    }

    try {
        if (filePath === 'manifest.json') {
            const files = await listAllFiles(repoPath);
            const rootFile = files.find(f => f === 'index.html') || files.find(f => f.toLowerCase().endsWith('index.html'));
            const manifest = {
                files: files,
                root: rootFile || 'index.html',
            };
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(200).send(JSON.stringify(manifest, null, 2));
        }

        const assetPath = `${repoPath}/${filePath}`;
        const rawGithubUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${assetPath}`;

        const response = await fetch(rawGithubUrl);

        if (!response.ok) {
            console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText} for ${assetPath}`);
            return res.status(response.status).send(`Failed to fetch asset from GitHub: ${response.statusText}`);
        }

        const fileExtension = `.${assetPath.split('.').pop()}`;
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

        if (fileExtension === '.html' || fileExtension === '.htm') {
            let html = await response.text();

            // Fix root-relative paths by making them relative, so they can be rewritten.
            html = html.replace(/(src|href)=["']\//gi, '$1="');

            // Rewrite relative URLs to be absolute to the proxy
            const baseUrl = `/api/repo-proxy?path=${encodeURIComponent(repoPath)}&file=`;
            html = html.replace(/(src|href)=["'](?!(https?:|\/\/|data:|mailto:|#))([^"']*)["']/gi, (match, attr, url) => {
                if (!url || url.length === 0) return match; // Empty or undefined url
                const fullUrl = `${baseUrl}${url}`;
                return `${attr}="${fullUrl}"`;
            });

            res.send(html);
        } else {
            response.body.pipe(res);
        }

    } catch (error) {
        console.error('Error in repo proxy:', error);
        res.status(500).send('Internal Server Error while processing repo request. Details: ' + error.message);
    }
}
