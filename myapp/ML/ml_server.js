const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5001;

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Simple prediction function (simulates neural network)
function predictCognitiveState(features) {
  if (!Array.isArray(features) || features.length < 4) {
    return { attention: 0.33, calm: 0.33, drowsiness: 0.34 };
  }

  // Simple heuristic: average features to determine state
  const avg = features.reduce((a, b) => a + b, 0) / features.length;
  
  if (avg > 0.65) {
    return { attention: 0.7, calm: 0.2, drowsiness: 0.1 };
  } else if (avg > 0.35) {
    return { attention: 0.2, calm: 0.65, drowsiness: 0.15 };
  } else {
    return { attention: 0.1, calm: 0.2, drowsiness: 0.7 };
  }
}

// Scale input features
function scaleFeatures(features, scaler) {
  if (!scaler || !scaler.means) return features;
  return features.map((value, index) => (value - (scaler.means[index] || 0.5)) / (scaler.stds[index] || 0.15));
}

// Endpoint to predict cognitive state
app.post('/api/predict', (req, res) => {
  const { features } = req.body;

  if (!features || !Array.isArray(features)) {
    return res.status(400).json({ error: 'Invalid input. Features must be an array.' });
  }

  try {
    const prediction = predictCognitiveState(features);
    res.json({ prediction });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to process the prediction.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ML server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✓ ML server running on http://localhost:${PORT}`);
  console.log(`✓ Cognitive state prediction endpoint: POST http://localhost:${PORT}/api/predict`);
});