const express = require('express');
const path = require('path');
const { nanoid } = require('nanoid');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Read URLs from JSON file
function readUrls() {
    try {
        const data = fs.readFileSync('db.json', 'utf8');
        return JSON.parse(data).urls;
    } catch (error) {
        return [];
    }
}

// Write URLs to JSON file
function writeUrls(urls) {
    fs.writeFileSync('db.json', JSON.stringify({ urls }, null, 2));
}

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Endpoint to create short URL
app.post('/shorten', (req, res) => {
    const longUrl = req.body.url;
    if (!longUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    // Generate a short ID (6 characters)
    const shortId = nanoid(6);
    
    // Read current URLs and add new one
    const urls = readUrls();
    urls.push({ id: shortId, url: longUrl });
    writeUrls(urls);

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;
    res.json({ shortUrl });
});

// Redirect endpoint
app.get('/:shortId', (req, res) => {
    const { shortId } = req.params;
    const urls = readUrls();
    const urlEntry = urls.find(entry => entry.id === shortId);

    if (!urlEntry) {
        return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }

    res.sendFile(path.join(__dirname, 'public', 'redirect.html'));
});

// API endpoint to get the original URL
app.get('/api/url/:shortId', (req, res) => {
    const { shortId } = req.params;
    const urls = readUrls();
    const urlEntry = urls.find(entry => entry.id === shortId);

    if (!urlEntry) {
        return res.status(404).json({ error: 'URL not found' });
    }

    res.json({ url: urlEntry.url });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 