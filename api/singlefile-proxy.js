import fs from 'fs';
import path from 'path';

// --- Configuration ---
// Assuming 'cyan-assets' is a sibling directory to this project ('cyan').
// e.g., /home/user/cyan and /home/user/cyan-assets
const assetsRoot = path.resolve(process.cwd(), '../cyan-assets');

// --- Mime Types for Data URIs ---
const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wasm': 'application/wasm',
    '.data': 'application/octet-stream',
    '.json': 'application/json',
    '.unityweb': 'application/octet-stream',
    '.js': 'application/javascript',
    '.css': 'text/css',
};

// --- Utility Functions ---

function fileToDataURI(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    const data = fs.readFileSync(filePath);
    return `data:${mimeType};base64,${data.toString('base64')}`;
}

function getFilesRecursively(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = entries.flatMap(entry => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory() ? getFilesRecursively(fullPath) : [fullPath];
    });
    return files;
}

function escapeRegExp(string) {
    // Escape characters with special meaning either inside or outside character sets.
    return string.replace(/[.*+?^${}()|[\]\\`]/g, '\\$&');
}

// --- API Handler ---

export default async function handler(req, res) {
    const folder = req.query.folder;
    if (!folder) {
        res.statusCode = 400;
        res.end('Error: "folder" query parameter is required.');
        return;
    }

    const targetDir = path.resolve(assetsRoot, folder);

    // Security: Prevent directory traversal attacks
    if (!targetDir.startsWith(assetsRoot)) {
        res.statusCode = 403;
        res.end('Error: Access to the requested path is forbidden.');
        return;
    }

    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
        res.statusCode = 404;
        res.end(`Error: Folder not found at "${targetDir}".`);
        return;
    }

    const htmlFile = fs.readdirSync(targetDir).find(f => f.endsWith('.html'));
    if (!htmlFile) {
        res.statusCode = 404;
        res.end('Error: No .html file found in the specified folder.');
        return;
    }

    let htmlContent = fs.readFileSync(path.join(targetDir, htmlFile), 'utf8');
    const allFiles = getFilesRecursively(targetDir);

    // Create a map of relative paths to their absolute paths
    const fileMap = new Map(
        allFiles.map(absPath => [path.relative(targetDir, 
            absPath).replace(/\\/g, '/'), absPath])    );

    // Inline CSS
    htmlContent = htmlContent.replace(/<link[^>]+href="([^"]+\.css)"[^>]*>/g, (match, cssPath) => {
        const absPath = fileMap.get(cssPath);
        if (absPath && fs.existsSync(absPath)) {
            const cssContent = fs.readFileSync(absPath, 'utf8');
            return `<style>${cssContent}</style>`;
        }
        return match; // Keep link if file not found
    });

    // Inline JS and replace asset references within the JS
    htmlContent = htmlContent.replace(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/g, (match, jsPath) => {
        const absPath = fileMap.get(jsPath);
        if (absPath && fs.existsSync(absPath)) {
            let jsContent = fs.readFileSync(absPath, 'utf8');
            
            // Replace all other file references within this JS file with data URIs
            for (const [relativePath, absolutePath] of fileMap.entries()) {
                if (relativePath !== jsPath) { // Don't replace the script's own path
                    const dataUri = fileToDataURI(absolutePath);
                    // Match the relative path in quotes
                    jsContent = jsContent.replace(new RegExp(`"${escapeRegExp(relativePath)}"`, 'g'), `"${dataUri}"`);
                    jsContent = jsContent.replace(new RegExp(`'${escapeRegExp(relativePath)}'`, 'g'), `'${dataUri}'`);
                }
            }
            return `<script>${jsContent}</script>`;
        }
        return match; // Keep script tag if file not found
    });

    // Final pass: Replace any remaining file references in the HTML (e.g., <img>, <source>)
    for (const [relativePath, absolutePath] of fileMap.entries()) {
        if (!relativePath.endsWith('.js') && !relativePath.endsWith('.css') && !relativePath.endsWith('.html')) {
            const dataUri = fileToDataURI(absolutePath);
            const regex = new RegExp(`(src|href)=["'](${escapeRegExp(relativePath)})["']`, 'g');
            htmlContent = htmlContent.replace(regex, `$1="${dataUri}"`);
        }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(htmlContent);
}