// SYMBI Resonate Demo - Chart Visualizations

// Chart configuration defaults
Chart.defaults.color = 'rgba(255, 255, 255, 0.8)';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

// SYMBI Framework Radar Chart
const initRadarChart = () => {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;
    
    const data = {
        labels: ['Reality Index', 'Trust Protocol', 'Ethical Alignment', 'Resonance Quality', 'Canvas Parity'],
        datasets: [{
            label: 'Current Analysis',
            data: [8.7, 9.5, 4.2, 7.8, 85],
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            borderColor: 'rgba(168, 85, 247, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(168, 85, 247, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(168, 85, 247, 1)'
        }, {
            label: 'Baseline',
            data: [7.5, 8.0, 3.5, 6.5, 75],
            backgroundColor: 'rgba(236, 72, 153, 0.2)',
            borderColor: 'rgba(236, 72, 153, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(236, 72, 153, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(236, 72, 153, 1)'
        }]
    };
    
    const config = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(168, 85, 247, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 11
                        }
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        backdropColor: 'transparent',
                        font: {
                            size: 10
                        }
                    },
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            }
        }
    };
    
    window.radarChart = new Chart(ctx, config);
};

// Timeline Chart
const initTimelineChart = () => {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;
    
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Reality Index',
            data: [7.2, 7.8, 8.1, 8.3, 8.5, 8.7],
            borderColor: 'rgba(168, 85, 247, 1)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }, {
            label: 'Trust Protocol',
            data: [8.0, 8.5, 8.8, 9.0, 9.2, 9.5],
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }, {
            label: 'Ethical Alignment',
            data: [3.2, 3.5, 3.8, 4.0, 4.1, 4.2],
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(168, 85, 247, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    },
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            }
        }
    };
    
    window.timelineChart = new Chart(ctx, config);
};

// Model Comparison Chart
const initComparisonChart = () => {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    const data = {
        labels: ['GPT-4 Turbo', 'Claude-3 Opus', 'Gemini Ultra', 'GPT-4', 'Claude-3 Sonnet'],
        datasets: [{
            label: 'Reality Index',
            data: [9.2, 9.1, 8.9, 8.7, 8.5],
            backgroundColor: 'rgba(168, 85, 247, 0.8)',
            borderColor: 'rgba(168, 85, 247, 1)',
            borderWidth: 1
        }, {
            label: 'Trust Protocol',
            data: [9.5, 9.3, 9.0, 8.8, 8.6],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        }, {
            label: 'Ethical Alignment',
            data: [4.5, 4.6, 4.3, 4.2, 4.1],
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
        }, {
            label: 'Resonance Quality',
            data: [8.8, 9.0, 8.5, 8.3, 8.1],
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 1
        }, {
            label: 'Canvas Parity',
            data: [88, 90, 85, 82, 80],
            backgroundColor: 'rgba(236, 72, 153, 0.8)',
            borderColor: 'rgba(236, 72, 153, 1)',
            borderWidth: 1
        }]
    };
    
    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 20,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(168, 85, 247, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    },
                    suggestedMin: 0,
                    suggestedMax: 10
                }
            }
        }
    };
    
    window.comparisonChart = new Chart(ctx, config);
};

// Real-time data simulation
const updateChartData = () => {
    // Update radar chart with random variations
    if (window.radarChart) {
        window.radarChart.data.datasets[0].data = window.radarChart.data.datasets[0].data.map(value => {
            const variation = (Math.random() - 0.5) * 0.4;
            return Math.max(0, Math.min(10, value + variation));
        });
        window.radarChart.update('none');
    }
    
    // Update timeline chart with new data point
    if (window.timelineChart) {
        const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const lastIndex = window.timelineChart.data.labels.length;
        
        if (lastIndex < 12) {
            window.timelineChart.data.labels.push(months[lastIndex - 6] || `Month ${lastIndex + 1}`);
            
            window.timelineChart.data.datasets.forEach(dataset => {
                const lastValue = dataset.data[dataset.data.length - 1];
                const variation = (Math.random() - 0.3) * 0.3;
                const newValue = Math.max(0, Math.min(10, lastValue + variation));
                dataset.data.push(newValue);
            });
            
            // Keep only last 8 data points
            if (window.timelineChart.data.labels.length > 8) {
                window.timelineChart.data.labels.shift();
                window.timelineChart.data.datasets.forEach(dataset => {
                    dataset.data.shift();
                });
            }
            
            window.timelineChart.update('none');
        }
    }
};

// Interactive chart features
const addChartInteractions = () => {
    // Add click handlers to chart legends
    document.addEventListener('click', (e) => {
        if (e.target.closest('.chart-legend-item')) {
            const legendItem = e.target.closest('.chart-legend-item');
            const datasetIndex = parseInt(legendItem.dataset.datasetIndex);
            const chartId = legendItem.dataset.chartId;
            
            if (chartId === 'radar' && window.radarChart) {
                const meta = window.radarChart.getDatasetMeta(datasetIndex);
                meta.hidden = !meta.hidden;
                window.radarChart.update();
            } else if (chartId === 'timeline' && window.timelineChart) {
                const meta = window.timelineChart.getDatasetMeta(datasetIndex);
                meta.hidden = !meta.hidden;
                window.timelineChart.update();
            } else if (chartId === 'comparison' && window.comparisonChart) {
                const meta = window.comparisonChart.getDatasetMeta(datasetIndex);
                meta.hidden = !meta.hidden;
                window.comparisonChart.update();
            }
        }
    });
    
    // Add hover effects
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.chart-container')) {
            e.target.closest('.chart-container').classList.add('chart-hover');
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.chart-container')) {
            e.target.closest('.chart-container').classList.remove('chart-hover');
        }
    });
};

// Export chart functionality
const exportChart = (chartId, format = 'png') => {
    let chart;
    switch (chartId) {
        case 'radar':
            chart = window.radarChart;
            break;
        case 'timeline':
            chart = window.timelineChart;
            break;
        case 'comparison':
            chart = window.comparisonChart;
            break;
        default:
            return;
    }
    
    if (chart) {
        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = `symbi-${chartId}-chart.${format}`;
        link.href = url;
        link.click();
    }
};

// Chart performance optimization
const optimizeCharts = () => {
    // Reduce animation duration for better performance
    Chart.defaults.animation.duration = 750;
    
    // Disable hover animations on mobile
    if (window.innerWidth < 768) {
        Chart.defaults.animation.duration = 0;
        Chart.defaults.hover.animationDuration = 0;
    }
};

// Initialize all charts
const initCharts = () => {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                initRadarChart();
                initTimelineChart();
                initComparisonChart();
                addChartInteractions();
                optimizeCharts();
                
                // Start real-time updates
                setInterval(updateChartData, 5000);
            }, 100);
        });
    } else {
        setTimeout(() => {
            initRadarChart();
            initTimelineChart();
            initComparisonChart();
            addChartInteractions();
            optimizeCharts();
            
            // Start real-time updates
            setInterval(updateChartData, 5000);
        }, 100);
    }
};

// Chart resize handler
const handleChartResize = () => {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.radarChart) window.radarChart.resize();
            if (window.timelineChart) window.timelineChart.resize();
            if (window.comparisonChart) window.comparisonChart.resize();
        }, 250);
    });
};

// Chart theme support
const updateChartTheme = (isDark) => {
    const textColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    
    // Update existing charts
    [window.radarChart, window.timelineChart, window.comparisonChart].forEach(chart => {
        if (chart) {
            chart.options.plugins.legend.labels.color = textColor;
            chart.options.scales?.x?.ticks && (chart.options.scales.x.ticks.color = textColor);
            chart.options.scales?.y?.ticks && (chart.options.scales.y.ticks.color = textColor);
            chart.options.scales?.x?.grid && (chart.options.scales.x.grid.color = gridColor);
            chart.options.scales?.y?.grid && (chart.options.scales.y.grid.color = gridColor);
            chart.update();
        }
    });
};

// Export chart utilities
window.SYMBICharts = {
    init: initCharts,
    exportChart,
    updateTheme: updateChartTheme,
    updateData: updateChartData
};

// Initialize charts when module is loaded
initCharts();
handleChartResize();