const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

app.listen(4000, () => {
  console.log('Backend Express API running on http://localhost:4000');
});
