const MAX_BIT_LENGTH = 2048; // Maximum allowed bit length
const TIMEOUT_MS = 10000;    // 10 second timeout
const MAX_MEMORY_USAGE = 1024 * 1024 * 512; // 512MB memory limit

exports.diffieHellmanKeyExchange = async (req, res) => {
  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Computation timed out')), TIMEOUT_MS);
  });

  try {
    const { prime, generator, privateKey, otherPublicKey } = req.body;

    // Input validation and sanitization
    if (!prime || !generator || !privateKey || !otherPublicKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters'
      });
    }

    // Convert inputs safely with error handling
    let p, g, privateKeyNum, otherPublicKeyNum;
    try {
      p = BigInt(prime);
      g = BigInt(generator);
      privateKeyNum = BigInt(privateKey);
      otherPublicKeyNum = BigInt(otherPublicKey);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid number format in input'
      });
    }

    // Check bit length limits
    const primeBitLength = getBitLength(p);
    if (primeBitLength > MAX_BIT_LENGTH) {
      return res.status(400).json({
        status: 'error',
        message: `Prime number exceeds maximum allowed bit length of ${MAX_BIT_LENGTH}`
      });
    }

    // Validate inputs
    if (!isPrime(p)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid prime number'
      });
    }
    if (!isValidGenerator(g, p)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid generator value'
      });
    }
    if (privateKeyNum >= p) {
      return res.status(400).json({
        status: 'error',
        message: 'Private key must be less than prime'
      });
    }

    // Start timing
    const startTime = process.hrtime();

    // Wrap computation in a promise to enable timeout
    const computationPromise = async () => {
      // Check memory usage before heavy computation
      const memoryUsage = process.memoryUsage().heapUsed;
      if (memoryUsage > MAX_MEMORY_USAGE) {
        throw new Error('Memory usage exceeded limit');
      }

      const publicKeyStartTime = process.hrtime();
      const publicKey = await safeModPow(g, privateKeyNum, p);
      const publicKeyTime = getElapsedMs(publicKeyStartTime);

      const secretStartTime = process.hrtime();
      const sharedSecret = await safeModPow(otherPublicKeyNum, privateKeyNum, p);
      const secretTime = getElapsedMs(secretStartTime);

      return {
        publicKey,
        publicKeyTime,
        sharedSecret,
        secretTime
      };
    };

    // Race between computation and timeout
    const { publicKey, publicKeyTime, sharedSecret, secretTime } = await Promise.race([
      computationPromise(),
      timeoutPromise
    ]);

    const totalTime = getElapsedMs(startTime);
    const computationalComplexity = `O(log²(n)) ≈ ${Math.pow(Math.log2(Number(p)), 2).toFixed(2)} operations`;

    res.status(200).json({
      status: 'success',
      inputs: {
        prime: p.toString(),
        generator: g.toString(),
        privateKey: privateKeyNum.toString(),
        otherPublicKey: otherPublicKeyNum.toString(),
        primeBitLength
      },
      results: {
        publicKey: publicKey.toString(),
        sharedSecret: sharedSecret.toString()
      },
      performance: {
        publicKeyCalculationTime: publicKeyTime,
        sharedSecretCalculationTime: secretTime,
        totalExecutionTime: totalTime,
        computationalComplexity
      }
    });
  } catch (error) {
    // Handle different types of errors appropriately
    const errorResponse = {
      status: 'error',
      message: error.message
    };

    if (error.message === 'Computation timed out') {
      res.status(408).json(errorResponse); // Request Timeout
    } else if (error.message === 'Memory usage exceeded limit') {
      res.status(413).json(errorResponse); // Payload Too Large
    } else {
      res.status(500).json(errorResponse);
    }

    // Log the error for monitoring
    console.error('Diffie-Hellman error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to get bit length of a BigInt
function getBitLength(n) {
  return n.toString(2).length;
}

// Safe modular exponentiation with chunking for large numbers
async function safeModPow(base, exponent, modulus) {
  if (modulus === 1n) return 0n;
  
  let result = 1n;
  base = base % modulus;
  
  // Process in chunks and allow for micro-task queue to process
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
      // Give other tasks a chance to run
      await new Promise(resolve => setImmediate(resolve));
    }
    base = (base * base) % modulus;
    exponent = exponent / 2n;
  }
  
  return result;
}

// Optimized primality test with early bailout
function isPrime(num) {
  if (num <= 1n) return false;
  if (num <= 3n) return true;
  if (num % 2n === 0n || num % 3n === 0n) return false;
  
  // Only check up to the square root and use larger stepping
  const sqrt = sqrt_approx(num);
  for (let i = 5n; i <= sqrt; i += 6n) {
    if (num % i === 0n || num % (i + 2n) === 0n) return false;
  }
  return true;
}

// Approximate square root for BigInt
function sqrt_approx(value) {
  if (value < 0n) {
    throw 'square root of negative numbers is not supported'
  }

  if (value < 2n) {
    return value;
  }

  function newtonIteration(n, x0) {
    const x1 = ((n / x0) + x0) >> 1n;
    if (x0 === x1 || x0 === (x1 - 1n)) {
      return x0;
    }
    return newtonIteration(n, x1);
  }

  return newtonIteration(value, 1n);
}

function isValidGenerator(g, p) {
  if (g < 2n || g >= p) return false;
  
  // Additional validation could be added here
  // For example, checking if g is a primitive root modulo p
  // But this would be computationally expensive for large numbers
  
  return true;
}

// Helper function to get elapsed milliseconds
function getElapsedMs(startTime) {
  const [seconds, nanoseconds] = process.hrtime(startTime);
  return (seconds * 1000 + nanoseconds / 1000000).toFixed(3);
}