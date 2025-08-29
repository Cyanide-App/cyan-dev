import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.resolve(process.cwd(), 'public/Balatro/index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error loading game');
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
}
