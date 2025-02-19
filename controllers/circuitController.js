const { QuantumCircuit } = require('qiskit');

exports.createCircuit = async (req, res) => {
  try {
    const { qubits } = req.body;

    // Create a new quantum circuit
    const circuit = new QuantumCircuit(qubits);
    
    // Apply Hadamard gate to each qubit
    for (let i = 0; i < qubits; i++) {
      circuit.h(i);
    }

    // Apply CNOT gate between the first two qubits (if there are at least 2 qubits)
    if (qubits > 1) {
      circuit.cx(0, 1);
    }

    // Measure all qubits
    for (let i = 0; i < qubits; i++) {
      circuit.measure(i, i);
    }

    // Convert to QASM format
    const qasm = circuit.toQASM();
    
    res.status(200).json({
      status: 'success',
      circuit: qasm
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
