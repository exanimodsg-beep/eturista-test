const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/app', express.static(path.join(__dirname, 'app')));

const PORT = process.env.PORT || 3000;

let latestGuest = null;
let lastUpdated = null;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/trigger', (req, res) => {
  const data = req.body;
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  data.arrival_date = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}`;
  data.arrival_time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  latestGuest = data;
  lastUpdated = now.toISOString();
  console.log('Podaci primljeni:', JSON.stringify(data));
  res.json({ status: 'ok' });
});

app.get('/latest', (req, res) => {
  const clientTime = req.query.since;
  if (!latestGuest || !lastUpdated) return res.json({ hasData: false });
  if (clientTime && new Date(lastUpdated) <= new Date(clientTime)) return res.json({ hasData: false });
  res.json({ hasData: true, data: latestGuest, timestamp: lastUpdated });
});

app.post('/confirm', (req, res) => {
  latestGuest = null;
  lastUpdated = null;
  res.json({ status: 'cleared' });
});

app.listen(PORT, () => console.log(`Server na portu ${PORT}`));
let lastError = null;

app.post('/image-error', (req, res) => {
  lastError = { 
    message: req.body.message || 'Nečitljiva slika',
    timestamp: new Date().toISOString()
  };
  res.json({ status: 'ok' });
});

app.get('/check-error', (req, res) => {
  const clientTime = req.query.since;
  if (!lastError) return res.json({ hasError: false });
  if (clientTime && new Date(lastError.timestamp) <= new Date(clientTime)) {
    return res.json({ hasError: false });
  }
  res.json({ hasError: true, message: lastError.message, timestamp: lastError.timestamp });
});

app.post('/clear-error', (req, res) => {
  lastError = null;
  res.json({ status: 'cleared' });
});
