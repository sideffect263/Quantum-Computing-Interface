const express = require('express');
const QuantumCircuit = require('../models/QuantumCircuit');
const router = express.Router();
const { executeCircuit } = require('../controllers/executionController');
const { getJobResults } = require('../controllers/jobController');
const { diffieHellmanKeyExchange } = require('../controllers/diffieHellmanController');

// Define routes
router.post('/circuit', (req, res) => {
  const { qubits } = req.body;
  try {
    const circuit = new QuantumCircuit(qubits);
    const result = circuit.createCircuit();
    res.status(200).json({ status: 'success', message: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/execute', executeCircuit);
router.get('/jobs/:jobId', getJobResults);
router.post('/diffie-hellman', diffieHellmanKeyExchange);

module.exports = router;
