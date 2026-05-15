require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
const express = require('express');
const path = require('path');
const chatHandler = require('./api/chat');
const proposalHandler = require('./api/generate-proposal');
const styleArchitectHandler = require('./api/style-architect');
const analyzePhotosHandler = require('./api/analyze-photos');
const sketchProxyHandler = require('./api/sketch-proxy');
const contactHandler = require('./api/contact');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname)));

// Route API requests to serverless functions
app.post('/api/chat', chatHandler);
app.post('/api/generate-proposal', proposalHandler);
app.post('/api/style-architect', styleArchitectHandler);
app.post('/api/analyze-photos', analyzePhotosHandler);
app.get('/api/sketch', sketchProxyHandler);
app.post('/api/contact', contactHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API key loaded: ${process.env.OPENROUTER_API_KEY ? 'Yes' : 'NO — check .env file'}`);
});
