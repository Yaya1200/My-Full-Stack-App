import http from 'http';
const data = JSON.stringify({ username: 'testuser', password: 'testpass' });
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('HEADERS', res.headers);
    console.log('BODY', body);
  });
});
req.on('error', (err) => console.error('REQUEST ERROR', err));
req.write(data);
req.end();
