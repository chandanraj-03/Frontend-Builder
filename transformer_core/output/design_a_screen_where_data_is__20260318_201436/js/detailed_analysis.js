// detailed_analysis.js - Detailed analysis and advanced visualization functionality for Table Tennis Statistics Dashboard

// Detailed analysis state and configuration
const DetailedAnalysisState = {
    currentAnalysis: null,
    analysisHistory: [],
    comparisonData: {
        baseline: null,
        comparison: null,
        metrics: []
    },
    trendAnalysis: {
        period: 'weekly',
        metrics: ['successRate', 'points'],
        forecast: false
    },
    correlationMatrix: null,
    statisticalTests: {},
    advancedCharts: {},
    heatmapData: null,
    exportConfig: {
        format: 'png',
        quality: 'high',
        includeData: true
    }
};

// Initialize detailed analysis when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-page="analysis"]')) {
        initializeDetailedAnalysis();
    }
});

// Listen for analysis page loaded event
document.addEventListener('analysisLoaded', () => {
    initializeDetailedAnalysis();
});

// Core detailed analysis initialization
function initializeDetailedAnalysis() {
    console.log('Initializing Detailed Analysis Module...');
    
    // Load analysis data
    loadAnalysisData();
    
    // Initialize all analysis components
    initializeAnalysisComponents();
    
    // Set up event listeners
    setupAnalysisEventListeners();
    
    // Generate initial analysis
    generateInitialAnalysis();
    
    console.log('Detailed Analysis Module initialized successfully');
}

// Load analysis data
function loadAnalysisData() {
    // Use current dataset from app state
    DetailedAnalysisState.currentAnalysis = {
        dataset: [...App.state.dataset],
        timestamp: new Date().toISOString(),
        summary: generateDatasetSummary()
    };
}

// Initialize all analysis components
function initializeAnalysisComponents() {
    // Initialize expandable chart visualizations
    initializeExpandableCharts();
    
    // Initialize drilldown statistics
    initializeAdvancedDrilldown();
    
    // Initialize comparison tools
    initializeComparisonTools();
    
    // Initialize advanced visualizations
    initializeAdvancedVisualizations();
    
    // Initialize analysis export options
    initializeAdvancedExportOptions();
}

// Setup analysis event listeners
function setupAnalysisEventListeners() {
    // Chart expansion events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.expand-chart-btn') || e.target.closest('.expand-chart-btn')) {
            const chartId = e.target.dataset.chart || e.target.closest('.expand-chart-btn').dataset.chart;
            toggleChartExpansion(chartId);
        }
    });
    
    // Drilldown events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.drilldown-trigger')) {
            const dimension = e.target.dataset.dimension;
            const value = e.target.dataset.value;
            performDrilldownAnalysis(dimension, value);
        }
    });
    
    // Comparison events
    document.addEventListener('change', (e) => {
        if (e.target.matches('.comparison-control')) {
            updateComparisonSettings(e.target);
        }
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.matches('.comparison-action')) {
            handleComparisonAction(e.target.dataset.action);
        }
    });
    
    // Trend analysis events
    document.addEventListener('submit', (e) => {
        if (e.target.matches('.trend-analysis-form')) {
            e.preventDefault();
            performTrendAnalysis(e.target);
        }
    });
    
    // Statistical test events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.statistical-test')) {
            runStatisticalTest(e.target.dataset.test);
        }
    });
    
    // Export events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.advanced-export')) {
            handleAdvancedExport(e.target.dataset.type);
        }
    });
    
    // Analysis type switching
    document.addEventListener('click', (e) => {
        if (e.target.matches('.analysis-type')) {
            switchAnalysisType(e.target.dataset.type);
        }
    });
}

// Initialize expandable chart visualizations
function initializeExpandableCharts() {
    const expandableContainer = document.getElementById('expandable_chart_visualizations');
    if (!expandableContainer) return;
    
    expandableContainer.innerHTML = `
        <div class="expandable-charts-container">
            <h3>Advanced Chart Visualizations</h3>
            <div class="charts-grid">
                <div class="chart-card expandable" id="chart-serve-detailed">
                    <div class="chart-header">
                        <h4>Serve Type Analysis (Detailed)</h4>
                        <button class="btn-icon expand-chart-btn" data-chart="serve-detailed">
                            <i class="expand-icon"></i>
                        </button>
                    </div>
                    <div class="chart-container">
                        <canvas id="serve-detailed-chart"></canvas>
                    </div>
                    <div class="chart-footer">
                        <span class="chart-info">Click to expand for detailed breakdown</span>
                    </div>
                </div>
                
                <div class="chart-card expandable" id="chart-stroke-detailed">
                    <div class="chart-header">
                        <h4>Stroke Analysis (Trend)</h4>
                        <button class="btn-icon expand-chart-btn" data-chart="stroke-trend">
                            <i class="expand-icon"></i>
                        </button>
                    </div>
                    <div class="chart-container">
                        <canvas id="stroke-trend-chart"></canvas>
                    </div>
                    <div class="chart-footer">
                        <span class="chart-info">Shows performance trends over time</span>
                    </div>
                </div>
                
                <div class="chart-card expandable" id="chart-focus-detailed">
                    <div class="chart-header">
                        <h4>Focus Analysis (Comparison)</h4>
                        <button class="btn-icon expand-chart-btn" data-chart="focus-comparison">
                            <i class="expand-icon"></i>
                        </button>
                    </div>
                    <div class="chart-container">
                        <canvas id="focus-comparison-chart"></canvas>
                    </div>
                    <div class="chart-footer">
                        <span class="chart-info">Compares right vs left focus performance</span>
                    </div>
                </div>
                
                <div class="chart-card expandable" id="chart-success-trend">
                    <div class="chart-header">
                        <h4>Success Rate Trend</h4>
                        <button class="btn-icon expand-chart-btn" data-chart="success-trend">
                            <i class="expand-icon"></i>
                        </button>
                    </div>
                    <div class="chart-container">
                        <canvas id="success-trend-chart"></canvas>
                    </div>
                    <div class="chart-footer">
                        <span class="chart-info">Tracks success rate improvement over time</span>
                    </div>
                </div>
            </div>
            
            <div class="expanded-view" id="expanded-view" style="display: none;">
                <div class="expanded-header">
                    <h3 id="expanded-title">Expanded Chart View</h3>
                    <button class="btn-icon close-expanded">
                        <i class="close-icon"></i>
                    </button>
                </div>
                <div class="expanded-content" id="expanded-content">
                    <!-- Expanded chart content will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    // Initialize charts
    initializeDetailedCharts();
    
    // Add event listener for closing expanded view
    expandableContainer.querySelector('.close-expanded').addEventListener('click', () => {
        expandableContainer.querySelector('#expanded-view').style.display = 'none';
    });
}

// Initialize detailed charts
function initializeDetailedCharts() {
    // Serve type detailed chart (stacked bar)
    createServeTypeDetailedChart();
    
    // Stroke trend chart (line chart)
    createStrokeTrendChart();
    
    // Focus comparison chart (radar chart)
    createFocusComparisonChart();
    
    // Success trend chart (area chart)
    createSuccessTrendChart();
}

function createServeTypeDetailedChart() {
    const canvas = document.getElementById('serve-detailed-chart');
    if (!canvas) return;
    
    const data = DetailedAnalysisState.currentAnalysis.dataset;
    
    // Group by serve type and calculate success rates by stroke type
    const serveTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
    const strokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
    
    const datasets = strokeTypes.map((strokeType, index) => {
        const strokeData = serveTypes.map(serveType => {
            const records = data.filter(r => 
                r.serveType === serveType && r.strokeType === strokeType
            );
            return records.length > 0 ? 
                records.reduce((sum, r) => sum + r.successRate, 0) / records.length : 0;
        });
        
        return {
            label: strokeType,
            data: strokeData,
            backgroundColor: getChartColor(index, 0.7),
            borderColor: getChartColor(index, 1),
            borderWidth: 1
        };
    });
    
    DetailedAnalysisState.advancedCharts.serveDetailed = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: serveTypes,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Serve Type'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Average Success Rate (%)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

function createStrokeTrendChart() {
    const canvas = document.getElementById('stroke-trend-chart');
    if (!canvas) return;
    
    const data = DetailedAnalysisState.currentAnalysis.dataset;
    
    // Group by date and calculate average success rate per stroke type
    const dates = [...new Set(data.map(r => r.date))].sort();
    const strokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
    
    const datasets = strokeTypes.map((strokeType, index) => {
        const trendData = dates.map(date => {
            const dailyRecords = data.filter(r => 
                r.date === date && r.strokeType === strokeType
            );
            return dailyRecords.length > 0 ? 
                dailyRecords.reduce((sum, r) => sum + r.successRate, 0) / dailyRecords.length : null;
        });
        
        // Filter out null values for line continuity
        const filteredData = trendData.map((value, i) => value !== null ? {
            x: dates[i],
            y: value
        } : null).filter(point => point !== null);
        
        return {
            label: strokeType,
            data: filteredData,
            backgroundColor: getChartColor(index, 0.1),
            borderColor: getChartColor(index, 1),
            borderWidth: 2,
            fill: true,
            tension: 0.4
        };
    });
    
    DetailedAnalysisState.advancedCharts.strokeTrend = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Success Rate (%)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

function createFocusComparisonChart() {
    const canvas = document.getElementById('focus-comparison-chart');
    if (!canvas) return;
    
    const data = DetailedAnalysisState.currentAnalysis.dataset;
    
    // Compare performance metrics for right vs left focus
    const focusSides = ['Right', 'Left'];
    const metrics = ['Success Rate', 'Average Points', 'Serve Variety', 'Stroke Consistency'];
    
    // Calculate metrics for each focus side
    const datasets = focusSides.map((focus, index) => {
        const focusData = data.filter(r => r.focus === focus);
        
        const metricValues = [
            focusData.length > 0 ? 
                focusData.reduce((sum, r) => sum + r.successRate, 0) / focusData.length : 0,
            focusData.length > 0 ? 
                focusData.reduce((sum, r) => sum + r.points, 0) / focusData.length : 0,
            focusData.length > 0 ? 
                new Set(focusData.map(r => r.serveType)).size : 0,
            focusData.length > 0 ? 
                calculateConsistency(focusData) : 0
        ];
        
        // Normalize values to 0-100 scale for radar chart
        const normalizedValues = metricValues.map((value, i) => {
            if (i === 2) return Math.min(value * 25, 100); // Serve variety (0-4 -> 0-100)
            if (i === 3) return value * 100; // Consistency (0-1 -> 0-100)
            return value; // Success rate and points are already in good ranges
        });
        
        return {
            label: `${focus} Focus`,
            data: normalizedValues,
            backgroundColor: getChartColor(index, 0.2),
            borderColor: getChartColor(index, 1),
            borderWidth: 2,
            pointBackgroundColor: getChartColor(index, 1)
        };
    });
    
    DetailedAnalysisState.advancedCharts.focusComparison = new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: metrics,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const metric = metrics[context.dataIndex];
                            const value = context.raw;
                            let displayValue;
                            
                            switch(metric) {
                                case 'Success Rate':
                                    displayValue = `${value.toFixed(1)}%`;
                                    break;
                                case 'Average Points':
                                    displayValue = value.toFixed(1);
                                    break;
                                case 'Serve Variety':
                                    displayValue = `${Math.round(value / 25)} unique serves`;
                                    break;
                                case 'Stroke Consistency':
                                    displayValue = `${value.toFixed(1)}% consistency`;
                                    break;
                                default:
                                    displayValue = value.toFixed(1);
                            }
                            
                            return `${context.dataset.label}: ${displayValue}`;
                        }
                    }
                }
            }
        }
    });
}

function createSuccessTrendChart() {
    const canvas = document.getElementById('success-trend-chart');
    if (!canvas) return;
    
    const data = DetailedAnalysisState.currentAnalysis.dataset;
    
    // Calculate moving average of success rate
    const dates = [...new Set(data.map(r => r.date))].sort();
    const windowSize = Math.min(3, Math.floor(dates.length / 2));
    
    const trendData = dates.map((date, index) => {
        const startIdx = Math.max(0, index - windowSize + 1);
        const windowDates = dates.slice(startIdx, index + 1);
        
        const windowRecords = data.filter(r => windowDates.includes(r.date));
        const avgSuccess = windowRecords.length > 0 ? 
            windowRecords.reduce((sum, r) => sum + r.successRate, 0) / windowRecords.length : 0;
        
        return {
            x: date,
            y: avgSuccess
        };
    });
    
    DetailedAnalysisState.advancedCharts.successTrend = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            datasets: [{
                label: 'Moving Average Success Rate',
                data: trendData,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: '#4CAF50',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Success Rate (%)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Success Rate: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize advanced drilldown
function initializeAdvancedDrilldown() {
    const drilldownContainer = document.getElementById('drilldown_statistics');
    if (!drilldownContainer) return;
    
    drilldownContainer.innerHTML += `
        <div class="advanced-drilldown">
            <h3>Advanced Drilldown Analysis</h3>
            
            <div class="drilldown-controls">
                <div class="control-group">
                    <h4>Multi-dimensional Analysis</h4>
                    <div class="dimension-selectors">
                        <div class="form-group">
                            <label for="primary-dimension">Primary Dimension</label>
                            <select id="primary-dimension">
                                <option value="serveType">Serve Type</option>
                                <option value="strokeType">Stroke Type</option>
                                <option value="focus">Focus</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="secondary-dimension">Secondary Dimension</label>
                            <select id="secondary-dimension">
                                <option value="none">None</option>
                                <option value="serveType">Serve Type</option>
                                <option value="strokeType">Stroke Type</option>
                                <option value="focus">Focus</option>
                                <option value="date">Date</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="drilldown-metric">Metric</label>
                            <select id="drilldown-metric">
                                <option value="successRate">Success Rate</option>
                                <option value="points">Points</option>
                                <option value="count">Count</option>
                                <option value="avgPoints">Average Points</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="run-advanced-drilldown">
                        <i class="analyze-icon"></i>
                        Run Analysis
                    </button>
                </div>
            </div>
            
            <div class="drilldown-results" id="advanced-drilldown-results">
                <div class="results-placeholder">
                    <i class="chart-icon"></i>
                    <p>Configure dimensions and metrics to perform advanced analysis</p>
                </div>
            </div>
            
            <div class="drilldown-actions">
                <button class="btn btn-outline" id="export-drilldown-data">
                    Export Drilldown Data
                </button>
                <button class="btn btn-outline" id="save-drilldown-config">
                    Save Configuration
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    drilldownContainer.querySelector('#run-advanced-drilldown').addEventListener('click', runAdvancedDrilldown);
    drilldownContainer.querySelector('#export-drilldown-data').addEventListener('click', exportDrilldownData);
    drilldownContainer.querySelector('#save-drilldown-config').addEventListener('click', saveDrilldownConfig);
}

// Initialize comparison tools
function initializeComparisonTools() {
    const comparisonContainer = document.getElementById('comparison_tools');
    if (!comparisonContainer) return;
    
    comparisonContainer.innerHTML = `
        <div class="comparison-tools">
            <h3>Advanced Comparison Tools</h3>
            
            <div class="comparison-setup">
                <div class="setup-section">
                    <h4>Comparison Groups</h4>
                    <div class="group-selectors">
                        <div class="group-selector">
                            <h5>Baseline Group</h5>
                            <div class="group-filters">
                                <div class="form-group">
                                    <label>Serve Type</label>
                                    <select class="comparison-control" data-group="baseline" data-field="serveType">
                                        <option value="all">All</option>
                                        <option value="Pendulum">Pendulum</option>
                                        <option value="Chop">Chop</option>
                                        <option value="Tomahawk">Tomahawk</option>
                                        <option value="Forehand">Forehand</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date Range</label>
                                    <input type="date" class="comparison-control" data-group="baseline" data-field="startDate">
                                    to
                                    <input type="date" class="comparison-control" data-group="baseline" data-field="endDate">
                                </div>
                            </div>
                            <div class="group-summary" id="baseline-summary">
                                <p>No baseline data selected</p>
                            </div>
                        </div>
                        
                        <div class="group-selector">
                            <h5>Comparison Group</h5>
                            <div class="group-filters">
                                <div class="form-group">
                                    <label>Serve Type</label>
                                    <select class="comparison-control" data-group="comparison" data-field="serveType">
                                        <option value="all">All</option>
                                        <option value="Pendulum">Pendulum</option>
                                        <option value="Chop">Chop</option>
                                        <option value="Tomahawk">Tomahawk</option>
                                        <option value="Forehand">Forehand</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Date Range</label>
                                    <input type="date" class="comparison-control" data-group="comparison" data-field="startDate">
                                    to
                                    <input type="date" class="comparison-control" data-group="comparison" data-field="endDate">
                                </div>
                            </div>
                            <div class="group-summary" id="comparison-summary">
                                <p>No comparison data selected</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="setup-section">
                    <h4>Comparison Metrics</h4>
                    <div class="metric-selection">
                        <div class="metric-checkboxes">
                            <label class="metric-checkbox">
                                <input type="checkbox" class="comparison-control" data-field="metric" value="successRate" checked>
                                <span>Success Rate</span>
                            </label>
                            <label class="metric-checkbox">
                                <input type="checkbox" class="comparison-control" data-field="metric" value="points" checked>
                                <span>Points</span>
                            </label>
                            <label class="metric-checkbox">
                                <input type="checkbox" class="comparison-control" data-field="metric" value="serveVariety">
                                <span>Serve Variety</span>
                            </label>
                            <label class="metric-checkbox">
                                <input type="checkbox" class="comparison-control" data-field="metric" value="consistency">
                                <span>Consistency</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="comparison-actions">
                <button class="btn btn-primary comparison-action" data-action="run">
                    Run Comparison
                </button>
                <button class="btn btn-secondary comparison-action" data-action="swap">
                    Swap Groups
                </button>
                <button class="btn btn-outline comparison-action" data-action="clear">
                    Clear Comparison
                </button>
            </div>
            
            <div class="comparison-results" id="comparison-results" style="display: none;">
                <div class="results-header">
                    <h4>Comparison Results</h4>
                    <button class="btn btn-sm btn-outline" id="export-comparison">
                        Export Results
                    </button>
                </div>
                <div class="results-content" id="comparison-results-content">
                    <!-- Comparison results will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    comparisonContainer.querySelectorAll('input[type="date"]').forEach(input => {
        if (input.dataset.field === 'endDate') {
            input.value = today;
        } else if (input.dataset.field === 'startDate') {
            input.value = weekAgo.toISOString().split('T')[0];
        }
    });
    
    // Initialize comparison data
    updateComparisonGroups();
}

// Initialize advanced visualizations
function initializeAdvancedVisualizations() {
    // This would initialize additional visualizations like heatmaps, scatter plots, etc.
    // For now, we'll create a placeholder for future expansion
    
    const visualizationSection = document.createElement('div');
    visualizationSection.className = 'advanced-visualizations';
    visualizationSection.innerHTML = `
        <h3>Advanced Visualizations</h3>
        <div class="visualization-options">
            <div class="viz-option" data-viz="heatmap">
                <i class="heatmap-icon"></i>
                <span>Performance Heatmap</span>
            </div>
            <div class="viz-option" data-viz="scatter">
                <i class="scatter-icon"></i>
                <span>Correlation Scatter Plot</span>
            </div>
            <div class="viz-option" data-viz="network">
                <i class="network-icon"></i>
                <span>Stroke Sequence Network</span>
            </div>
            <div class="viz-option" data-viz="geospatial">
                <i class="map-icon"></i>
                <span>Geospatial Analysis</span>
            </div>
        </div>
        <div class="visualization-container" id="visualization-container">
            <p class="placeholder-text">Select a visualization type to begin</p>
        </div>
    `;
    
    // Add to analysis page if it exists
    const analysisPage = document.querySelector('[data-page="analysis"]');
    if (analysisPage) {
        analysisPage.appendChild(visualizationSection);
    }
    
    // Add event listeners for visualization options
    visualizationSection.querySelectorAll('.viz-option').forEach(option => {
        option.addEventListener('click', () => {
            loadVisualization(option.dataset.viz);
        });
    });
}

// Initialize advanced export options
function initializeAdvancedExportOptions() {
    const exportContainer = document.getElementById('analysis_export_options');
    if (!exportContainer) return;
    
    exportContainer.innerHTML += `
        <div class="advanced-export-options">
            <h3>Advanced Export Options</h3>
            
            <div class="export-configuration">
                <div class="config-section">
                    <h4>Export Format</h4>
                    <div class="format-options">
                        <label class="format-option">
                            <input type="radio" name="advanced-format" value="png" checked>
                            <span>PNG Image</span>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="advanced-format" value="svg">
                            <span>SVG Vector</span>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="advanced-format" value="pdf">
                            <span>PDF Document</span>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="advanced-format" value="interactive">
                            <span>Interactive HTML</span>
                        </label>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4>Quality Settings</h4>
                    <div class="quality-controls">
                        <div class="form-group">
                            <label for="export-quality">Quality Level</label>
                            <select id="export-quality">
                                <option value="low">Low (Fastest)</option>
                                <option value="medium">Medium</option>
                                <option value="high" selected>High (Best Quality)</option>
                                <option value="ultra">Ultra (Maximum Quality)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="export-resolution">Resolution Scale</label>
                            <input type="range" id="export-resolution" min="1" max="4" step="0.5" value="2">
                            <span id="resolution-value">2x</span>
                        </div>
                    </div>
                </div>
                
                <div class="config-section">
                    <h4>Content Options</h4>
                    <div class="content-options">
                        <label class="content-checkbox">
                            <input type="checkbox" id="include-chart-data" checked>
                            <span>Include chart data</span>
                        </label>
                        <label class="content-checkbox">
                            <input type="checkbox" id="include-statistics" checked>
                            <span>Include statistics</span>
                        </label>
                        <label class="content-checkbox">
                            <input type="checkbox" id="include-metadata">
                            <span>Include metadata</span>
                        </label>
                        <label class="content-checkbox">
                            <input type="checkbox" id="include-annotations">
                            <span>Include annotations</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="export-actions">
                <button class="btn btn-primary advanced-export" data-type="current-chart">
                    Export Current Chart
                </button>
                <button class="btn btn-primary advanced-export" data-type="all-charts">
                    Export All Charts
                </button>
                <button class="btn btn-secondary advanced-export" data-type="analysis-report">
                    Generate Analysis Report
                </button>
            </div>
            
            <div class="export-preview" id="export-preview" style="display: none;">
                <h4>Export Preview</h4>
                <div class="preview-container" id="preview-container">
                    <!-- Preview will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    const resolutionSlider = exportContainer.querySelector('#export-resolution');
    const resolutionValue = exportContainer.querySelector('#resolution-value');
    
    resolutionSlider.addEventListener('input', () => {
        resolutionValue.textContent = `${resolutionSlider.value}x`;
    });
}

// Generate initial analysis
function generateInitialAnalysis() {
    // Generate dataset summary
    const summary = generateDatasetSummary();
    DetailedAnalysisState.currentAnalysis.summary = summary;
    
    // Calculate correlations
    calculateCorrelations();
    
    // Perform statistical analysis
    performStatisticalAnalysis();
    
    // Update all charts
    updateAllCharts();
}

function generateDatasetSummary() {
    const data = DetailedAnalysisState.currentAnalysis.dataset;
    
    if (data.length === 0) {
        return {
            totalRecords: 0,
            message: 'No data available for analysis'
        };
    }
    
    // Calculate basic statistics
    const successRates = data.map(r => r.successRate);
    const points = data.map(r => r.points);
    
    return {
        totalRecords: data.length,
        dateRange: {
            start: data.reduce((min, r) => r.date < min ? r.date : min, data[0].date),
            end: data.reduce((max, r) => r.date > max ? r.date : max, data[0].date)
        },
        successRate: {
            mean: calculateMean(successRates),
            median: calculateMedian(successRates),
            stdDev: calculateStandardDeviation(successRates),
            min: Math.min(...successRates),
            max: Math.max(...successRates)
        },
        points: {
            mean: calculateMean(points),
            median: calculateMedian(points),
            stdDev: calculateStandardDeviation(points),
            total: points.reduce((sum, p) => sum + p, 0),
            min: Math.min(...points),
            max: Math.max(...points)
        },
        distribution: {
            serveTypes: calculateDistribution(data, 'serveType'),
            strokeTypes: calculateDistribution(data, 'strokeType'),
            focus: calculateDistribution(data, 'focus')
        }
    };
}

function calculateCorrelations() {
    const data = DetailedAnalysisState.currentAnalysis.dataset;
    
    if (data.length < 2) {
        DetailedAnalysisState.correlationMatrix = null;
        return;
    }
    
    // Calculate correlation between success rate and points
    const successRates = data.map(r => r.successRate);
    const points = data.map(r => r.points);
    
    const correlation = calculatePearsonCorrelation(successRates, points);
    
    DetailedAnalysisState.correlationMatrix = {
        successRate_points: {
            correlation: correlation,