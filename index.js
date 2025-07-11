const express = require("express");
const app = express();
const cors = require("cors");
const dns = require("dns");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory DB for shortened URLs
const urlDatabase = [];

// Serve homepage or basic info if needed
app.get("/", (req, res) => {
  res.send("URL Shortener Microservice");
});

// POST endpoint to create short URL
app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  // Parse URL to get hostname
  let hostname;
  try {
    hostname = new URL(originalUrl).hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  // Validate hostname with dns.lookup
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    // Check if URL already exists in database
    let found = urlDatabase.find((item) => item.original_url === originalUrl);
    if (found) {
      // URL already shortened, return existing
      return res.json({
        original_url: found.original_url,
        short_url: found.short_url,
      });
    }

    // Create new short_url entry
    const shortUrl = urlDatabase.length + 1;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
    return res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET endpoint to redirect short URL to original URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = Number(req.params.short_url);
  const found = urlDatabase.find((item) => item.short_url === shortUrl);

  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
