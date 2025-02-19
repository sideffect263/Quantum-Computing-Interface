function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition transform duration-300 translate-y-full
        ${type === 'error' ? 'bg-red-500' : 
          type === 'success' ? 'bg-green-500' : 
          'bg-blue-500'}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-y-full');
    }, 10);

    setTimeout(() => {
        notification.classList.add('translate-y-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function displayResults(result) {
    document.getElementById('results-section').classList.remove('hidden');

    animateValue('result-public-key', result.results.publicKey);
    animateValue('result-shared-secret', result.results.sharedSecret);

    animateValue('metric-public-key-time', result.performance.publicKeyCalculationTime, 'ms');
    animateValue('metric-shared-secret-time', result.performance.sharedSecretCalculationTime, 'ms');
    animateValue('metric-total-time', result.performance.totalExecutionTime, 'ms');

    document.getElementById('analysis-bit-length').textContent = `${result.inputs.primeBitLength} bits`;
    document.getElementById('analysis-complexity').textContent = result.performance.computationalComplexity;
}

function animateValue(elementId, finalValue, suffix = '') {
    const element = document.getElementById(elementId);
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
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

function displayError(message) {
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
}

export { animateValue, showNotification, displayResults, displayError };
