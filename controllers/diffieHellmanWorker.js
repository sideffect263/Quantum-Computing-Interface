const { Worker } = require('worker_threads');
const path = require('path');

// Configuration constants
const MAX_COMPUTATION_TIME = 30000; // 30 seconds timeout
const MAX_BIT_LENGTH = 128; // Maximum allowed bit length
const MEMORY_THRESHOLD = 0.95; // 95% memory usage threshold - adjusted higher

// Helper function to check system resources with more lenient thresholds
function checkSystemResources() {
  const memoryUsage = process.memoryUsage();
  
  // Calculate memory usage more accurately
  const totalMemoryUsed = memoryUsage.heapUsed + memoryUsage.external;
  const totalMemoryAvailable = memoryUsage.heapTotal;
  const usedMemoryPercentage = totalMemoryUsed / totalMemoryAvailable;
  
  // Only throw if we're really running out of memory
  if (usedMemoryPercentage > MEMORY_THRESHOLD && totalMemoryUsed > 1024 * 1024 * 500) { // 500MB minimum
    throw new Error('System resource limit reached. Please try again later.');
  }
}

// Helper function to calculate bit length
function calculateBitLength(num) {
  return BigInt(num).toString(2).length;
}

// Validate input parameters
function validateInputs(prime, generator, privateKey, otherPublicKey) {
  // Ensure all inputs are valid numbers
  try {
    const p = BigInt(prime);
    const g = BigInt(generator);
    const priv = BigInt(privateKey);
    const pub = BigInt(otherPublicKey);
    
    const primeBitLength = calculateBitLength(p);
    
    if (primeBitLength > MAX_BIT_LENGTH) {
      throw new Error(`Prime number exceeds maximum allowed bit length of ${MAX_BIT_LENGTH}`);
    }
    
    if (priv >= p) {
      throw new Error('Private key must be less than prime');
    }

    if (g <= 1n || g >= p) {
      throw new Error('Generator must be between 1 and prime');
    }

    return true;
  } catch (error) {
    if (error.message.includes('BigInt')) {
      throw new Error('Invalid number format in input parameters');
    }
    throw error;
  }
}

// Main controller function
exports.diffieHellmanKeyExchange = async (req, res) => {
  const startTime = Date.now();
  let computationWorker = null;

  try {
    const { prime, generator, privateKey, otherPublicKey } = req.body;
    
    if (!prime || !generator || !privateKey || !otherPublicKey) {
      throw new Error('Missing required parameters');
    }

    // Initial validation
    validateInputs(prime, generator, privateKey, otherPublicKey);
    
    // Only check resources for larger computations
    if (calculateBitLength(prime) > 32) {
      checkSystemResources();
    }

    // Create a promise that will reject after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        if (computationWorker) {
          computationWorker.terminate();
        }
        reject(new Error('Computation timed out'));
      }, MAX_COMPUTATION_TIME);
    });

    // Create a promise for the worker computation
    const computationPromise = new Promise((resolve, reject) => {
      computationWorker = new Worker(path.join(__dirname, 'diffieHellmanWorker.js'), {
        workerData: { prime, generator, privateKey, otherPublicKey }
      });

      computationWorker.on('message', resolve);
      computationWorker.on('error', reject);
      computationWorker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });

    // Race between timeout and computation
    const result = await Promise.race([
      computationPromise,
      timeoutPromise
    ]);

    const executionTime = Date.now() - startTime;

    res.status(200).json({
      status: 'success',
      ...result,
      performance: {
        executionTime,
        bitLength: calculateBitLength(prime)
      }
    });

  } catch (error) {
    console.error('Diffie-Hellman computation error:', error);

    // Ensure worker is terminated in case of error
    if (computationWorker) {
      computationWorker.terminate();
    }

    // Handle different types of errors
    let statusCode = 500;
    if (error.message.includes('Missing required parameters') || 
        error.message.includes('Invalid number format')) {
      statusCode = 400;
    } else if (error.message.includes('timed out')) {
      statusCode = 408;
    }

    res.status(statusCode).json({
      status: 'error',
      message: error.message,
      suggestedAction: getSuggestedAction(error.message)
    });
  }
};

// Helper function to provide appropriate suggestions based on error
function getSuggestedAction(errorMessage) {
  if (errorMessage.includes('bit length')) {
    return 'Try using a smaller prime number';
  } else if (errorMessage.includes('Invalid number format')) {
    return 'Please ensure all inputs are valid numbers';
  } else if (errorMessage.includes('timed out')) {
    return 'Try using smaller numbers or try again later';
  } else if (errorMessage.includes('resource limit')) {
    return 'Server is under heavy load, please try again in a few minutes';
  }
  return 'Please try again with different parameters';
}