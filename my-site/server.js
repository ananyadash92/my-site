require('dotenv').config();
const express = require('express');
const path = require('path');
const chatHandler = require('./api/chat');
const proposalHandler = require('./api/generate-proposal');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route API requests to serverless functions
app.post('/api/chat', chatHandler);
app.post('/api/generate-proposal', proposalHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API key loaded: ${process.env.OPENROUTER_API_KEY ? 'Yes' : 'NO — check .env file'}`);
});
