const express = require('express');
const fs = require('fs');
const brain = require('brain.js');

const app = express();
const PORT = 5001;

// Load the trained model and scaler
const modelData = JSON.parse(fs.readFileSync('cognitive_state_model_final.json'));
const scalerData = JSON.parse(fs.readFileSync('scaler_final.json'));
const net = new brain.NeuralNetwork();
net.fromJSON(modelData);

// Middleware to parse JSON requests
app.use(express.json());

// Scale input features
function scaleFeatures(features, scaler) {
  return features.map((value, index) => (value - scaler.means[index]) / (scaler.stds[index] || 1));
}

// Endpoint to predict cognitive state
app.post('/api/predict', (req, res) => {
  const { features } = req.body;

  if (!features || !Array.isArray(features)) {
    return res.status(400).json({ error: 'Invalid input. Features must be an array.' });
  }

  try {
    const scaledFeatures = scaleFeatures(features, scalerData);
    const prediction = net.run(scaledFeatures);
    res.json({ prediction });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to process the prediction.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`ML server running on http://localhost:${PORT}`);
});