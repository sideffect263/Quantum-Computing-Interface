exports.diffieHellmanKeyExchange = (req, res) => {
  try {
    const { prime, generator, privateKey, otherPublicKey } = req.body;
    
    console.log('Received inputs:', { prime, generator, privateKey, otherPublicKey });

    // Start timing
    const startTime = process.hrtime();

    // Convert all inputs to BigInt
    const p = BigInt(prime);
    const g = BigInt(generator);
    const privateKeyNum = BigInt(privateKey);
    const otherPublicKeyNum = BigInt(otherPublicKey);

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

    console.log('Inputs validated');

    // Time the public key calculation
    const publicKeyStartTime = process.hrtime();
    const publicKey = modPow(g, privateKeyNum, p);
    const publicKeyTime = getElapsedMs(publicKeyStartTime);

    console.log('Public key calculated');

    // Time the shared secret calculation
    const secretStartTime = process.hrtime();
    const sharedSecret = modPow(otherPublicKeyNum, privateKeyNum, p);
    const secretTime = getElapsedMs(secretStartTime);

    console.log('Shared secret calculated');

    // Get total time
    const totalTime = getElapsedMs(startTime);

    // Calculate bit lengths for analysis
    const primeBitLength = Math.floor(Math.log2(Number(p))) + 1;
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
  if (modulus === 1n) return 0n;
  
  let result = 1n;
  base = base % modulus;
  
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent = exponent / 2n;
  }
  
  return result;
}

function isPrime(num) {
  if (num <= 1n) return false;
  if (num <= 3n) return true;
  if (num % 2n === 0n || num % 3n === 0n) return false;
  
  for (let i = 5n; i * i <= num; i += 6n) {
    if (num % i === 0n || num % (i + 2n) === 0n) return false;
  }
  return true;
}

function isValidGenerator(g, p) {
  if (g < 2n || g >= p) return false;
  return true;
}