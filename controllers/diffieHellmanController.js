exports.diffieHellmanKeyExchange = (req, res) => {
  try {
    const { prime, generator, privateKey, otherPublicKey } = req.body;
    
    console.log('Received inputs:', { prime, generator, privateKey, otherPublicKey });

    // Start timing
    const startTime = process.hrtime();

    // Convert all inputs to numbers
    const p = parseInt(prime, 10);
    const g = parseInt(generator, 10);
    const privateKeyNum = parseInt(privateKey, 10);
    const otherPublicKeyNum = parseInt(otherPublicKey, 10);

    // Validate inputs
    if (!isPrime(p)) {
      throw new Error('Invalid prime number');
    }
    if (!isValidGenerator(g, p)) {
      throw new Error('Invalid generator value');
    }
    if (privateKeyNum >= p) {
      throw new Error('Private key must be less than prime');
    }

    // Time the public key calculation
    const publicKeyStartTime = process.hrtime();
    const publicKey = modPow(g, privateKeyNum, p);
    const publicKeyTime = getElapsedMs(publicKeyStartTime);

    // Time the shared secret calculation
    const secretStartTime = process.hrtime();
    const sharedSecret = modPow(otherPublicKeyNum, privateKeyNum, p);
    const secretTime = getElapsedMs(secretStartTime);

    // Get total time
    const totalTime = getElapsedMs(startTime);

    // Calculate bit lengths for analysis
    const primeBitLength = Math.floor(Math.log2(p)) + 1;
    const computationalComplexity = `O(log²(n)) ≈ ${Math.pow(Math.log2(p), 2).toFixed(2)} operations`;

    res.status(200).json({
      status: 'success',
      inputs: {
        prime: p,
        generator: g,
        privateKey: privateKeyNum,
        otherPublicKey: otherPublicKeyNum,
        primeBitLength
      },
      results: {
        publicKey: publicKey,
        sharedSecret: sharedSecret
      },
      performance: {
        publicKeyCalculationTime: publicKeyTime,
        sharedSecretCalculationTime: secretTime,
        totalExecutionTime: totalTime,
        computationalComplexity
      }
    });
  } catch (error) {
    console.error('Error during Diffie-Hellman key exchange:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to get elapsed milliseconds
function getElapsedMs(startTime) {
  const [seconds, nanoseconds] = process.hrtime(startTime);
  return (seconds * 1000 + nanoseconds / 1000000).toFixed(3);
}

// Modular exponentiation with performance optimizations
function modPow(base, exponent, modulus) {
  if (modulus === 1) return 0;
  
  let result = 1;
  base = base % modulus;
  
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  
  return result;
}

function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

function isValidGenerator(g, p) {
  if (g < 2 || g >= p) return false;
  return true;
}