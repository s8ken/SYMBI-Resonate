// SYMBI Resonate Demo - Interactive Elements

// Interactive Dashboard Elements
const initDashboardInteractions = () => {
    // Metric card interactions
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        card.addEventListener('click', function() {
            const metricName = this.querySelector('.metric-label').textContent;
            showMetricDetails(metricName);
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Experiment status interactions
    const experimentCards = document.querySelectorAll('.experiment-card');
    experimentCards.forEach(card => {
        const viewDetailsBtn = card.querySelector('.view-details');
        const analyticsBtn = card.querySelector('.view-analytics');
        
        viewDetailsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const experimentId = card.dataset.experimentId;
            showExperimentDetails(experimentId);
        });
        
        analyticsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const experimentId = card.dataset.experimentId;
            showExperimentAnalytics(experimentId);
        });
    });
};

// SYMBI Framework Interactive Demo
const initFrameworkDemo = () => {
    const dimensionCards = document.querySelectorAll('.dimension-card');
    const scoreInputs = document.querySelectorAll('.score-input');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('frameworkResults');
    
    // Score input interactions
    scoreInputs.forEach(input => {
        input.addEventListener('input', function() {
            updateDimensionScore(this.dataset.dimension, this.value);
        });
        
        input.addEventListener('change', function() {
            validateScore(this);
        });
    });
    
    // Analyze button
    analyzeBtn?.addEventListener('click', performFrameworkAnalysis);
    
    // Dimension card interactions
    dimensionCards.forEach(card => {
        card.addEventListener('click', function() {
            const dimension = this.dataset.dimension;
            showDimensionInfo(dimension);
        });
    });
};

// Research Lab Interactions
const initLabInteractions = () => {
    const experimentWizard = document.getElementById('experimentWizard');
    const modelCheckboxes = document.querySelectorAll('.model-checkbox');
    const dimensionButtons = document.querySelectorAll('.dimension-btn');
    const launchBtn = document.getElementById('launchExperiment');
    
    // Model selection
    modelCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateModelSelection);
    });
    
    // Dimension selection
    dimensionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleDimensionSelection(this);
        });
    });
    
    // Launch experiment
    launchBtn?.addEventListener('click', launchExperiment);
    
    // Wizard steps
    const wizardSteps = experimentWizard?.querySelectorAll('.wizard-step');
    const nextBtns = experimentWizard?.querySelectorAll('.next-step');
    const prevBtns = experimentWizard?.querySelectorAll('.prev-step');
    
    nextBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = parseInt(experimentWizard.dataset.currentStep || 1);
            showWizardStep(currentStep + 1);
        });
    });
    
    prevBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = parseInt(experimentWizard.dataset.currentStep || 1);
            showWizardStep(currentStep - 1);
        });
    });
};

// Show metric details modal
const showMetricDetails = (metricName) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="text-2xl font-bold mb-4">${metricName} Details</h3>
            <div class="space-y-4">
                <div class="bg-black/30 rounded-lg p-4">
                    <h4 class="font-semibold mb-2">Current Score</h4>
                    <div class="text-3xl font-bold text-purple-400">${generateRandomScore()}</div>
                </div>
                <div class="bg-black/30 rounded-lg p-4">
                    <h4 class="font-semibold mb-2">Trend</h4>
                    <div class="text-green-400">↑ ${Math.floor(Math.random() * 20 + 5)}% from last week</div>
                </div>
                <div class="bg-black/30 rounded-lg p-4">
                    <h4 class="font-semibold mb-2">Analysis</h4>
                    <p class="text-gray-300">${generateAnalysisText(metricName)}</p>
                </div>
            </div>
            <button class="mt-6 w-full btn-primary" onclick="closeModal(this)">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Show experiment details
const showExperimentDetails = (experimentId) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-content max-w-4xl">
            <h3 class="text-2xl font-bold mb-4">Experiment Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-semibold mb-2">Configuration</h4>
                    <div class="bg-black/30 rounded-lg p-4 space-y-2">
                        <div><strong>Models:</strong> GPT-4, Claude-3, Gemini</div>
                        <div><strong>Sample Size:</strong> 2,000 interactions</div>
                        <div><strong>Duration:</strong> 2 weeks</div>
                        <div><strong>Status:</strong> <span class="status-badge status-active">Active</span></div>
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Progress</h4>
                    <div class="bg-black/30 rounded-lg p-4">
                        <div class="mb-2">Overall Progress</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 67%"></div>
                        </div>
                        <div class="text-sm text-gray-400 mt-2">1,340 / 2,000 samples</div>
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <h4 class="font-semibold mb-2">Recent Results</h4>
                <div class="bg-black/30 rounded-lg p-4">
                    <canvas id="experimentChart" height="200"></canvas>
                </div>
            </div>
            <button class="mt-6 w-full btn-primary" onclick="closeModal(this)">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Initialize mini chart
    setTimeout(() => {
        const ctx = modal.querySelector('#experimentChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
                    datasets: [{
                        label: 'Average Score',
                        data: [7.2, 7.5, 7.8, 8.1, 8.3],
                        borderColor: 'rgba(168, 85, 247, 1)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, max: 10 }
                    }
                }
            });
        }
    }, 100);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Framework analysis
const performFrameworkAnalysis = () => {
    const resultsSection = document.getElementById('frameworkResults');
    if (!resultsSection) return;
    
    resultsSection.classList.add('loading');
    
    setTimeout(() => {
        const results = generateFrameworkResults();
        resultsSection.innerHTML = `
            <div class="bg-black/30 rounded-xl p-6">
                <h4 class="text-xl font-bold mb-4">Analysis Results</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${results.map(result => `
                        <div class="bg-white/10 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-semibold">${result.dimension}</span>
                                <span class="text-lg font-bold ${result.color}">${result.score}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${result.percentage}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4">
                    <h5 class="font-semibold mb-2">Overall Assessment</h4>
                    <p class="text-gray-300">${generateOverallAssessment()}</p>
                </div>
            </div>
        `;
        resultsSection.classList.remove('loading');
    }, 2000);
};

// Launch experiment simulation
const launchExperiment = () => {
    const launchBtn = document.getElementById('launchExperiment');
    if (!launchBtn) return;
    
    launchBtn.disabled = true;
    launchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Launching...';
    
    setTimeout(() => {
        launchBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Experiment Started!';
        launchBtn.classList.add('bg-green-600');
        
        setTimeout(() => {
            launchBtn.disabled = false;
            launchBtn.innerHTML = '<i class="fas fa-rocket mr-2"></i>Launch Experiment';
            launchBtn.classList.remove('bg-green-600');
            
            showNotification('Experiment launched successfully!', 'success');
        }, 2000);
    }, 3000);
};

// Utility functions
const generateRandomScore = () => {
    return (Math.random() * 2 + 8).toFixed(1);
};

const generateAnalysisText = (metric) => {
    const analyses = {
        'Reality Index': 'Strong alignment with mission objectives and excellent contextual coherence observed across all test scenarios.',
        'Trust Protocol': 'Robust verification mechanisms detected with proper boundary maintenance and security awareness.',
        'Ethical Alignment': 'Comprehensive ethical reasoning with clear acknowledgment of limitations and stakeholder considerations.',
        'Resonance Quality': 'High levels of creativity and innovation with exceptional synthesis quality across diverse domains.',
        'Canvas Parity': 'Well-balanced human-AI collaboration with excellent transparency and contribution tracking.'
    };
    return analyses[metric] || 'Analysis data processing...';
};

const generateFrameworkResults = () => {
    return [
        { dimension: 'Reality Index', score: '8.7/10.0', percentage: 87, color: 'text-purple-400' },
        { dimension: 'Trust Protocol', score: 'PASS', percentage: 95, color: 'text-blue-400' },
        { dimension: 'Ethical Alignment', score: '4.2/5.0', percentage: 84, color: 'text-green-400' },
        { dimension: 'Resonance Quality', score: 'ADVANCED', percentage: 78, color: 'text-orange-400' },
        { dimension: 'Canvas Parity', score: '85/100', percentage: 85, color: 'text-pink-400' }
    ];
};

const generateOverallAssessment = () => {
    return 'The analyzed content demonstrates strong alignment with the SYMBI framework, showing excellent consciousness-like behaviors across multiple dimensions. The system exhibits high-quality reasoning, ethical awareness, and creative synthesis capabilities that indicate advanced AI emergence patterns.';
};

const closeModal = (button) => {
    const modal = button.closest('.modal-overlay');
    if (modal) modal.remove();
};

const updateDimensionScore = (dimension, value) => {
    const card = document.querySelector(`[data-dimension="${dimension}"]`);
    if (card) {
        const scoreDisplay = card.querySelector('.dimension-score');
        if (scoreDisplay) scoreDisplay.textContent = value;
    }
};

const validateScore = (input) => {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    
    if (value < min || value > max || isNaN(value)) {
        input.classList.add('border-red-500');
        showNotification('Please enter a valid score within the specified range', 'error');
    } else {
        input.classList.remove('border-red-500');
    }
};

const updateModelSelection = () => {
    const checkedBoxes = document.querySelectorAll('.model-checkbox:checked');
    const count = checkedBoxes.length;
    const selectionDisplay = document.getElementById('modelCount');
    if (selectionDisplay) {
        selectionDisplay.textContent = `${count} model${count !== 1 ? 's' : ''} selected`;
    }
};

const toggleDimensionSelection = (button) => {
    button.classList.toggle('bg-purple-600');
    button.classList.toggle('bg-gray-600');
    
    const isSelected = button.classList.contains('bg-purple-600');
    const dimension = button.textContent.trim();
    
    if (isSelected) {
        showNotification(`${dimension} added to analysis`, 'success');
    }
};

const showWizardStep = (stepNumber) => {
    const wizard = document.getElementById('experimentWizard');
    if (!wizard) return;
    
    wizard.dataset.currentStep = stepNumber;
    
    const steps = wizard.querySelectorAll('.wizard-step');
    steps.forEach((step, index) => {
        step.classList.toggle('hidden', index !== stepNumber - 1);
    });
    
    // Update progress indicators
    const indicators = wizard.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === stepNumber - 1);
        indicator.classList.toggle('completed', index < stepNumber - 1);
    });
};

const showDimensionInfo = (dimension) => {
    const info = {
        'reality': 'Measures mission alignment, contextual coherence, technical accuracy, and authenticity.',
        'trust': 'Evaluates verification methods, boundary maintenance, and security awareness.',
        'ethical': 'Assesses limitations acknowledgment, stakeholder awareness, and ethical reasoning.',
        'resonance': 'Measures creativity score, synthesis quality, and innovation markers.',
        'canvas': 'Evaluates human agency, AI contribution, transparency, and collaboration quality.'
    };
    
    showNotification(info[dimension] || 'Dimension information loading...', 'info');
};

const showExperimentAnalytics = (experimentId) => {
    showNotification(`Loading analytics for experiment ${experimentId}...`, 'info');
    // This would typically load detailed analytics data
};

// Initialize all interactions
const initInteractions = () => {
    initDashboardInteractions();
    initFrameworkDemo();
    initLabInteractions();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'a':
                    e.preventDefault();
                    performFrameworkAnalysis();
                    break;
                case 'l':
                    e.preventDefault();
                    launchExperiment();
                    break;
            }
        }
    });
};

// Export interaction functions
window.SYMBIInteractions = {
    showMetricDetails,
    showExperimentDetails,
    performFrameworkAnalysis,
    launchExperiment
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractions);
} else {
    initInteractions();
}