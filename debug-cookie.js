const url = 'http://localhost:5000/api/auth/login';
const body = JSON.stringify({ username: 'debuguser1', password: 'debugpass1' });

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      credentials: 'include',
    });
    console.log('status', res.status);
    console.log('headers:');
    for (const [name, value] of res.headers.entries()) {
      console.log(`${name}: ${value}`);
    }
    const text = await res.text();
    console.log('body', text);
  } catch (err) {
    console.error(err);
  }
})();
