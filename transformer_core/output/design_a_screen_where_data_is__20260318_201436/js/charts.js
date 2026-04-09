// charts.js - Chart visualization and graphing functionality for Table Tennis Statistics Dashboard

// Charts state and configuration
const ChartsState = {
    chartInstances: {},
    chartConfigs: {
        serveType: null,
        strokeAnalysis: null,
        focusAnalysis: null,
        expandableCharts: {}
    },
    currentTheme: 'default',
    animationEnabled: true,
    exportQuality: 'high',
    chartInteractions: {
        hoverEffects: true,
        clickEvents: true,
        tooltips: true
    },
    colorSchemes: {
        default: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'],
        pastel: ['#A5D6A7', '#90CAF9', '#FFE082', '#CE93D8', '#EF9A9A', '#80DEEA'],
        vibrant: ['#00E676', '#00B0FF', '#FF9100', '#D500F9', '#FF1744', '#00E5FF'],
        monochrome: ['#616161', '#757575', '#9E9E9E', '#BDBDBD', '#E0E0E0', '#F5F5F5'],
        colorblind: ['#117733', '#332288', '#DDCC77', '#CC6677', '#88CCEE', '#AA4499']
    },
    activeColorScheme: 'default'
};

// Initialize charts when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
});

// Listen for chart-related events
document.addEventListener('dataUpdated', () => {
    refreshAllCharts();
});

document.addEventListener('chartThemeChanged', (e) => {
    updateChartTheme(e.detail.theme);
});

document.addEventListener('chartColorsUpdated', (e) => {
    updateChartColors(e.detail.colors);
});

// Core charts initialization
function initializeCharts() {
    console.log('Initializing Charts Module...');
    
    // Initialize all chart components
    initializeChartComponents();
    
    // Set up event listeners
    setupChartEventListeners();
    
    // Load chart configurations
    loadChartConfigurations();
    
    console.log('Charts Module initialized successfully');
}

// Initialize all chart components
function initializeChartComponents() {
    // Initialize serve type pie chart
    initializeServeTypeChart();
    
    // Initialize stroke analysis bar graph
    initializeStrokeAnalysisChart();
    
    // Initialize focus analysis pie chart
    initializeFocusAnalysisChart();
    
    // Initialize expandable chart visualizations
    initializeExpandableChartVisualizations();
    
    // Initialize chart color scheme selector
    initializeChartColorSchemeSelector();
}

// Setup chart event listeners
function setupChartEventListeners() {
    // Chart interaction events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.chart-export-btn') || e.target.closest('.chart-export-btn')) {
            const chartId = e.target.dataset.chart || e.target.closest('.chart-export-btn').dataset.chart;
            exportChart(chartId);
        }
        
        if (e.target.matches('.chart-refresh-btn') || e.target.closest('.chart-refresh-btn')) {
            const chartId = e.target.dataset.chart || e.target.closest('.chart-refresh-btn').dataset.chart;
            refreshChart(chartId);
        }
        
        if (e.target.matches('.chart-toggle-btn') || e.target.closest('.chart-toggle-btn')) {
            const chartId = e.target.dataset.chart || e.target.closest('.chart-toggle-btn').dataset.chart;
            toggleChartVisibility(chartId);
        }
    });
    
    // Chart theme changes
    document.addEventListener('change', (e) => {
        if (e.target.matches('.chart-theme-selector')) {
            updateChartTheme(e.target.value);
        }
    });
    
    // Chart animation toggles
    document.addEventListener('change', (e) => {
        if (e.target.matches('.chart-animation-toggle')) {
            ChartsState.animationEnabled = e.target.checked;
            updateChartAnimations();
        }
    });
    
    // Chart interaction toggles
    document.addEventListener('change', (e) => {
        if (e.target.matches('.chart-interaction-toggle')) {
            const interaction = e.target.dataset.interaction;
            const enabled = e.target.checked;
            updateChartInteraction(interaction, enabled);
        }
    });
    
    // Window resize for responsive charts
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeAllCharts();
        }, 250);
    });
}

// Initialize serve type pie chart
function initializeServeTypeChart() {
    const chartElement = document.getElementById('serve_type_pie_chart');
    if (!chartElement) return;
    
    // Create canvas if it doesn't exist
    if (!chartElement.querySelector('canvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'serve-type-chart-canvas';
        chartElement.appendChild(canvas);
    }
    
    // Set up chart container
    chartElement.innerHTML = `
        <div class="chart-container">
            <div class="chart-header">
                <h3>Serve Type Analysis</h3>
                <div class="chart-controls">
                    <button class="btn-icon chart-export-btn" data-chart="serveType" title="Export chart">
                        <i class="export-icon"></i>
                    </button>
                    <button class="btn-icon chart-refresh-btn" data-chart="serveType" title="Refresh chart">
                        <i class="refresh-icon"></i>
                    </button>
                    <button class="btn-icon chart-toggle-btn" data-chart="serveType" title="Toggle visibility">
                        <i class="visibility-icon"></i>
                    </button>
                </div>
            </div>
            <div class="chart-body">
                <canvas id="serve-type-chart-canvas"></canvas>
            </div>
            <div class="chart-footer">
                <div class="chart-legend" id="serve-type-legend"></div>
                <div class="chart-stats" id="serve-type-stats"></div>
            </div>
        </div>
    `;
    
    // Create chart configuration
    ChartsState.chartConfigs.serveType = {
        type: 'pie',
        data: {
            labels: ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ChartsState.colorSchemes[ChartsState.activeColorScheme].slice(0, 4),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: getPieChartOptions('Serve Type Distribution')
    };
    
    // Create chart instance
    createServeTypeChart();
}

function createServeTypeChart() {
    const canvas = document.getElementById('serve-type-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (ChartsState.chartInstances.serveType) {
        ChartsState.chartInstances.serveType.destroy();
    }
    
    // Update data
    updateServeTypeChartData();
    
    // Create new chart
    ChartsState.chartInstances.serveType = new Chart(ctx, ChartsState.chartConfigs.serveType);
    
    // Add click event for drilldown
    canvas.onclick = (evt) => {
        if (!ChartsState.chartInteractions.clickEvents) return;
        
        const points = ChartsState.chartInstances.serveType.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const label = ChartsState.chartInstances.serveType.data.labels[firstPoint.index];
            const value = ChartsState.chartInstances.serveType.data.datasets[0].data[firstPoint.index];
            
            document.dispatchEvent(new CustomEvent('chartClick', {
                detail: {
                    chart: 'serveType',
                    label: label,
                    value: value,
                    index: firstPoint.index
                }
            }));
        }
    };
    
    // Update legend and stats
    updateServeTypeLegend();
    updateServeTypeStats();
}

function updateServeTypeChartData() {
    if (!ChartsState.chartConfigs.serveType) return;
    
    const data = App.state.dataset;
    const serveTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
    
    const counts = serveTypes.map(type => {
        return data.filter(record => record.serveType === type).length;
    });
    
    // Update chart data
    ChartsState.chartConfigs.serveType.data.datasets[0].data = counts;
    ChartsState.chartConfigs.serveType.data.datasets[0].backgroundColor = 
        ChartsState.colorSchemes[ChartsState.activeColorScheme].slice(0, 4);
    
    // Update animation based on state
    if (!ChartsState.animationEnabled) {
        ChartsState.chartConfigs.serveType.options.animation = false;
    }
}

function updateServeTypeLegend() {
    const legendContainer = document.getElementById('serve-type-legend');
    if (!legendContainer || !ChartsState.chartConfigs.serveType) return;
    
    const labels = ChartsState.chartConfigs.serveType.data.labels;
    const data = ChartsState.chartConfigs.serveType.data.datasets[0].data;
    const colors = ChartsState.chartConfigs.serveType.data.datasets[0].backgroundColor;
    const total = data.reduce((sum, val) => sum + val, 0);
    
    legendContainer.innerHTML = labels.map((label, index) => {
        const count = data[index];
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        return `
            <div class="legend-item" data-index="${index}">
                <span class="legend-color" style="background-color: ${colors[index]}"></span>
                <span class="legend-label">${label}</span>
                <span class="legend-value">${count} (${percentage}%)</span>
            </div>
        `;
    }).join('');
    
    // Add click events to legend items
    legendContainer.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            toggleServeTypeSlice(index);
        });
    });
}

function updateServeTypeStats() {
    const statsContainer = document.getElementById('serve-type-stats');
    if (!statsContainer || !ChartsState.chartConfigs.serveType) return;
    
    const data = ChartsState.chartConfigs.serveType.data.datasets[0].data;
    const total = data.reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
        statsContainer.innerHTML = '<p>No serve data available</p>';
        return;
    }
    
    const maxIndex = data.indexOf(Math.max(...data));
    const mostCommon = ChartsState.chartConfigs.serveType.data.labels[maxIndex];
    const mostCommonCount = data[maxIndex];
    const mostCommonPercentage = Math.round((mostCommonCount / total) * 100);
    
    statsContainer.innerHTML = `
        <div class="stats-summary">
            <p>Total serves: <strong>${total}</strong></p>
            <p>Most common: <strong>${mostCommon}</strong> (${mostCommonPercentage}%)</p>
            <p>Serve variety: <strong>${data.filter(count => count > 0).length}</strong> types used</p>
        </div>
    `;
}

function toggleServeTypeSlice(index) {
    if (!ChartsState.chartInstances.serveType) return;
    
    const meta = ChartsState.chartInstances.serveType.getDatasetMeta(0);
    const currentHidden = meta.data[index].hidden;
    
    // Toggle slice visibility
    meta.data[index].hidden = !currentHidden;
    
    // Update chart
    ChartsState.chartInstances.serveType.update();
    
    // Update legend
    updateServeTypeLegend();
}

// Initialize stroke analysis bar graph
function initializeStrokeAnalysisChart() {
    const chartElement = document.getElementById('stroke_analysis_bar_graph');
    if (!chartElement) return;
    
    // Create canvas if it doesn't exist
    if (!chartElement.querySelector('canvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'stroke-analysis-chart-canvas';
        chartElement.appendChild(canvas);
    }
    
    // Set up chart container
    chartElement.innerHTML = `
        <div class="chart-container">
            <div class="chart-header">
                <h3>Stroke Analysis</h3>
                <div class="chart-controls">
                    <button class="btn-icon chart-export-btn" data-chart="strokeAnalysis" title="Export chart">
                        <i class="export-icon"></i>
                    </button>
                    <button class="btn-icon chart-refresh-btn" data-chart="strokeAnalysis" title="Refresh chart">
                        <i class="refresh-icon"></i>
                    </button>
                    <button class="btn-icon chart-toggle-btn" data-chart="strokeAnalysis" title="Toggle visibility">
                        <i class="visibility-icon"></i>
                    </button>
                    <select class="chart-type-selector" data-chart="strokeAnalysis">
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="horizontalBar">Horizontal Bar</option>
                    </select>
                </div>
            </div>
            <div class="chart-body">
                <canvas id="stroke-analysis-chart-canvas"></canvas>
            </div>
            <div class="chart-footer">
                <div class="chart-legend" id="stroke-analysis-legend"></div>
                <div class="chart-filters">
                    <label>
                        <input type="checkbox" class="stroke-filter" value="Backhand loop" checked>
                        Backhand loop
                    </label>
                    <label>
                        <input type="checkbox" class="stroke-filter" value="Forehand loop" checked>
                        Forehand loop
                    </label>
                    <label>
                        <input type="checkbox" class="stroke-filter" value="Backhand Serve" checked>
                        Backhand Serve
                    </label>
                    <label>
                        <input type="checkbox" class="stroke-filter" value="Forehand Serve" checked>
                        Forehand Serve
                    </label>
                </div>
            </div>
        </div>
    `;
    
    // Create chart configuration
    ChartsState.chartConfigs.strokeAnalysis = {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: getBarChartOptions('Stroke Performance')
    };
    
    // Create chart instance
    createStrokeAnalysisChart();
    
    // Add event listeners for filters
    chartElement.querySelectorAll('.stroke-filter').forEach(filter => {
        filter.addEventListener('change', updateStrokeAnalysisFilters);
    });
    
    // Add event listener for chart type selector
    const typeSelector = chartElement.querySelector('.chart-type-selector');
    if (typeSelector) {
        typeSelector.addEventListener('change', (e) => {
            changeChartType('strokeAnalysis', e.target.value);
        });
    }
}

function createStrokeAnalysisChart() {
    const canvas = document.getElementById('stroke-analysis-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (ChartsState.chartInstances.strokeAnalysis) {
        ChartsState.chartInstances.strokeAnalysis.destroy();
    }
    
    // Update data
    updateStrokeAnalysisChartData();
    
    // Create new chart
    ChartsState.chartInstances.strokeAnalysis = new Chart(ctx, ChartsState.chartConfigs.strokeAnalysis);
    
    // Add click event for drilldown
    canvas.onclick = (evt) => {
        if (!ChartsState.chartInteractions.clickEvents) return;
        
        const points = ChartsState.chartInstances.strokeAnalysis.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const datasetIndex = firstPoint.datasetIndex;
            const label = ChartsState.chartInstances.strokeAnalysis.data.labels[firstPoint.index];
            const datasetLabel = ChartsState.chartInstances.strokeAnalysis.data.datasets[datasetIndex].label;
            const value = ChartsState.chartInstances.strokeAnalysis.data.datasets[datasetIndex].data[firstPoint.index];
            
            document.dispatchEvent(new CustomEvent('chartClick', {
                detail: {
                    chart: 'strokeAnalysis',
                    label: label,
                    dataset: datasetLabel,
                    value: value,
                    index: firstPoint.index,
                    datasetIndex: datasetIndex
                }
            }));
        }
    };
    
    // Update legend
    updateStrokeAnalysisLegend();
}

function updateStrokeAnalysisChartData() {
    if (!ChartsState.chartConfigs.strokeAnalysis) return;
    
    const data = App.state.dataset;
    const strokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
    
    // Group by date and calculate averages
    const dates = [...new Set(data.map(record => record.date))].sort();
    const datasets = strokeTypes.map((strokeType, index) => {
        const strokeData = dates.map(date => {
            const dailyRecords = data.filter(record => 
                record.date === date && record.strokeType === strokeType
            );
            
            if (dailyRecords.length === 0) return null;
            
            // Calculate average success rate for this stroke type on this date
            return dailyRecords.reduce((sum, record) => sum + record.successRate, 0) / dailyRecords.length;
        });
        
        return {
            label: strokeType,
            data: strokeData,
            backgroundColor: ChartsState.colorSchemes[ChartsState.activeColorScheme][index],
            borderColor: ChartsState.colorSchemes[ChartsState.activeColorScheme][index],
            borderWidth: 1,
            fill: false,
            tension: 0.4
        };
    });
    
    // Update chart data
    ChartsState.chartConfigs.strokeAnalysis.data.labels = dates;
    ChartsState.chartConfigs.strokeAnalysis.data.datasets = datasets;
    
    // Update animation based on state
    if (!ChartsState.animationEnabled) {
        ChartsState.chartConfigs.strokeAnalysis.options.animation = false;
    }
}

function updateStrokeAnalysisFilters() {
    const filters = Array.from(document.querySelectorAll('.stroke-filter:checked')).map(f => f.value);
    
    if (!ChartsState.chartInstances.strokeAnalysis) return;
    
    // Show/hide datasets based on filters
    ChartsState.chartInstances.strokeAnalysis.data.datasets.forEach((dataset, index) => {
        dataset.hidden = !filters.includes(dataset.label);
    });
    
    ChartsState.chartInstances.strokeAnalysis.update();
}

function updateStrokeAnalysisLegend() {
    const legendContainer = document.getElementById('stroke-analysis-legend');
    if (!legendContainer || !ChartsState.chartConfigs.strokeAnalysis) return;
    
    const datasets = ChartsState.chartConfigs.strokeAnalysis.data.datasets;
    
    legendContainer.innerHTML = datasets.map((dataset, index) => {
        const total = dataset.data.filter(val => val !== null).reduce((sum, val) => sum + val, 0);
        const count = dataset.data.filter(val => val !== null).length;
        const average = count > 0 ? Math.round(total / count) : 0;
        
        return `
            <div class="legend-item" data-index="${index}">
                <span class="legend-color" style="background-color: ${dataset.backgroundColor}"></span>
                <span class="legend-label">${dataset.label}</span>
                <span class="legend-value">Avg: ${average}%</span>
            </div>
        `;
    }).join('');
    
    // Add click events to legend items
    legendContainer.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            toggleStrokeDataset(index);
        });
    });
}

function toggleStrokeDataset(index) {
    if (!ChartsState.chartInstances.strokeAnalysis) return;
    
    const meta = ChartsState.chartInstances.strokeAnalysis.getDatasetMeta(index);
    const currentHidden = meta.hidden;
    
    // Toggle dataset visibility
    meta.hidden = !currentHidden;
    
    // Update chart
    ChartsState.chartInstances.strokeAnalysis.update();
    
    // Update corresponding filter checkbox
    const filterCheckbox = document.querySelector(`.stroke-filter[value="${ChartsState.chartInstances.strokeAnalysis.data.datasets[index].label}"]`);
    if (filterCheckbox) {
        filterCheckbox.checked = !currentHidden;
    }
}

// Initialize focus analysis pie chart
function initializeFocusAnalysisChart() {
    const chartElement = document.getElementById('focus_analysis_pie_chart');
    if (!chartElement) return;
    
    // Create canvas if it doesn't exist
    if (!chartElement.querySelector('canvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'focus-analysis-chart-canvas';
        chartElement.appendChild(canvas);
    }
    
    // Set up chart container
    chartElement.innerHTML = `
        <div class="chart-container">
            <div class="chart-header">
                <h3>Focus Analysis</h3>
                <div class="chart-controls">
                    <button class="btn-icon chart-export-btn" data-chart="focusAnalysis" title="Export chart">
                        <i class="export-icon"></i>
                    </button>
                    <button class="btn-icon chart-refresh-btn" data-chart="focusAnalysis" title="Refresh chart">
                        <i class="refresh-icon"></i>
                    </button>
                    <button class="btn-icon chart-toggle-btn" data-chart="focusAnalysis" title="Toggle visibility">
                        <i class="visibility-icon"></i>
                    </button>
                    <select class="chart-variant-selector" data-chart="focusAnalysis">
                        <option value="pie">Pie Chart</option>
                        <option value="doughnut">Doughnut Chart</option>
                        <option value="polarArea">Polar Area</option>
                    </select>
                </div>
            </div>
            <div class="chart-body">
                <canvas id="focus-analysis-chart-canvas"></canvas>
            </div>
            <div class="chart-footer">
                <div class="chart-legend" id="focus-analysis-legend"></div>
                <div class="chart-comparison" id="focus-comparison-stats"></div>
            </div>
        </div>
    `;
    
    // Create chart configuration
    ChartsState.chartConfigs.focusAnalysis = {
        type: 'doughnut',
        data: {
            labels: ['Right', 'Left'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ChartsState.colorSchemes[ChartsState.activeColorScheme].slice(0, 2),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 15,
                cutout: '50%'
            }]
        },
        options: getDoughnutChartOptions('Focus Distribution')
    };
    
    // Create chart instance
    createFocusAnalysisChart();
    
    // Add event listener for chart variant selector
    const variantSelector = chartElement.querySelector('.chart-variant-selector');
    if (variantSelector) {
        variantSelector.addEventListener('change', (e) => {
            changeChartVariant('focusAnalysis', e.target.value);
        });
    }
}

function createFocusAnalysisChart() {
    const canvas = document.getElementById('focus-analysis-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (ChartsState.chartInstances.focusAnalysis) {
        ChartsState.chartInstances.focusAnalysis.destroy();
    }
    
    // Update data
    updateFocusAnalysisChartData();
    
    // Create new chart
    ChartsState.chartInstances.focusAnalysis = new Chart(ctx, ChartsState.chartConfigs.focusAnalysis);
    
    // Add click event for drilldown
    canvas.onclick = (evt) => {
        if (!ChartsState.chartInteractions.clickEvents) return;
        
        const points = ChartsState.chartInstances.focusAnalysis.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const label = ChartsState.chartInstances.focusAnalysis.data.labels[firstPoint.index];
            const value = ChartsState.chartInstances.focusAnalysis.data.datasets[0].data[firstPoint.index];
            
            document.dispatchEvent(new CustomEvent('chartClick', {
                detail: {
                    chart: 'focusAnalysis',
                    label: label,
                    value: value,
                    index: firstPoint.index
                }
            }));
        }
    };
    
    // Update legend and comparison stats
    updateFocusAnalysisLegend();
    updateFocusComparisonStats();
}

function updateFocusAnalysisChartData() {
    if (!ChartsState.chartConfigs.focusAnalysis) return;
    
    const data = App.state.dataset;
    const focusTypes = ['Right', 'Left'];
    
    const counts = focusTypes.map(type => {
        return data.filter(record => record.focus === type).length;
    });
    
    // Update chart data
    ChartsState.chartConfigs.focusAnalysis.data.datasets[0].data = counts;
    ChartsState.chartConfigs.focusAnalysis.data.datasets[0].backgroundColor = 
        ChartsState.colorSchemes[ChartsState.activeColorScheme].slice(0, 2);
    
    // Update cutout based on chart type
    if (ChartsState.chartConfigs.focusAnalysis.type === 'pie') {
        ChartsState.chartConfigs.focusAnalysis.data.datasets[0].cutout = '0%';
    } else if (ChartsState.chartConfigs.focusAnalysis.type === 'doughnut') {
        ChartsState.chartConfigs.focusAnalysis.data.datasets[0].cutout = '50%';
    } else if (ChartsState.chartConfigs.focusAnalysis.type === 'polarArea') {
        ChartsState.chartConfigs.focusAnalysis.data.datasets[0].cutout = '0%';
    }
    
    // Update animation based on state
    if (!ChartsState.animationEnabled) {
        ChartsState.chartConfigs.focusAnalysis.options.animation = false;
    }
}

function updateFocusAnalysisLegend() {
    const legendContainer = document.getElementById('focus-analysis-legend');
    if (!legendContainer || !ChartsState.chartConfigs.focusAnalysis) return;
    
    const labels = ChartsState.chartConfigs.focusAnalysis.data.labels;
    const data = ChartsState.chartConfigs.focusAnalysis.data.datasets[0].data;
    const colors = ChartsState.chartConfigs.focusAnalysis.data.datasets[0].backgroundColor;
    const total = data.reduce((sum, val) => sum + val, 0);
    
    legendContainer.innerHTML = labels.map((label, index) => {
        const count = data[index];
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        return `
            <div class="legend-item" data-index="${index}">
                <span class="legend-color" style="background-color: ${colors[index]}"></span>
                <span class="legend-label">${label} Side</span>
                <span class="legend-value">${count} (${percentage}%)</span>
            </div>
        `;
    }).join('');
    
    // Add click events to legend items
    legendContainer.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            toggleFocusSlice(index);
        });
    });
}

function updateFocusComparisonStats() {
    const statsContainer = document.getElementById('focus-comparison-stats');
    if (!statsContainer || !ChartsState.chartConfigs.focusAnalysis) return;
    
    const data = App.state.dataset;
    const rightFocus = data.filter(record => record.focus === 'Right');
    const leftFocus = data.filter(record => record.focus === 'Left');
    
    const rightSuccess = rightFocus.length > 0 ? 
        rightFocus.reduce((sum, record) => sum + record.successRate, 0) / rightFocus.length : 0;
    const leftSuccess = leftFocus.length > 0 ? 
        leftFocus.reduce((sum, record) => sum + record.successRate, 0) / leftFocus.length : 0;
    
    const rightPoints = rightFocus.reduce((sum, record) => sum + record.points, 0);
    const leftPoints = leftFocus.reduce((sum, record) => sum + record.points, 0);
    
    const difference = Math.abs(rightSuccess - leftSuccess);
    const betterSide = rightSuccess > leftSuccess ? 'Right' : 'Left';
    
    statsContainer.innerHTML = `
        <div class="comparison-stats">
            <h4>Performance Comparison</h4>
            <div class="comparison-row">
                <span>Success Rate:</span>
                <span class="right-stat">${Math.round(rightSuccess)}%</span>
                <span class="left-stat">${Math.round(leftSuccess)}%</span>
            </div>
            <div class="comparison-row">
                <span>Total Points:</span>
                <span class="right-stat">${rightPoints}</span>
                <span class="left-stat">${leftPoints}</span>
            </div>
            <div class="comparison-summary">
                <p><strong>${betterSide} side performs ${Math.round(difference)}% better</strong></p>
            </div>
        </div>
    `;
}

function toggleFocusSlice(index) {
    if (!ChartsState.chartInstances.focusAnalysis) return;
    
    const meta = ChartsState.chartInstances.focusAnalysis.getDatasetMeta(0);
    const currentHidden = meta.data[index].hidden;
    
    // Toggle slice visibility
    meta.data[index].hidden = !currentHidden;
    
    // Update chart
    ChartsState.chartInstances.focusAnalysis.update();
    
    // Update legend
    updateFocusAnalysisLegend();
}

function changeChartVariant(chartId, variant) {
    if (!ChartsState.chartConfigs[chartId]) return;
    
    // Update chart type
    ChartsState.chartConfigs[chartId].type = variant;
    
    // Recreate chart
    if (chartId === 'focusAnalysis') {
        createFocusAnalysisChart();
    }
}

// Initialize expandable chart visualizations
function initializeExpandableChartVisualizations() {
    const expandableContainer = document.getElementById('expandable_chart_visualizations');
    if (!expandableContainer) return;
    
    expandableContainer.innerHTML = `
        <div class="expandable-charts">
            <h3>Interactive Chart Visualizations</h3>
            <div class="charts-grid">
                <div class="chart-card expandable" data-chart="performanceTrend">
                    <div class="chart-header">
                        <h4>Performance Trend</h4>
                        <button class="btn-icon expand-chart" data-chart="performanceTrend">
                            <i class="expand-icon"></i>
                        </button>
                    </div>
                    <div class="chart-body">
                        <canvas id="performance-trend-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card expandable" data-chart="serveSuccess">
                    <div class="chart-header">
                        <h4>Serve Success Rate</h4>
                        <button class="btn-icon expand-chart" data-chart="serveSuccess">
                            <i class="expand-icon"></i>
                        </button>
                    </div>
                    <div class="chart-body">
                        <canvas id="serve-success-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card expandable" data-chart="strokeComparison">
                    <div class="chart-header">
                        <h4>Stroke Comparison</h4>
                        <button class="btn-icon expand-chart" data-chart="strokeComparison">
                            <i class="expand-icon"></i>
                        </button>
                    </div>
                    <div class="chart-body">
                        <canvas id="stroke-comparison-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card expandable" data-chart="focusPerformance">
                    <div class="chart-header">
                        <h4>Focus Performance</h4>
                        <button class="btn-icon expand-chart" data-chart="focusPerformance">
                            <i class="expand-icon"></i>
                        </button>
                    </div>
                    <div class="chart-body">
                        <canvas id="focus-performance-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="expanded-view" id="expanded-chart-view" style="display: none;">
                <div class="expanded-header">
                    <h3 id="expanded-chart-title"></h3>
                    <div class="expanded-controls">
                        <button class="btn btn-outline" id="close-expanded">
                            <i class="close-icon"></i>
                            Close
                        </button>
                    </div>
                </div>
                <div class="expanded-body">
                    <canvas id="expanded-chart-canvas"></canvas>
                </div>
                <div class="expanded-footer">
                    <div class="chart-details" id="expanded-chart-details"></div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize expandable charts
    initializePerformanceTrendChart();
    initializeServeSuccessChart();
    initializeStrokeComparisonChart();
    initializeFocusPerformanceChart();
    
    // Add event listeners for expand buttons
    expandableContainer.querySelectorAll('.expand-chart').forEach(button => {
        button.addEventListener('click', (e) => {
            const chartId = e.target.closest('.expand-chart').dataset.chart;
            expandChart(chartId);
        });
    });
    
    // Add event listener for close button
    expandableContainer.querySelector('#close-expanded').addEventListener('click', closeExpandedChart);
}

function initializePerformanceTrendChart() {
    const canvas = document.getElementById('performance-trend-chart');
    if (!canvas) return;
    
    ChartsState.chartConfigs.expandableCharts.performanceTrend = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Success Rate Trend',
                data: [],
                borderColor: ChartsState.colorSchemes[ChartsState.activeColorScheme][0],
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: getLineChartOptions('Performance Trend', true)
    };
    
    updatePerformanceTrendChart();
}

function updatePerformanceTrendChart() {
    const data = App.state.dataset;
    if (data.length === 0) return;
    
    // Group by date and calculate average success rate
    const dates = [...new Set(data.map(record => record.date))].sort();
    const dailyAverages = dates.map(date => {
        const dailyRecords = data.filter(record => record.date === date);
        return dailyRecords.reduce((sum, record) => sum + record.successRate, 0) / dailyRecords.length;
    });
    
    // Update chart data
    if (ChartsState.chartConfigs.expandableCharts.performanceTrend) {
        ChartsState.chartConfigs.expandableCharts.performanceTrend.data.labels = dates;
        ChartsState.chartConfigs.expandableCharts.performanceTrend.data.datasets[0].data = dailyAverages;
        
        // Create or update chart
        const canvas = document.getElementById('performance-trend-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            if (ChartsState.chartInstances.performanceTrend) {
                ChartsState.chartInstances.performanceTrend.destroy();
            }
            
            ChartsState.chartInstances.performanceTrend = new Chart(ctx, 
                ChartsState.chartConfigs.expandableCharts.performanceTrend);
        }
    }
}

function initializeServeSuccessChart() {
    const canvas = document.getElementById('serve-success-chart');
    if (!canvas) return;
    
    ChartsState.chartConfigs.expandableCharts.serveSuccess = {
        type: 'bar',
        data: {
            labels: ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'],
            datasets: [{
                label: 'Average Success Rate',
                data: [0, 0, 0, 0],
                backgroundColor: ChartsState.colorSchemes[ChartsState.activeColorScheme].slice(0, 4),
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: getBarChartOptions('Serve Success Rate', true)
    };
    
    updateServeSuccessChart();
}

function updateServeSuccessChart() {
    const data = App.state.dataset;
    const serveTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
    
    const averages = serveTypes.map(serveType => {
        const serveRecords = data.filter(record => record.serveType === serveType);
        return serveRecords.length > 0 ? 
            serveRecords.reduce((sum, record) => sum + record.successRate, 0) / serveRecords.length : 0;
    });
    
    // Update chart data
    if (ChartsState.chartConfigs.expandableCharts.serveSuccess) {
        ChartsState.chartConfigs.expandableCharts.serveSuccess.data.datasets[0].data = averages;
        
        // Create or update chart
        const canvas = document.getElementById('serve-success-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            if (ChartsState.chartInstances.serveSuccess) {
                ChartsState.chartInstances.serveSuccess.destroy();
            }
            
            ChartsState.chartInstances.serveSuccess = new Chart(ctx, 
                ChartsState.chartConfigs.expandableCharts.serveSuccess);
        }
    }
}

function initializeStrokeComparisonChart() {
    const canvas = document.getElementById('stroke-comparison-chart');
    if (!canvas) return;
    
    ChartsState.chartConfigs.expandableCharts.strokeComparison = {
        type: 'radar',
        data: {
            labels: ['Success Rate', 'Points', 'Consistency', 'Frequency'],
            datasets: []
        },
        options: getRadarChartOptions('Stroke Comparison', true)
    };
    
    updateStrokeComparisonChart();
}

function updateStrokeComparisonChart() {
    const data = App.state.dataset;
    const strokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
    
    const datasets = strokeTypes.map((strokeType, index) => {
        const strokeRecords = data.filter(record => record.strokeType === strokeType);
        
        if (strokeRecords.length === 0) {
            return {
                label: strokeType,
                data: [0, 0, 0, 0],
                backgroundColor: `rgba(${hexToRgb(ChartsState.colorSchemes[ChartsState.activeColorScheme][index])}, 0.2)`,
                borderColor: ChartsState.colorSchemes[ChartsState.activeColorScheme][index],
                borderWidth: 1,
                pointBackgroundColor: ChartsState.colorSchemes[ChartsState.activeColorScheme][index]
            };
        }
        
        const successRate = strokeRecords.reduce((sum, record) => sum + record.successRate, 0) / strokeRecords.length;
        const avgPoints = strokeRecords.reduce((sum, record) => sum + record.points, 0) / strokeRecords.length;
        
        // Calculate consistency (standard deviation of success rate)
        const successRates = strokeRecords.map(r => r.successRate);
        const mean = successRates.reduce((sum, val) => sum + val, 0) / successRates.length;
        const variance = successRates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / successRates.length;
        const consistency = 100 - Math.sqrt(variance); // Higher consistency = lower deviation
        
        const frequency = strokeRecords.length;
        
        return {
            label: strokeType,
            data: [successRate, avgPoints, consistency, frequency],
            backgroundColor: `rgba(${hexToRgb(ChartsState.colorSchemes[ChartsState.activeColorScheme][index])}, 0.2)`,
            borderColor: ChartsState.colorSchemes[ChartsState.activeColorScheme][index],
            borderWidth: 1,
            pointBackgroundColor: ChartsState.colorSchemes[ChartsState.activeColorScheme][index]
        };
    });
    
    // Update chart data
    if (ChartsState.chartConfigs.expandableCharts.strokeComparison) {
        ChartsState.chartConfigs.expandableCharts.strokeComparison.data.datasets = datasets;
        
        // Create or update chart
        const canvas = document.getElementById('stroke-comparison-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            if (ChartsState.chartInstances.strokeComparison) {
                ChartsState.chartInstances.strokeComparison.destroy();
            }
            
            ChartsState.chartInstances.strokeComparison = new Chart(ctx, 
                ChartsState.chartConfigs.expandableCharts.strokeComparison);
        }
    }
}

function initializeFocusPerformanceChart() {
    const canvas = document.getElementById('focus-performance-chart');
    if (!canvas) return;
    
    ChartsState.chartConfigs.expandableCharts.focusPerformance = {
        type: 'polarArea',
        data: {
            labels: ['Right Success', 'Right Points', 'Left Success', 'Left Points'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    ChartsState.colorSchemes[ChartsState.activeColorScheme][0],
                    ChartsState.colorSchemes[ChartsState.activeColorScheme][1],
                    ChartsState.colorSchemes[ChartsState.activeColorScheme][2],
                    ChartsState.colorSchemes[ChartsState.activeColorScheme][3]
                ],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: getPolarAreaChartOptions('Focus Performance', true)
    };
    
    updateFocusPerformanceChart();
}

function updateFocusPerformanceChart() {
    const data = App.state.dataset;
    
    const rightFocus = data.filter(record => record.focus === 'Right');
    const leftFocus = data.filter(record => record.focus === 'Left');
    
    const rightSuccess = rightFocus.length > 0 ? 
        rightFocus.reduce((sum, record) => sum + record.successRate, 0) / rightFocus.length : 0;
    const rightPoints = rightFocus.reduce((sum, record) => sum + record.points, 0);
    
    const leftSuccess = leftFocus.length > 0 ? 
        leftFocus.reduce((sum, record) => sum + record.successRate, 0) / leftFocus.length : 0;
    const leftPoints = leftFocus.reduce((sum, record) => sum + record.points, 0);
    
    // Update chart data
    if (ChartsState.chartConfigs.expandableCharts.focusPerformance) {
        ChartsState.chartConfigs.expandableCharts.focusPerformance.data.datasets[0].data = [
            rightSuccess, rightPoints, leftSuccess, leftPoints
        ];
        
        // Create or update chart
        const canvas = document.getElementById('focus-performance-chart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            if (ChartsState.chartInstances.focusPerformance) {
                ChartsState.chartInstances.focusPerformance.destroy();
            }
            
            ChartsState.chartInstances.focusPerformance = new Chart(ctx, 
                ChartsState.chartConfigs.expandableCharts.focusPerformance);
        }
    }
}

// Expand chart to full view
function expandChart(chartId) {
    const expandedView = document.getElementById('expanded-chart-view');
    const expandedCanvas = document.getElementById('expanded-chart-canvas');
    const expandedTitle = document.getElementById('expanded-chart-title');
    const expandedDetails = document.getElementById('expanded-chart-details');
    
    if (!expandedView || !expandedCanvas || !expandedTitle) return;
    
    // Get chart configuration
    const chartConfig = ChartsState.chartConfigs.expandableCharts[chartId];
    if (!chartConfig) return;
    
    // Set title
    const titles = {
        'performanceTrend': 'Performance Trend Analysis',
        'serveSuccess': 'Serve Success Rate Analysis',
        'strokeComparison': 'Stroke Comparison Analysis',
        'focusPerformance': 'Focus Performance Analysis'
    };
    
    expandedTitle.textContent = titles[chartId] || 'Chart Analysis';
    
    // Create expanded chart
    const ctx = expandedCanvas.getContext('2d');
    
    // Destroy existing expanded chart if it exists
    if (ChartsState.chartInstances.expandedChart) {
        ChartsState.chartInstances.expandedChart.destroy();
    }
    
    // Create expanded chart with enhanced options
    const expandedConfig = JSON.parse(JSON.stringify(chartConfig));
    expandedConfig.options = {
        ...expandedConfig.options,
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            ...expandedConfig.options.plugins,
            legend: {
                display: true,
                position: 'right',
                labels: {
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                }
            }
        }
    };
    
    ChartsState.chartInstances.expandedChart = new Chart(ctx, expandedConfig);
    
    // Update details
    updateExpandedChartDetails(chartId, expandedDetails);
    
    // Show expanded view
    expandedView.style.display = 'block';
    App.utils.fadeIn(expandedView);
}

function closeExpandedChart() {
    const expandedView = document.getElementById('expanded-chart-view');
    if (expandedView) {
        App.utils.fadeOut(expandedView, 200, () => {
            expandedView.style.display = 'none';
        });
    }
}

function updateExpandedChartDetails(chartId, detailsContainer) {
    if (!detailsContainer) return;
    
    const data = App.state.dataset;
    let detailsHTML = '';
    
    switch(chartId) {
        case 'performanceTrend':
            const dates = [...new Set(data.map(record => record.date))].sort();
            const latestDate = dates[dates.length - 1];
            const earliestDate = dates[0];
            
            detailsHTML = `
                <h4>Trend Analysis Details</h4>
                <p>Time period: ${earliestDate} to ${latestDate}</p>
                <p>Total data points: ${dates.length} days</p>
                <p>Average daily success rate: ${calculateAverageSuccessRate()}%</p>
                <p>Trend direction: ${calculateTrendDirection(data)}</p>
            `;
            break;
            
        case 'serveSuccess':
            const serveTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
            const bestServe = serveTypes.reduce((best, type) => {
                const records = data.filter(r => r.serveType === type);
                const avg = records.length > 0 ? 
                    records.reduce((sum, r) => sum + r.successRate, 0) / records.length : 0;
                return avg > best.avg ? { type, avg } : best;
            }, { type: '', avg: 0 });
            
            detailsHTML = `
                <h4>Serve Analysis Details</h4>
                <p>Best performing serve: ${bestServe.type} (${Math.round(bestServe.avg)}%)</p>
                <p>Total serves analyzed: ${data.length}</p>
                <p>Serve variety: ${new Set(data.map(r => r.serveType)).size} types used</p>
            `;
            break;
            
        case 'strokeComparison':
            detailsHTML = `
                <h4>Stroke Comparison Details</h4>
                <p>Compares four key performance metrics across different stroke types</p>
                <p>Metrics include success rate, points scored, consistency, and frequency of use</p>
                <p>Larger areas indicate better overall performance</p>
            `;
            break;
            
        case 'focusPerformance':
            const rightFocus = data.filter(r => r.focus === 'Right');
            const leftFocus = data.filter(r => r.focus === 'Left');
            
            detailsHTML = `
                <h4>Focus Performance Details</h4>
                <p>Right side focus: ${rightFocus.length} records</p>
                <p>Left side focus: ${leftFocus.length} records</p>
                <p>Dominant side: ${rightFocus.length > leftFocus.length ? 'Right' : 'Left'}</p>
                <p>Performance balance: ${calculateFocusBalance(rightFocus.length, leftFocus.length)}</p>
            `;
            break;
    }
    
    detailsContainer.innerHTML = detailsHTML;
}

// Initialize chart color scheme selector
function initializeChartColorSchemeSelector() {
    const selectorContainer = document.getElementById('chart_color_scheme_selector');
    if (!selectorContainer) return;
    
    selectorContainer.innerHTML = `
        <div class="color-scheme-selector">
            <h3>Chart Color Schemes</h3>
            <div class="scheme-options">
                ${Object.keys(ChartsState.colorSchemes).map(scheme => `
                    <div class="scheme-option ${scheme === ChartsState.activeColorScheme ? 'active' : ''}" 
                         data-scheme="${scheme}">
                        <div class="scheme-preview">
                            ${ChartsState.colorSchemes[scheme].slice(0, 4).map(color => `
                                <div class="color-sample" style="background-color: ${color}"></div>
                            `).join('')}
                        </div>
                        <span class="scheme-name">${scheme.charAt(0).toUpperCase() + scheme.slice(1)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="scheme-actions">
                <button class="btn btn-primary" id="apply-color-scheme">
                    Apply Color Scheme
                </button>
                <button class="btn btn-outline" id="customize-colors">
                    Customize Colors
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    selectorContainer.querySelectorAll('.scheme-option').forEach(option => {
        option.addEventListener('click', () => {
            selectorContainer.querySelectorAll('.scheme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
            ChartsState.activeColorScheme = option.dataset.scheme;
        });
    });
    
    selectorContainer.querySelector('#apply-color-scheme').addEventListener('click', applyColorScheme);
    selectorContainer.querySelector('#customize-colors').addEventListener('click', customizeColors);
}

function applyColorScheme() {
    // Update all charts with new color scheme
    updateAllChartColors();
    
    // Save preference
    localStorage.setItem('ttChartColorScheme', ChartsState.activeColorScheme);
    
    App.showNotification(`"${ChartsState.activeColorScheme}" color scheme applied`, 'success');
}

function customizeColors() {
    const modal = document.getElementById('color-customizer-modal') || createColorCustomizerModal();
    App.utils.fadeIn(modal);
}

function createColorCustomizerModal() {
    const modal = document.createElement('div');
    modal.id = 'color-customizer-modal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Customize Chart Colors</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="color-customizer">
                    ${ChartsState.colorSchemes.default.map((color, index) => `
                        <div class="color-picker-group">
                            <label>Color ${index + 1}</label>
                            <input type="color" class="color-picker" data-index="${index}" value="${color}">
                            <input type="text" class="color-hex" data-index="${index}" value="${color}">
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-modal">Cancel</button>
                <button class="btn btn-primary" id="save-custom-colors">Save Custom Colors</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            App.utils.fadeOut(modal);
        });
    });
    
    modal.querySelector('#save-custom-colors').addEventListener('click', saveCustomColors);
    
    // Sync color pickers and hex inputs
    modal.querySelectorAll('.color-picker').forEach(picker => {
        picker.addEventListener('input', (e) => {
            const index = e.target.dataset.index;
            modal.querySelector(`.color-hex[data-index="${index}"]`).value = e.target.value;
        });
    });
    
    modal.querySelectorAll('.color-hex').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = e.target.dataset.index;
            const color = e.target.value;
            if (isValidHexColor(color)) {
                modal.querySelector(`.color-picker[data-index="${index}"]`).value = color;
            }
        });
    });
    
    return modal;
}

function saveCustomColors() {
    const modal = document.getElementById('color-customizer-modal');
    if (!modal) return;
    
    const customColors = [];
    modal.querySelectorAll('.color-picker').forEach(picker => {
        customColors.push(picker.value);
    });
    
    // Save custom colors
    ChartsState.colorSchemes.custom = customColors;
    ChartsState.activeColorScheme = 'custom';
    localStorage.setItem('ttCustomChartColors', JSON.stringify(customColors));
    
    // Update all charts
    updateAllChartColors();
    
    // Update color scheme selector
    initializeChartColorSchemeSelector();
    
    App.utils.fadeOut(modal);
    App.showNotification('Custom colors saved and applied', 'success');
}

// Chart utility functions
function getPieChartOptions(title, compact = false) {
    return {
        responsive: true,
        maintainAspectRatio: !compact,
        plugins: {
            legend: {
                display: false,
                position: 'right',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: compact ? 11 : 12
                    }
                }
            },
            tooltip: {
                enabled: ChartsState.chartInteractions.tooltips,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = context.parsed || 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            },
            title: {
                display: !compact,
                text: title,
                font: {
                    size: compact ? 14 : 16
                }
            }
        },
        animation: ChartsState.animationEnabled ? {
            animateScale: true,
            animateRotate: true
        } : false,
        hover: {
            mode: 'nearest',
            intersect: true,
            animationDuration: 200
        }
    };
}

function getBarChartOptions(title, compact = false) {
    return {
        responsive: true,
        maintainAspectRatio: !compact,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: !compact,
                    text: 'Value',
                    font: {
                        size: compact ? 11 : 12
                    }
                },
                ticks: {
                    font: {
                        size: compact ? 10 : 11
                    }
                }
            },
            x: {
                title: {
                    display: !compact,
                    text: 'Category',
                    font: {
                        size: compact ? 11 : 12
                    }
                },
                ticks: {
                    font: {
                        size: compact ? 10 : 11
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false,
                position: 'top',
                labels: {
                    font: {
                        size: compact ? 11 : 12
                    }
                }
            },
            tooltip: {
                enabled: ChartsState.chartInteractions.tooltips,
                mode: 'index',
                intersect: false
            },
            title: {
                display: !compact,
                text: title,
                font: {
                    size: compact ? 14 : 16
                }
            }
        },
        animation: ChartsState.animationEnabled ? {
            duration: 1000,
            easing: 'easeOutQuart'
        } : false,
        hover: {
            mode: 'nearest',
            intersect: true,
            animationDuration: 200
        }
    };
}

function getDoughnutChartOptions(title, compact = false) {
    const options = getPieChartOptions(title, compact);
    options.cutout = '50%';
    return options;
}

function getLineChartOptions(title, compact = false) {
    const options = getBarChartOptions(title, compact);
    options.scales.x.type = 'time';
    options.scales.x.time = {
        unit: 'day',
        displayFormats: {
            day: 'MMM D'
        }
    };
    return options;
}

function getRadarChartOptions(title, compact = false) {
    return {
        responsive: true,
        maintainAspectRatio: !compact,
        scales: {
            r: {
                beginAtZero: true,
                ticks: {
                    display: !compact,
                    font: {
                        size: compact ? 10 : 11
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: !compact,
                position: 'right',
                labels: {
                    font: {
                        size: compact ? 11 : 12
                    }
                }
            },
            tooltip: {
                enabled: ChartsState.chartInteractions.tooltips
            },
            title: {
                display: !compact,
                text: title,
                font: {
                    size: compact ? 14 : 16
                }
            }
        },
        animation: ChartsState.animationEnabled ? {
            duration: 1000,
            easing: 'easeOutQuart'
        } : false
    };
}

function getPolarAreaChartOptions(title, compact = false) {
    return {
        responsive: true,
        maintainAspectRatio: !compact,
        scales: {
            r: {
                beginAtZero: true,
                ticks: {
                    display: !compact,
                    font: {
                        size: compact ? 10 : 11
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: !compact,
                position: 'right',
                labels: {
                    font: {
                        size: compact ? 11 : 12
                    }
                }
            },
            tooltip: {
                enabled: ChartsState.chartInteractions.tooltips
            },
            title: {
                display: !compact,
                text: title,
                font: {
                    size: compact ? 14 : 16
                }
            }
        },
        animation: ChartsState.animationEnabled ? {
            animateRotate: true,
            animateScale: true
        } : false
    };
}

// Chart management functions
function refreshAllCharts() {
    updateServeTypeChartData();
    updateStrokeAnalysisChartData();
    updateFocusAnalysisChartData();
    updatePerformanceTrendChart();
    updateServeSuccessChart();
    updateStrokeComparisonChart();
    updateFocusPerformanceChart();
    
    // Update chart instances if they exist
    if (ChartsState.chartInstances.serveType) {
        ChartsState.chartInstances.serveType.update();
    }
    if (ChartsState.chartInstances.strokeAnalysis) {
        ChartsState.chartInstances.strokeAnalysis.update();
    }
    if (ChartsState.chartInstances.focusAnalysis) {
        ChartsState.chartInstances.focusAnalysis.update();
    }
    if (ChartsState.chartInstances.performanceTrend) {
        ChartsState.chartInstances.performanceTrend.update();
    }
    if (ChartsState.chartInstances.serveSuccess) {
        ChartsState.chartInstances.serveSuccess.update();
    }
    if (ChartsState.chartInstances.strokeComparison) {
        ChartsState.chartInstances.strokeComparison.update();
    }
    if (ChartsState.chartInstances.focusPerformance) {
        ChartsState.chartInstances.focusPerformance.update();
    }
    
    // Update legends and stats
    updateServeTypeLegend();
    updateServeTypeStats();
    updateStrokeAnalysisLegend();
    updateFocusAnalysisLegend();
    updateFocusComparisonStats();
}

function refreshChart(chartId) {
    switch(chartId) {
        case 'serveType':
            updateServeTypeChartData();
            if (ChartsState.chartInstances.serveType) {
                ChartsState.chartInstances.serveType.update();
            }
            updateServeTypeLegend();
            updateServeTypeStats();
            break;
        case 'strokeAnalysis':
            updateStrokeAnalysisChartData();
            if (ChartsState.chartInstances.strokeAnalysis) {
                ChartsState.chartInstances.strokeAnalysis.update();
            }
            updateStrokeAnalysisLegend();
            break;
        case 'focusAnalysis':
            updateFocusAnalysisChartData();
            if (ChartsState.chartInstances.focusAnalysis) {
                ChartsState.chartInstances.focusAnalysis.update();
            }
            updateFocusAnalysisLegend();
            updateFocusComparisonStats();
            break;
    }
    
    App.showNotification(`Chart refreshed: ${chartId}`, 'success');
}

function toggleChartVisibility(chartId) {
    const chartElement = document.getElementById(`${chartId}_pie_chart`) || 
                        document.getElementById(`${chartId}_bar_graph`);
    
    if (chartElement) {
        const isVisible = chartElement.style.display !== 'none';
        chartElement.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            App.utils.fadeIn(chartElement);
        }
        
        App.showNotification(`Chart ${isVisible ? 'hidden' : 'shown'}: ${chartId}`, 'info');
    }
}

function changeChartType(chartId, type) {
    if (!ChartsState.chartConfigs[chartId]) return;
    
    ChartsState.chartConfigs[chartId].type = type;
    
    // Recreate chart
    if (chartId === 'strokeAnalysis') {
        createStrokeAnalysisChart();
    }
}

function updateChartTheme(theme) {
    ChartsState.currentTheme = theme;
    
    // Update chart options based on theme
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#333333';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update all chart configurations
    Object.keys(ChartsState.chartConfigs).forEach(chartId => {
        if (ChartsState.chartConfigs[chartId] && ChartsState.chartConfigs[chartId].options) {
            const options = ChartsState.chartConfigs[chartId].options;
            
            // Update scale colors
            if (options.scales) {
                Object.keys(options.scales).forEach(scaleKey => {
                    if (options.scales[scaleKey]) {
                        options.scales[scaleKey].grid = {
                            color: gridColor
                        };
                        options.scales[scaleKey].ticks = {
                            color: textColor
                        };
                        if (options.scales[scaleKey].title) {
                            options.scales[scaleKey].title.color = textColor;
                        }
                    }
                });
            }
            
            // Update plugin colors
            if (options.plugins) {
                if (options.plugins.legend && options.plugins.legend.labels) {
                    options.plugins.legend.labels.color = textColor;
                }
                if (options.plugins.title) {
                    options.plugins.title.color = textColor;
                }
            }
        }
    });
    
    // Update all chart instances
    refreshAllCharts();
    
    App.showNotification(`Chart theme updated: ${theme}`, 'success');
}

function updateChartColors(colors) {
    if (colors && Array.isArray(colors)) {
        ChartsState.colorSchemes.custom = colors;
        ChartsState.activeColorScheme = 'custom';
        updateAllChartColors();
    }
}

function updateAllChartColors() {
    const colors = ChartsState.colorSchemes[ChartsState.activeColorScheme];
    
    // Update serve type chart colors
    if (ChartsState.chartConfigs.serveType) {
        ChartsState.chartConfigs.serveType.data.datasets[0].backgroundColor = colors.slice(0, 4);
        if (ChartsState.chartInstances.serveType) {
            ChartsState.chartInstances.serveType.update();
        }
        updateServeTypeLegend();
    }
    
    // Update stroke analysis chart colors
    if (ChartsState.chartConfigs.strokeAnalysis) {
        ChartsState.chartConfigs.strokeAnalysis.data.datasets.forEach((dataset, index) => {
            dataset.backgroundColor = colors[index];
            dataset.borderColor = colors[index];
        });
        if (ChartsState.chartInstances.strokeAnalysis) {
            ChartsState.chartInstances.strokeAnalysis.update();
        }
        updateStrokeAnalysisLegend();
    }
    
    // Update focus analysis chart colors
    if (ChartsState.chartConfigs.focusAnalysis) {
        ChartsState.chartConfigs.focusAnalysis.data.datasets[0].backgroundColor = colors.slice(0, 2);
        if (ChartsState.chartInstances.focusAnalysis) {
            ChartsState.chartInstances.focusAnalysis.update();
        }
        updateFocusAnalysisLegend();
    }
    
    // Update expandable charts
    updatePerformanceTrendChart();
    updateServeSuccessChart();
    updateStrokeComparisonChart();
    updateFocusPerformanceChart();
}

function updateChartAnimations() {
    // Update all chart configurations
    Object.keys(ChartsState.chartConfigs).forEach(chartId => {
        if (ChartsState.chartConfigs[chartId] && ChartsState.chartConfigs[chartId].options) {
            ChartsState.chartConfigs[chartId].options.animation = ChartsState.animationEnabled;
        }
    });
    
    // Update expandable chart configurations
    Object.keys(ChartsState.chartConfigs.expandableCharts).forEach(chartId => {
        if (ChartsState.chartConfigs.expandableCharts[chartId] && 
            ChartsState.chartConfigs.expandableCharts[chartId].options) {
            ChartsState.chartConfigs.expandableCharts[chartId].options.animation = ChartsState.animationEnabled;
        }
    });
    
    refreshAllCharts();
}

function updateChartInteraction(interaction, enabled) {
    ChartsState.chartInteractions[interaction] = enabled;
    
    // Update tooltip settings
    if (interaction === 'tooltips') {
        Object.keys(ChartsState.chartConfigs).forEach(chartId => {
            if (ChartsState.chartConfigs[chartId] && 
                ChartsState.chartConfigs[chartId].options &&
                ChartsState.chartConfigs[chartId].options.plugins &&
                ChartsState.chartConfigs[chartId].options.plugins.tooltip) {
                ChartsState.chartConfigs[chartId].options.plugins.tooltip.enabled = enabled;
            }
        });
    }
    
    refreshAllCharts();
}

function resizeAllCharts() {
    Object.keys(ChartsState.chartInstances).forEach(chartId => {
        if (ChartsState.chartInstances[chartId]) {
            ChartsState.chartInstances[chartId].resize();
        }
    });
}

function exportChart(chartId) {
    let chartInstance;
    let chartName;
    
    switch(chartId) {
        case 'serveType':
            chartInstance = ChartsState.chartInstances.serveType;
            chartName = 'Serve-Type-Analysis';
            break;
        case 'strokeAnalysis':
            chartInstance = ChartsState.chartInstances.strokeAnalysis;
            chartName = 'Stroke-Analysis';
            break;
        case 'focusAnalysis':
            chartInstance = ChartsState.chartInstances.focusAnalysis;
            chartName = 'Focus-Analysis';
            break;
        default:
            App.showNotification('Chart not found for export', 'error');
            return;
    }
    
    if (!chartInstance) {
        App.showNotification('Chart not initialized', 'error');
        return;
    }
    
    // Get canvas element
    const canvas = chartInstance.canvas;
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${chartName}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    App.showNotification(`Chart exported: ${chartName}`, 'success');
}

// Utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '76, 175, 80'; // Default green
}

function isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}

function calculateAverageSuccessRate() {
    const data = App.state.dataset;
    if (data.length === 0) return 0;
    
    const total = data.reduce((sum, record) => sum + record.successRate, 0);
    return Math.round(total / data.length);
}

function calculateTrendDirection(data) {
    if (data.length < 2) return 'Insufficient data';
    
    const dates = [...new Set(data.map(record => record.date))].sort();
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    const firstRecords = data.filter(record => record.date === firstDate);
    const lastRecords = data.filter(record => record.date === lastDate);
    
    const firstAvg = firstRecords.reduce((sum, record) => sum + record.successRate, 0) / firstRecords.length;
    const lastAvg = lastRecords.reduce((sum, record) => sum + record.successRate, 0) / lastRecords.length;
    
    const difference = lastAvg - firstAvg;
    
    if (difference > 5) return 'Strongly improving';
    if (difference > 2) return 'Improving';
    if (difference > -2) return 'Stable';
    if (difference > -5) return 'Declining';
    return 'Strongly declining';
}

function calculateFocusBalance(rightCount, leftCount) {
    const total = rightCount + leftCount;
    if (total === 0) return 'No data';
    
    const balance = Math.abs(rightCount - leftCount) / total * 100;
    
    if (balance < 10) return 'Well balanced';
    if (balance < 25) return 'Moderately balanced';
    if (balance < 50) return 'Somewhat imbalanced';
    return 'Highly imbalanced';
}

function loadChartConfigurations() {
    // Load saved color scheme
    const savedScheme = localStorage.getItem('ttChartColorScheme');
    if (savedScheme && ChartsState.colorSchemes[savedScheme]) {
        ChartsState.activeColorScheme = savedScheme;
    }
    
    // Load custom colors if they exist
    const customColors = localStorage.getItem('ttCustomChartColors');
    if (customColors) {
        try {
            ChartsState.colorSchemes.custom = JSON.parse(customColors);
        } catch (e) {
            console.error('Error loading custom colors:', e);
        }
    }
    
    // Load animation preference
    const animationPref = localStorage.getItem('ttChartAnimation');
    if (animationPref !== null) {
        ChartsState.animationEnabled = animationPref === 'true';
    }
    
    // Load interaction preferences
    const interactions = localStorage.getItem('ttChartInteractions');
    if (interactions) {
        try {
            ChartsState.chartInteractions = {
                ...ChartsState.chartInteractions,
                ...JSON.parse(interactions)
            };
        } catch (e) {
            console.error('Error loading chart interactions:', e);
        }
    }
}

// Export charts functionality
window.Charts = {
    state: ChartsState,
    refreshAll: refreshAllCharts,
    refreshChart: refreshChart,
    exportChart: exportChart,
    updateTheme: updateChartTheme,
    updateColors: updateChartColors,
    toggleAnimation: (enabled) => {
        ChartsState.animationEnabled = enabled;
        updateChartAnimations();
    },
    utils: {
        hexToRgb: hexToRgb,
        isValidHexColor: isValidHexColor
    }
};