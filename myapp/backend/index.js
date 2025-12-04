const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ML server URL
const ML_SERVER = 'http://localhost:5001';
// Chatbot python service
const CHATBOT_SERVER = 'http://localhost:5002';

// Proxy endpoint for ML predictions
app.post('/api/predict', async (req, res) => {
  try {
    const { features } = req.body;
    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: 'Invalid input. Features must be an array.' });
    }

    // Forward to ML server
    const response = await axios.post(`${ML_SERVER}/api/predict`, { features });
    res.json(response.data);
  } catch (error) {
    console.error('ML prediction error:', error.message);
    // Return fallback prediction if ML server fails
    res.json({ prediction: { attention: 0.33, calm: 0.33, drowsiness: 0.34 } });
  }
});

// Placeholder Gemini endpoint
app.post('/api/generate/quiz', (req, res) => {
  const { context } = req.body;
  res.json({ quiz: `Sample quiz for context: ${context}` });
});

app.post('/api/generate/deeper', (req, res) => {
  const { topic } = req.body;
  res.json({ deeperDive: `Expanded explanation for topic: ${topic}` });
});

app.post('/api/analyze/analogy', (req, res) => {
  const { analogy, source } = req.body;
  res.json({ evaluation: `Evaluation of analogy '${analogy}' for source '${source}'.` });
});

// Placeholder Brain.js endpoint
app.post('/api/bci/stream', (req, res) => {
  const { eegData } = req.body;
  res.json({ state: 'attention', received: eegData });
});

// Routes frontend chat messages to the Python-based LLM companion
app.post('/api/chat', async (req, res) => {
  const { message, profile = 'normal', state = 'calm' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required and must be a string.' });
  }

  try {
    const response = await axios.post(`${CHATBOT_SERVER}/api/chat`, {
      message,
      profile,
      state,
    });
    return res.json(response.data);
  } catch (error) {
    console.error('Chatbot error:', error.message || error);
    const message = 'The chatbot is temporarily unavailable. Please try again shortly.';
    return res.status(502).json({ reply: message });
  }
});

app.listen(4000, () => {
  console.log('Backend Express API running on http://localhost:4000');
});
