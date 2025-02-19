let performanceHistory = [];
let performanceChart = null;
let keySizeChart = null;
let complexityChart = null;

function initializePerformanceChart() {
    console.log('Initializing performance chart...');
    const canvas = document.getElementById('performance-chart');
    if (!canvas) {
        console.error('Performance chart canvas not found');
        return;
    }

    console.log('Current performanceChart:', performanceChart);

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

    console.log('Canvas element:', canvas);

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

    console.log('New performanceChart:', performanceChart);
}

function initializeKeySizeChart() {
    const canvas = document.getElementById('key-size-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    keySizeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['8-bit', '16-bit', '32-bit', '64-bit'],
            datasets: [{
                label: 'Key Size Distribution',
                data: [0, 0, 0, 0],
                backgroundColor: ['rgb(59, 130, 246)', 'rgb(34, 197, 94)', 'rgb(234, 179, 8)', 'rgb(239, 68, 68)']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initializeComplexityChart() {
    const canvas = document.getElementById('complexity-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    complexityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Time Complexity',
                data: [],
                backgroundColor: 'rgb(139, 92, 246)'
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
}

function updatePerformanceChart(data) {
    console.log('Updating performance chart...');
    if (!performanceChart) {
        console.warn('Performance chart is not initialized');
        return;
    }

    performanceChart.data.labels = data.labels;
    performanceChart.data.datasets[0].data = data.values;
    performanceChart.update();
}

function updateKeySizeChart(data) {
    if (!keySizeChart) return;
    keySizeChart.data.datasets[0].data = data;
    keySizeChart.update();
}

function updateComplexityChart(data) {
    if (!complexityChart) return;
    complexityChart.data.labels = data.labels;
    complexityChart.data.datasets[0].data = data.values;
    complexityChart.update();
}

function cleanupChart() {
    console.log('Cleaning up performance chart...');
    if (performanceChart) {
        performanceChart.destroy();
        performanceChart = null;
    }
}

export { performanceHistory, initializePerformanceChart, initializeKeySizeChart, initializeComplexityChart, updatePerformanceChart, updateKeySizeChart, updateComplexityChart, cleanupChart };
