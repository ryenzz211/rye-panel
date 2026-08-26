import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 Rye Panel</h1>
    <p>Server berjalan dengan baik.</p>
    <form id="loginForm" onsubmit="login(event)">
      <input type="text" id="username" placeholder="username" value="admin"><br>
      <input type="password" id="password" placeholder="password" value="admin123"><br>
      <button type="submit">Login</button>
    </form>
    <div id="result"></div>
    <script>
      async function login(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          document.getElementById('result').innerText = JSON.stringify(data, null, 2);
        } catch (err) {
          document.getElementById('result').innerText = 'Error: ' + err.message;
        }
      }
    </script>
  `);
});

// API Login (HARUS ADA)
app.post('/api/login', (req, res) => {
  console.log('[LOGIN] Request received:', req.body);
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'fake-jwt-token-123', user: { id: 1, username: 'admin' } });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Health check
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Rye Panel running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📌 /api/login is registered`);
});
