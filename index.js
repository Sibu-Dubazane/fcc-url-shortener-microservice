const express = require("express");
const dns = require("dns");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

// Basic in-memory storage (for simplicity)
let urlDatabase = [];
let id = 1;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("URL Shortener Microservice");
});

// POST /api/shorturl - shorten URL
app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  // Validate URL format using regex or URL class
  try {
    let urlObj = new URL(originalUrl);

    // dns.lookup to verify hostname
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      } else {
        // Check if URL is already stored
        let found = urlDatabase.find((u) => u.original_url === originalUrl);
        if (found) {
          return res.json(found);
        }
        // Store new URL with short_url
        let newUrl = { original_url: originalUrl, short_url: id++ };
        urlDatabase.push(newUrl);
        res.json(newUrl);
      }
    });
  } catch {
    return res.json({ error: "invalid url" });
  }
});

// GET /api/shorturl/:short_url - redirect
app.get("/api/shorturl/:short_url", (req, res) => {
  let shortUrl = Number(req.params.short_url);
  let found = urlDatabase.find((u) => u.short_url === shortUrl);

  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
