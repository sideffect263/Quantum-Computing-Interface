const testCases = {
    'small': {
        prime: '127',
        generator: '3',
        privateKey: '23',
        otherPublicKey: '37',
        description: '8-bit numbers'
    },
    'medium': {
        prime: '65521',
        generator: '3',
        privateKey: '1234',
        otherPublicKey: '5678',
        description: '16-bit numbers'
    },
    'large': {
        prime: '4294967291',
        generator: '3',
        privateKey: '123456',
        otherPublicKey: '654321',
        description: '32-bit numbers'
    },
    'very-large': {
        prime: '18446744073709551557',
        generator: '3',
        privateKey: '12345678',
        otherPublicKey: '87654321',
        description: '64-bit numbers'
    }
};

// Performance test history for charts
let performanceHistory = [];

// Single chart instance
let performanceChart = null;

function initializePerformanceChart() {
    console.log('Initializing performance chart...');
    const canvas = document.getElementById('performance-chart');
    if (!canvas) {
        console.error('Performance chart canvas not found');
        return;
    }

    // Log the current state of the performanceChart variable
    console.log('Current performanceChart:', performanceChart);

    // Destroy existing chart if it exists
    if (performanceChart) {
        console.log('Destroying existing performance chart...');
        performanceChart.destroy();
        performanceChart = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Log the state of the canvas element
    console.log('Canvas element:', canvas);

    // Set canvas dimensions
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    console.log('Creating new performance chart...');
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Execution Time (ms)',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });

    // Log the new state of the performanceChart variable
    console.log('New performanceChart:', performanceChart);
}

function updatePerformanceChart() {
    console.log('Updating performance chart...');
    if (!performanceChart) {
        console.warn('Performance chart is not initialized');
        return;
    }

    // Update existing chart data
    performanceChart.data.labels = performanceHistory.map(entry => 
        entry.timestamp.toLocaleTimeString()
    );
    performanceChart.data.datasets[0].data = performanceHistory.map(entry => 
        entry.totalTime
    );
    
    // Update the chart
    performanceChart.update('none'); // Use 'none' for smoother updates
}

// Cleanup function
function cleanupChart() {
    console.log('Cleaning up performance chart...');
    if (performanceChart) {
        performanceChart.destroy();
        performanceChart = null;
    }
}

// Handle form submission
document.getElementById('performance-test-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Computing...';
    submitButton.disabled = true;
    loadingSpinner.classList.remove('hidden');
    errorMessage.classList.add('hidden');

    try {
        const formData = {
            prime: document.getElementById('test-prime').value,
            generator: document.getElementById('test-generator').value,
            privateKey: document.getElementById('test-private-key').value,
            otherPublicKey: document.getElementById('test-other-public-key').value
        };

        const response = await fetch('/api/quantum/diffie-hellman', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            // Add to performance history
            performanceHistory.push({
                timestamp: new Date(),
                bitLength: result.inputs?.primeBitLength || 0,
                totalTime: parseFloat(result.performance?.totalExecutionTime || 0)
            });

            // Update UI
            displayResults(result);
            showNotification('Calculation completed successfully', 'success');
            updatePerformanceChart();
        } else {
            showNotification(result.message || 'An error occurred', 'error');
            errorMessage.textContent = result.message || 'An error occurred';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error(error);
        showNotification('Error running performance test: ' + error.message, 'error');
        errorMessage.textContent = 'Error running performance test: ' + error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        loadingSpinner.classList.add('hidden');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupChart);

// Load a test case into the form
function loadTestCase(size) {
    const loadedTestCase = testCases[size];
    document.getElementById('test-prime').value = loadedTestCase.prime;
    document.getElementById('test-generator').value = loadedTestCase.generator;
    document.getElementById('test-private-key').value = loadedTestCase.privateKey;
    document.getElementById('test-other-public-key').value = loadedTestCase.otherPublicKey;

    // Show a notification
    showNotification(`Loaded ${loadedTestCase.description}`, 'info');
}

// Display the results
function displayResults(result) {
    // Show results section
    document.getElementById('results-section').classList.remove('hidden');

    // Basic results with animation
    animateValue('result-public-key', result.results.publicKey);
    animateValue('result-shared-secret', result.results.sharedSecret);

    // Performance metrics with animation
    animateValue('metric-public-key-time', result.performance.publicKeyCalculationTime, 'ms');
    animateValue('metric-shared-secret-time', result.performance.sharedSecretCalculationTime, 'ms');
    animateValue('metric-total-time', result.performance.totalExecutionTime, 'ms');

    // Analysis
    document.getElementById('analysis-bit-length').textContent = `${result.inputs.primeBitLength} bits`;
    document.getElementById('analysis-complexity').textContent = result.performance.computationalComplexity;
}

// Animate value changes
function animateValue(elementId, finalValue, suffix = '') {
    const element = document.getElementById(elementId);
    const start = parseInt(element.textContent) || 0;
    const duration = 1000; // 1 second
    const steps = 20;
    const increment = (finalValue - start) / steps;
    
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if ((increment >= 0 && current >= finalValue) || 
            (increment < 0 && current <= finalValue)) {
            clearInterval(timer);
            current = finalValue;
        }
        element.textContent = Math.round(current) + suffix;
    }, duration / steps);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition transform duration-300 translate-y-full
        ${type === 'error' ? 'bg-red-500' : 
          type === 'success' ? 'bg-green-500' : 
          'bg-blue-500'}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-y-full');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-y-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize tooltips
// Event handlers
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded. Initializing performance chart...');
    initializePerformanceChart();
    // Initialize the performance chart only once on page load
    if (!performanceChart) {
        initializePerformanceChart();
    }
    
    // Add tooltips to preset buttons
    document.querySelectorAll('.btn-preset').forEach(button => {
        const size = button.getAttribute('onclick').match(/'(.+?)'/)[1];
        const description = testCases[size].description;
        button.setAttribute('title', description);
    });
    initializePerformanceChart();
});

function displayError(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
}

// Example usage: displayError('An unexpected error occurred');