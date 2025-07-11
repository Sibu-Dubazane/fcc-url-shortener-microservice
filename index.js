const express = require('express');
const app = express();
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory DB for shortened URLs
const urlDatabase = [];
// Example: urlDatabase = [{ original_url: 'https://freecodecamp.org', short_url: 1 }, ...]

// Serve homepage or basic info if needed
app.get('/', (req, res) => {
  res.send('URL Shortener Microservice');
});

// POST endpoint to create short URL
app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  // Parse URL to get hostname
  let hostname;
  try {
    hostname = new URL(originalUrl).hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // Validate hostname with dns.lookup
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Check if URL already exists in database
    let found = urlDatabase.find(item => item.original_url === originalUrl);
    if (found) {
      // URL already shortened, return existing
      return res.json({ original_url: found.original_url, short_url: found.short_url });
    }

    // Create new short_url_
