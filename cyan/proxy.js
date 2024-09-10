const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  changeOrigin: true, // Add this line
});

proxy.on('proxyRes', function (proxyRes, req, res) {
  proxyRes.headers['Access-Control-Allow-Origin'] = '*'; // Or your frontend domain
});

const server = http.createServer((req, res) => {
  const targetUrl = req.url.substring(1);

  try {
    const url = new URL(targetUrl);
    proxy.web(req, res, { target: url.origin });
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid URL');
  }
});

server.listen(3001);
