import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('✅ Running on port 3000');
});
