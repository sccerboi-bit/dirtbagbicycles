const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Store waitlist emails to a JSON file (persists on Render disk)
const WAITLIST_FILE = path.join(__dirname, 'waitlist.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API endpoint for email signup
app.post('/api/signup', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  let waitlist = [];
  try {
    waitlist = JSON.parse(fs.readFileSync(WAITLIST_FILE, 'utf8'));
  } catch (e) { /* first entry */ }

  // Dedupe
  if (waitlist.some(e => e.email === email)) {
    return res.json({ ok: true, message: 'Already on the list.' });
  }

  waitlist.push({ email, ts: new Date().toISOString() });
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));

  console.log(`Waitlist signup: ${email} (total: ${waitlist.length})`);
  res.json({ ok: true, message: 'Got it.' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`dirtbag bicycles running on port ${PORT}`);
});
