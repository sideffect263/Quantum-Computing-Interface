let performanceHistory = [];
let performanceChart = null;

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
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Execution Time (ms)',
                data: [],
                backgroundColor: 'rgb(59, 130, 246)'
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

function updatePerformanceChart() {
    console.log('Updating performance chart...');
    if (!performanceChart) {
        console.warn('Performance chart is not initialized');
        return;
    }

    performanceChart.data.labels = performanceHistory.map(entry => 
        entry.timestamp.toLocaleTimeString()
    );
    performanceChart.data.datasets[0].data = performanceHistory.map(entry => 
        entry.totalTime
    );
    
    performanceChart.update('none');
}

function cleanupChart() {
    console.log('Cleaning up performance chart...');
    if (performanceChart) {
        performanceChart.destroy();
        performanceChart = null;
    }
}

export { performanceHistory, initializePerformanceChart, updatePerformanceChart, cleanupChart };
