const { QuantumCircuit } = require('qiskit');

exports.executeCircuit = async (req, res) => {
  try {
    const { qasm } = req.body;

    // Create a quantum circuit from QASM
    const circuit = new QuantumCircuit();
    circuit.loadQASM(qasm);

    // Execute the circuit on a simulator
    const result = await circuit.run();

    res.status(200).json({
      status: 'success',
      result: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
