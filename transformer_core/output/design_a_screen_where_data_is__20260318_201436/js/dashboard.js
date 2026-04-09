// dashboard.js - Dashboard functionality for Table Tennis Statistics Dashboard

// Dashboard state and configuration
const DashboardState = {
    activeView: 'overview',
    filteredData: [],
    chartInstances: {},
    tableInstance: null,
    currentFilters: {}
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-page="dashboard"]')) {
        initializeDashboard();
    }
});

// Listen for dashboard loaded event
document.addEventListener('dashboardLoaded', () => {
    initializeDashboard();
});

// Core dashboard initialization
function initializeDashboard() {
    console.log('Initializing Dashboard...');
    
    // Load dashboard data
    loadDashboardData();
    
    // Initialize all dashboard components
    initializeDashboardComponents();
    
    // Set up dashboard event listeners
    setupDashboardEventListeners();
    
    // Render initial visualizations
    renderDashboardVisualizations();
    
    // Update dashboard UI
    updateDashboardUI();
    
    console.log('Dashboard initialized successfully');
}

// Load dashboard data
function loadDashboardData() {
    DashboardState.filteredData = [...App.state.dataset];
    calculateDashboardStatistics();
}

// Initialize all dashboard components
function initializeDashboardComponents() {
    // Initialize search and filter controls
    initializeSearchFilters();
    
    // Initialize data table
    initializeDataTable();
    
    // Initialize chart components
    initializeCharts();
    
    // Initialize quick actions
    initializeQuickActions();
    
    // Initialize export options
    initializeExportOptions();
}

// Setup dashboard event listeners
function setupDashboardEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', App.utils.debounce(handleSearch, 300));
    }
    
    // Filter controls
    document.addEventListener('change', (e) => {
        if (e.target.matches('.dashboard-filter')) {
            handleFilterChange(e.target);
        }
    });
    
    // View toggle buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('.view-toggle')) {
            toggleDashboardView(e.target.dataset.view);
        }
    });
    
    // Data refresh
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleDataRefresh);
    }
    
    // Export buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('.export-btn')) {
            handleExport(e.target.dataset.format);
        }
    });
    
    // Chart interactions
    document.addEventListener('chartClick', (e) => {
        handleChartDrilldown(e.detail);
    });
    
    // Data table interactions
    document.addEventListener('rowClick', (e) => {
        showRecordDetails(e.detail);
    });
}

// Initialize search and filter controls
function initializeSearchFilters() {
    const filters = {
        serveType: document.getElementById('filter-serve-type'),
        strokeType: document.getElementById('filter-stroke-type'),
        focus: document.getElementById('filter-focus'),
        dateRange: document.getElementById('filter-date-range'),
        successRate: document.getElementById('filter-success-rate')
    };
    
    // Populate filter options
    populateFilterOptions();
    
    // Set initial filter values from state
    Object.keys(DashboardState.currentFilters).forEach(key => {
        if (filters[key]) {
            filters[key].value = DashboardState.currentFilters[key];
        }
    });
}

function populateFilterOptions() {
    // Serve type filter
    const serveTypes = [...new Set(App.state.dataset.map(item => item.serveType))];
    const serveTypeFilter = document.getElementById('filter-serve-type');
    if (serveTypeFilter) {
        serveTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            serveTypeFilter.appendChild(option);
        });
    }
    
    // Stroke type filter
    const strokeTypes = [...new Set(App.state.dataset.map(item => item.strokeType))];
    const strokeTypeFilter = document.getElementById('filter-stroke-type');
    if (strokeTypeFilter) {
        strokeTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            strokeTypeFilter.appendChild(option);
        });
    }
}

// Initialize data table
function initializeDataTable() {
    const tableElement = document.getElementById('data-table');
    if (!tableElement) return;
    
    // Create DataTable instance
    DashboardState.tableInstance = {
        element: tableElement,
        currentPage: 1,
        pageSize: 10,
        sortColumn: 'date',
        sortDirection: 'desc'
    };
    
    renderDataTable();
}

function renderDataTable() {
    const tableElement = DashboardState.tableInstance.element;
    if (!tableElement) return;
    
    const data = DashboardState.filteredData;
    const { currentPage, pageSize, sortColumn, sortDirection } = DashboardState.tableInstance;
    
    // Sort data
    const sortedData = [...data].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Paginate
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = sortedData.slice(startIndex, endIndex);
    
    // Clear table
    const tbody = tableElement.querySelector('tbody');
    if (tbody) tbody.innerHTML = '';
    
    // Populate rows
    pageData.forEach((record, index) => {
        const row = document.createElement('tr');
        row.dataset.recordId = record.id;
        row.innerHTML = `
            <td>${record.date}</td>
            <td><span class="serve-type-badge ${record.serveType.toLowerCase()}">${record.serveType}</span></td>
            <td>${record.strokeType}</td>
            <td><span class="focus-badge ${record.focus.toLowerCase()}">${record.focus}</span></td>
            <td>
                <div class="success-rate-bar">
                    <div class="success-rate-fill" style="width: ${record.successRate}%"></div>
                    <span>${record.successRate}%</span>
                </div>
            </td>
            <td>${record.points}</td>
            <td class="actions-cell">
                <button class="btn-icon edit-record" data-id="${record.id}" title="Edit">
                    <i class="edit-icon"></i>
                </button>
                <button class="btn-icon delete-record" data-id="${record.id}" title="Delete">
                    <i class="delete-icon"></i>
                </button>
            </td>
        `;
        
        // Add click event for row
        row.addEventListener('click', (e) => {
            if (!e.target.closest('.actions-cell')) {
                document.dispatchEvent(new CustomEvent('rowClick', { 
                    detail: { record, index: startIndex + index }
                }));
            }
        });
        
        if (tbody) tbody.appendChild(row);
    });
    
    // Add edit/delete event listeners
    tableElement.querySelectorAll('.edit-record').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editRecord(parseInt(btn.dataset.id));
        });
    });
    
    tableElement.querySelectorAll('.delete-record').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRecord(parseInt(btn.dataset.id));
        });
    });
    
    // Update pagination
    updateTablePagination(data.length);
}

function updateTablePagination(totalRecords) {
    const paginationElement = document.getElementById('table-pagination');
    if (!paginationElement) return;
    
    const { currentPage, pageSize } = DashboardState.tableInstance;
    const totalPages = Math.ceil(totalRecords / pageSize);
    
    // Clear pagination
    paginationElement.innerHTML = '';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-btn';
    prevButton.innerHTML = '&laquo;';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            DashboardState.tableInstance.currentPage--;
            renderDataTable();
        }
    });
    paginationElement.appendChild(prevButton);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            DashboardState.tableInstance.currentPage = i;
            renderDataTable();
        });
        paginationElement.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-btn';
    nextButton.innerHTML = '&raquo;';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            DashboardState.tableInstance.currentPage++;
            renderDataTable();
        }
    });
    paginationElement.appendChild(nextButton);
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalRecords} records)`;
    paginationElement.appendChild(pageInfo);
}

// Initialize chart components
function initializeCharts() {
    // Initialize serve type pie chart
    initializeServeTypeChart();
    
    // Initialize stroke analysis bar graph
    initializeStrokeAnalysisChart();
    
    // Initialize focus analysis pie chart
    initializeFocusAnalysisChart();
    
    // Initialize expandable visualizations
    initializeExpandableCharts();
}

function initializeServeTypeChart() {
    const chartElement = document.getElementById('serve-type-chart');
    if (!chartElement) return;
    
    // Calculate serve type distribution
    const serveTypeData = calculateServeTypeDistribution();
    
    // Create chart
    DashboardState.chartInstances.serveType = {
        element: chartElement,
        type: 'pie',
        data: serveTypeData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = context.parsed || 0;
                            return `${label}: ${value} serves (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    renderServeTypeChart();
}

function calculateServeTypeDistribution() {
    const data = DashboardState.filteredData;
    const serveTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
    
    return serveTypes.map(type => {
        const count = data.filter(item => item.serveType === type).length;
        const percentage = data.length > 0 ? Math.round((count / data.length) * 100) : 0;
        return {
            type,
            count,
            percentage
        };
    });
}

function renderServeTypeChart() {
    const chart = DashboardState.chartInstances.serveType;
    if (!chart || !chart.element) return;
    
    const data = chart.data;
    const ctx = chart.element.getContext('2d');
    
    // Clear previous chart
    if (chart.instance) {
        chart.instance.destroy();
    }
    
    // Create new chart
    chart.instance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.type),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: [
                    '#4CAF50', // Pendulum - Green
                    '#2196F3', // Chop - Blue
                    '#FF9800', // Tomahawk - Orange
                    '#9C27B0'  // Forehand - Purple
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: chart.options
    });
    
    // Add click event for drilldown
    chart.element.onclick = (evt) => {
        const points = chart.instance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const label = chart.instance.data.labels[firstPoint.index];
            document.dispatchEvent(new CustomEvent('chartClick', {
                detail: { chart: 'serveType', label, data: data[firstPoint.index] }
            }));
        }
    };
}

function initializeStrokeAnalysisChart() {
    const chartElement = document.getElementById('stroke-analysis-chart');
    if (!chartElement) return;
    
    // Calculate stroke analysis data
    const strokeData = calculateStrokeAnalysisData();
    
    // Create chart
    DashboardState.chartInstances.strokeAnalysis = {
        element: chartElement,
        type: 'bar',
        data: strokeData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Strokes'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Stroke Type'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw} strokes`;
                        }
                    }
                }
            }
        }
    };
    
    renderStrokeAnalysisChart();
}

function calculateStrokeAnalysisData() {
    const data = DashboardState.filteredData;
    const strokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
    
    return strokeTypes.map(type => {
        const count = data.filter(item => item.strokeType === type).length;
        const avgSuccessRate = data.filter(item => item.strokeType === type)
            .reduce((sum, item) => sum + item.successRate, 0) / count || 0;
        
        return {
            type,
            count,
            avgSuccessRate: Math.round(avgSuccessRate)
        };
    });
}

function renderStrokeAnalysisChart() {
    const chart = DashboardState.chartInstances.strokeAnalysis;
    if (!chart || !chart.element) return;
    
    const data = chart.data;
    const ctx = chart.element.getContext('2d');
    
    // Clear previous chart
    if (chart.instance) {
        chart.instance.destroy();
    }
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(33, 150, 243, 0.8)');
    gradient.addColorStop(1, 'rgba(33, 150, 243, 0.2)');
    
    // Create new chart
    chart.instance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.type),
            datasets: [{
                label: 'Number of Strokes',
                data: data.map(d => d.count),
                backgroundColor: gradient,
                borderColor: '#2196F3',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#1976D2'
            }]
        },
        options: chart.options
    });
    
    // Add click event for drilldown
    chart.element.onclick = (evt) => {
        const points = chart.instance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const label = chart.instance.data.labels[firstPoint.index];
            document.dispatchEvent(new CustomEvent('chartClick', {
                detail: { chart: 'strokeAnalysis', label, data: data[firstPoint.index] }
            }));
        }
    };
}

function initializeFocusAnalysisChart() {
    const chartElement = document.getElementById('focus-analysis-chart');
    if (!chartElement) return;
    
    // Calculate focus analysis data
    const focusData = calculateFocusAnalysisData();
    
    // Create chart
    DashboardState.chartInstances.focusAnalysis = {
        element: chartElement,
        type: 'doughnut',
        data: focusData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = context.parsed || 0;
                            return `${label}: ${value} shots (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    renderFocusAnalysisChart();
}

function calculateFocusAnalysisData() {
    const data = DashboardState.filteredData;
    const focusTypes = ['Right', 'Left'];
    
    return focusTypes.map(type => {
        const count = data.filter(item => item.focus === type).length;
        const percentage = data.length > 0 ? Math.round((count / data.length) * 100) : 0;
        return {
            type,
            count,
            percentage
        };
    });
}

function renderFocusAnalysisChart() {
    const chart = DashboardState.chartInstances.focusAnalysis;
    if (!chart || !chart.element) return;
    
    const data = chart.data;
    const ctx = chart.element.getContext('2d');
    
    // Clear previous chart
    if (chart.instance) {
        chart.instance.destroy();
    }
    
    // Create new chart
    chart.instance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.type),
            datasets: [{
                data: data.map(d => d.count),
                backgroundColor: [
                    '#FF6B6B', // Right - Red
                    '#4ECDC4'  // Left - Teal
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 10
            }]
        },
        options: chart.options
    });
    
    // Add center text
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const centerText = {
        id: 'centerText',
        afterDraw(chart) {
            const { ctx, chartArea: { width, height } } = chart;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText(total.toString(), width / 2, height / 2 - 10);
            
            ctx.font = '14px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText('Total Shots', width / 2, height / 2 + 20);
            ctx.restore();
        }
    };
    
    chart.instance.options.plugins = chart.instance.options.plugins || {};
    chart.instance.options.plugins.centerText = centerText;
    
    // Add click event for drilldown
    chart.element.onclick = (evt) => {
        const points = chart.instance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
        if (points.length) {
            const firstPoint = points[0];
            const label = chart.instance.data.labels[firstPoint.index];
            document.dispatchEvent(new CustomEvent('chartClick', {
                detail: { chart: 'focusAnalysis', label, data: data[firstPoint.index] }
            }));
        }
    };
}

function initializeExpandableCharts() {
    const expandButtons = document.querySelectorAll('.expand-chart-btn');
    expandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const chartId = btn.dataset.chart;
            toggleChartExpansion(chartId);
        });
    });
}

function toggleChartExpansion(chartId) {
    const chartContainer = document.getElementById(chartId);
    if (!chartContainer) return;
    
    const isExpanded = chartContainer.classList.contains('expanded');
    
    if (isExpanded) {
        chartContainer.classList.remove('expanded');
        chartContainer.style.maxHeight = '400px';
    } else {
        chartContainer.classList.add('expanded');
        chartContainer.style.maxHeight = '800px';
    }
    
    // Refresh chart on resize
    setTimeout(() => {
        if (DashboardState.chartInstances[chartId]) {
            DashboardState.chartInstances[chartId].instance.resize();
        }
    }, 300);
}

// Initialize quick actions
function initializeQuickActions() {
    const quickActions = {
        upload: document.getElementById('quick-upload'),
        export: document.getElementById('quick-export'),
        refresh: document.getElementById('quick-refresh'),
        addRecord: document.getElementById('quick-add-record')
    };
    
    if (quickActions.upload) {
        quickActions.upload.addEventListener('click', () => App.triggerFileUpload());
    }
    
    if (quickActions.export) {
        quickActions.export.addEventListener('click', () => App.exportData());
    }
    
    if (quickActions.refresh) {
        quickActions.refresh.addEventListener('click', handleDataRefresh);
    }
    
    if (quickActions.addRecord) {
        quickActions.addRecord.addEventListener('click', showAddRecordForm);
    }
}

// Initialize export options
function initializeExportOptions() {
    const exportFormatSelect = document.getElementById('export-format');
    if (exportFormatSelect) {
        exportFormatSelect.value = App.state.userPreferences.exportFormat;
        exportFormatSelect.addEventListener('change', (e) => {
            App.updatePreference('exportFormat', e.target.value);
        });
    }
    
    const exportBtn = document.getElementById('export-dashboard');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportDashboardData();
        });
    }
}

// Handle search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    DashboardState.currentFilters.search = searchTerm;
    
    applyFilters();
}

function handleFilterChange(filterElement) {
    const filterName = filterElement.id.replace('filter-', '');
    const filterValue = filterElement.value;
    
    DashboardState.currentFilters[filterName] = filterValue === 'all' ? null : filterValue;
    
    applyFilters();
}

function applyFilters() {
    let filteredData = [...App.state.dataset];
    
    // Apply search filter
    if (DashboardState.currentFilters.search) {
        const searchTerm = DashboardState.currentFilters.search;
        filteredData = filteredData.filter(item => 
            Object.values(item).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            )
        );
    }
    
    // Apply serve type filter
    if (DashboardState.currentFilters.serveType) {
        filteredData = filteredData.filter(item => 
            item.serveType === DashboardState.currentFilters.serveType
        );
    }
    
    // Apply stroke type filter
    if (DashboardState.currentFilters.strokeType) {
        filteredData = filteredData.filter(item => 
            item.strokeType === DashboardState.currentFilters.strokeType
        );
    }
    
    // Apply focus filter
    if (DashboardState.currentFilters.focus) {
        filteredData = filteredData.filter(item => 
            item.focus === DashboardState.currentFilters.focus
        );
    }
    
    // Apply date range filter
    if (DashboardState.currentFilters.dateRange) {
        // Date range filtering logic would go here
    }
    
    // Apply success rate filter
    if (DashboardState.currentFilters.successRate) {
        const minRate = parseInt(DashboardState.currentFilters.successRate);
        filteredData = filteredData.filter(item => item.successRate >= minRate);
    }
    
    DashboardState.filteredData = filteredData;
    
    // Reset table to first page
    if (DashboardState.tableInstance) {
        DashboardState.tableInstance.currentPage = 1;
    }
    
    // Update all visualizations
    refreshDashboardVisualizations();
    
    // Update statistics
    calculateDashboardStatistics();
    updateStatisticsDisplay();
}

// Calculate dashboard statistics
function calculateDashboardStatistics() {
    const data = DashboardState.filteredData;
    
    DashboardState.statistics = {
        totalRecords: data.length,
        avgSuccessRate: data.length > 0 ? 
            Math.round(data.reduce((sum, item) => sum + item.successRate, 0) / data.length) : 0,
        totalPoints: data.reduce((sum, item) => sum + item.points, 0),
        mostCommonServe: data.length > 0 ? 
            getMostCommonValue(data, 'serveType') : 'N/A',
        mostCommonStroke: data.length > 0 ? 
            getMostCommonValue(data, 'strokeType') : 'N/A'
    };
}

function getMostCommonValue(data, property) {
    const counts = {};
    data.forEach(item => {
        counts[item[property]] = (counts[item[property]] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function updateStatisticsDisplay() {
    const stats = DashboardState.statistics;
    
    // Update statistic cards
    updateStatCard('total-records', stats.totalRecords, 'Total Records');
    updateStatCard('avg-success-rate', `${stats.avgSuccessRate}%`, 'Avg Success Rate');
    updateStatCard('total-points', stats.totalPoints, 'Total Points');
    updateStatCard('common-serve', stats.mostCommonServe, 'Most Common Serve');
    updateStatCard('common-stroke', stats.mostCommonStroke, 'Most Common Stroke');
}

function updateStatCard(elementId, value, label) {
    const element = document.getElementById(elementId);
    if (element) {
        const valueElement = element.querySelector('.stat-value');
        const labelElement = element.querySelector('.stat-label');
        
        if (valueElement) {
            // Animate value change
            const oldValue = valueElement.textContent;
            valueElement.textContent = value;
            
            if (oldValue !== value.toString()) {
                valueElement.classList.add('updated');
                setTimeout(() => {
                    valueElement.classList.remove('updated');
                }, 500);
            }
        }
        
        if (labelElement) {
            labelElement.textContent = label;
        }
    }
}

// Toggle dashboard view
function toggleDashboardView(view) {
    if (DashboardState.activeView === view) return;
    
    // Animate view transition
    const oldView = document.querySelector(`.view-${DashboardState.activeView}`);
    const newView = document.querySelector(`.view-${view}`);
    
    if (oldView) App.utils.fadeOut(oldView);
    if (newView) {
        App.utils.fadeIn(newView);
        DashboardState.activeView = view;
        
        // Update active view button
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Load view-specific data
        loadViewData(view);
    }
}

function loadViewData(view) {
    switch(view) {
        case 'overview':
            // Overview view already loaded
            break;
        case 'detailed':
            loadDetailedView();
            break;
        case 'comparison':
            loadComparisonView();
            break;
        case 'trends':
            loadTrendsView();
            break;
    }
}

function loadDetailedView() {
    // Load detailed statistics and expanded charts
    document.dispatchEvent(new CustomEvent('detailedViewLoaded'));
}

function loadComparisonView() {
    // Initialize comparison tools
    initializeComparisonTools();
}

function loadTrendsView() {
    // Load trend analysis data
    document.dispatchEvent(new CustomEvent('trendsViewLoaded'));
}

// Handle data refresh
function handleDataRefresh() {
    App.showNotification('Refreshing dashboard data...', 'info');
    
    // Simulate refresh delay
    setTimeout(() => {
        loadDashboardData();
        refreshDashboardVisualizations();
        App.showNotification('Dashboard data refreshed', 'success');
    }, 1000);
}

// Refresh all dashboard visualizations
function refreshDashboardVisualizations() {
    // Update charts
    updateCharts();
    
    // Update data table
    renderDataTable();
    
    // Update statistics
    updateStatisticsDisplay();
}

function updateCharts() {
    // Update serve type chart data
    if (DashboardState.chartInstances.serveType) {
        DashboardState.chartInstances.serveType.data = calculateServeTypeDistribution();
        renderServeTypeChart();
    }
    
    // Update stroke analysis chart data
    if (DashboardState.chartInstances.strokeAnalysis) {
        DashboardState.chartInstances.strokeAnalysis.data = calculateStrokeAnalysisData();
        renderStrokeAnalysisChart();
    }
    
    // Update focus analysis chart data
    if (DashboardState.chartInstances.focusAnalysis) {
        DashboardState.chartInstances.focusAnalysis.data = calculateFocusAnalysisData();
        renderFocusAnalysisChart();
    }
}

// Handle chart drilldown
function handleChartDrilldown(detail) {
    const { chart, label, data } = detail;
    
    // Show drilldown modal with detailed information
    showDrilldownModal(chart, label, data);
}

function showDrilldownModal(chartType, label, data) {
    const modal = document.getElementById('drilldown-modal') || createDrilldownModal();
    
    // Set modal content based on chart type
    let content = '';
    switch(chartType) {
        case 'serveType':
            content = `
                <h3>${label} Serve Analysis</h3>
                <p>Total serves: ${data.count}</p>
                <p>Percentage: ${data.percentage}%</p>
                <div class="detailed-stats">
                    <h4>Related Records</h4>
                    <ul>
                        ${getRelatedRecords('serveType', label).map(record => `
                            <li>${record.date} - ${record.strokeType} - ${record.successRate}% success</li>
                        `).join('')}
                    </ul>
                </div>
            `;
            break;
        case 'strokeAnalysis':
            content = `
                <h3>${label} Analysis</h3>
                <p>Total strokes: ${data.count}</p>
                <p>Average success rate: ${data.avgSuccessRate}%</p>
            `;
            break;
        case 'focusAnalysis':
            content = `
                <h3>${label} Side Focus Analysis</h3>
                <p>Total shots: ${data.count}</p>
                <p>Percentage: ${data.percentage}%</p>
            `;
            break;
    }
    
    modal.querySelector('.modal-body').innerHTML = content;
    App.utils.fadeIn(modal);
}

function createDrilldownModal() {
    const modal = document.createElement('div');
    modal.id = 'drilldown-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Detailed Analysis</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-modal">Close</button>
                <button class="btn btn-primary" id="export-drilldown">Export Data</button>
            </div>
        </div>
    `;
    
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            App.utils.fadeOut(modal);
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            App.utils.fadeOut(modal);
        }
    });
    
    document.body.appendChild(modal);
    return modal;
}

function getRelatedRecords(property, value) {
    return DashboardState.filteredData
        .filter(item => item[property] === value)
        .slice(0, 5); // Return top 5 records
}

// Show record details
function showRecordDetails(detail) {
    const { record, index } = detail;
    
    const detailsPanel = document.getElementById('record-details') || createDetailsPanel();
    
    detailsPanel.innerHTML = `
        <div class="details-header">
            <h3>Record Details</h3>
            <button class="close-details">&times;</button>
        </div>
        <div class="details-body">
            <div class="detail-row">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${record.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${record.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Serve Type:</span>
                <span class="detail-value badge ${record.serveType.toLowerCase()}">${record.serveType}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Stroke Type:</span>
                <span class="detail-value">${record.strokeType}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Focus:</span>
                <span class="detail-value badge ${record.focus.toLowerCase()}">${record.focus}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Success Rate:</span>
                <span class="detail-value">
                    <div class="success-rate-bar small">
                        <div class="success-rate-fill" style="width: ${record.successRate}%"></div>
                        <span>${record.successRate}%</span>
                    </div>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Points:</span>
                <span class="detail-value">${record.points}</span>
            </div>
        </div>
        <div class="details-footer">
            <button class="btn btn-secondary close-details">Close</button>
            <button class="btn btn-primary" onclick="editRecord(${record.id})">Edit</button>
        </div>
    `;
    
    detailsPanel.querySelectorAll('.close-details').forEach(btn => {
        btn.addEventListener('click', () => {
            App.utils.fadeOut(detailsPanel);
        });
    });
    
    App.utils.fadeIn(detailsPanel);
}

function createDetailsPanel() {
    const panel = document.createElement('div');
    panel.id = 'record-details';
    panel.className = 'details-panel';
    document.body.appendChild(panel);
    return panel;
}

// Edit record
function editRecord(recordId) {
    const record = App.state.dataset.find(item => item.id === recordId);
    if (!record) return;
    
    // Show edit form
    showEditForm(record);
}

function showEditForm(record) {
    const form = document.getElementById('edit-record-form') || createEditForm();
    
    // Populate form fields
    form.querySelector('#edit-record-id').value = record.id;
    form.querySelector('#edit-date').value = record.date;
    form.querySelector('#edit-serve-type').value = record.serveType;
    form.querySelector('#edit-stroke-type').value = record.strokeType;
    form.querySelector('#edit-focus').value = record.focus;
    form.querySelector('#edit-success-rate').value = record.successRate;
    form.querySelector('#edit-points').value = record.points;
    
    App.utils.fadeIn(form);
}

function createEditForm() {
    const form = document.createElement('div');
    form.id = 'edit-record-form';
    form.className = 'modal';
    form.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Edit Record</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="record-edit-form">
                    <input type="hidden" id="edit-record-id">
                    <div class="form-group">
                        <label for="edit-date">Date</label>
                        <input type="date" id="edit-date" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-serve-type">Serve Type</label>
                        <select id="edit-serve-type" required>
                            <option value="Pendulum">Pendulum</option>
                            <option value="Chop">Chop</option>
                            <option value="Tomahawk">Tomahawk</option>
                            <option value="Forehand">Forehand</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-stroke-type">Stroke Type</label>
                        <select id="edit-stroke-type" required>
                            <option value="Backhand loop">Backhand loop</option>
                            <option value="Forehand loop">Forehand loop</option>
                            <option value="Backhand Serve">Backhand Serve</option>
                            <option value="Forehand Serve">Forehand Serve</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-focus">Focus</label>
                        <select id="edit-focus" required>
                            <option value="Right">Right</option>
                            <option value="Left">Left</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-success-rate">Success Rate (%)</label>
                        <input type="range" id="edit-success-rate" min="0" max="100" step="1">
                        <span id="success-rate-value">50%</span>
                    </div>
                    <div class="form-group">
                        <label for="edit-points">Points</label>
                        <input type="number" id="edit-points" min="0" max="21" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-modal">Cancel</button>
                <button class="btn btn-danger" id="delete-record-btn">Delete</button>
                <button class="btn btn-primary" id="save-record-btn">Save Changes</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const successRateInput = form.querySelector('#edit-success-rate');
    const successRateValue = form.querySelector('#success-rate-value');
    
    successRateInput.addEventListener('input', () => {
        successRateValue.textContent = `${successRateInput.value}%`;
    });
    
    form.querySelector('#save-record-btn').addEventListener('click', saveRecordChanges);
    form.querySelector('#delete-record-btn').addEventListener('click', () => {
        const recordId = parseInt(form.querySelector('#edit-record-id').value);
        deleteRecord(recordId);
        App.utils.fadeOut(form);
    });
    
    form.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            App.utils.fadeOut(form);
        });
    });
    
    form.addEventListener('click', (e) => {
        if (e.target === form) {
            App.utils.fadeOut(form);
        }
    });
    
    document.body.appendChild(form);
    return form;
}

function saveRecordChanges() {
    const form = document.getElementById('edit-record-form');
    if (!form) return;
    
    const recordId = parseInt(form.querySelector('#edit-record-id').value);
    const recordIndex = App.state.dataset.findIndex(item => item.id === recordId);
    
    if (recordIndex === -1) return;
    
    // Update record
    App.state.dataset[recordIndex] = {
        id: recordId,
        date: form.querySelector('#edit-date').value,
        serveType: form.querySelector('#edit-serve-type').value,
        strokeType: form.querySelector('#edit-stroke-type').value,
        focus: form.querySelector('#edit-focus').value,
        successRate: parseInt(form.querySelector('#edit-success-rate').value),
        points: parseInt(form.querySelector('#edit-points').value)
    };
    
    // Update dashboard
    loadDashboardData();
    refreshDashboardVisualizations();
    
    App.utils.fadeOut(form);
    App.showNotification('Record updated successfully', 'success');
}

// Delete record
function deleteRecord(recordId) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    const recordIndex = App.state.dataset.findIndex(item => item.id === recordId);
    if (recordIndex === -1) return;
    
    // Remove record
    App.state.dataset.splice(recordIndex, 1);
    
    // Update dashboard
    loadDashboardData();
    refreshDashboardVisualizations();
    
    App.showNotification('Record deleted successfully', 'success');
}

// Show add record form
function showAddRecordForm() {
    const form = document.getElementById('add-record-form') || createAddRecordForm();
    
    // Reset form
    form.querySelector('#add-date').value = new Date().toISOString().split('T')[0];
    form.querySelector('#add-serve-type').value = 'Pendulum';
    form.querySelector('#add-stroke-type').value = 'Backhand loop';
    form.querySelector('#add-focus').value = 'Right';
    form.querySelector('#add-success-rate').value = '50';
    form.querySelector('#success-rate-value').textContent = '50%';
    form.querySelector('#add-points').value = '0';
    
    App.utils.fadeIn(form);
}

function createAddRecordForm() {
    const form = document.createElement('div');
    form.id = 'add-record-form';
    form.className = 'modal';
    form.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Add New Record</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="record-add-form">
                    <div class="form-group">
                        <label for="add-date">Date</label>
                        <input type="date" id="add-date" required>
                    </div>
                    <div class="form-group">
                        <label for="add-serve-type">Serve Type</label>
                        <select id="add-serve-type" required>
                            <option value="Pendulum">Pendulum</option>
                            <option value="Chop">Chop</option>
                            <option value="Tomahawk">Tomahawk</option>
                            <option value="Forehand">Forehand</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="add-stroke-type">Stroke Type</label>
                        <select id="add-stroke-type" required>
                            <option value="Backhand loop">Backhand loop</option>
                            <option value="Forehand loop">Forehand loop</option>
                            <option value="Backhand Serve">Backhand Serve</option>
                            <option value="Forehand Serve">Forehand Serve</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="add-focus">Focus</label>
                        <select id="add-focus" required>
                            <option value="Right">Right</option>
                            <option value="Left">Left</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="add-success-rate">Success Rate (%)</label>
                        <input type="range" id="add-success-rate" min="0" max="100" step="1" value="50">
                        <span id="success-rate-value">50%</span>
                    </div>
                    <div class="form-group">
                        <label for="add-points">Points</label>
                        <input type="number" id="add-points" min="0" max="21" value="0" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-modal">Cancel</button>
                <button class="btn btn-primary" id="add-record-btn">Add Record</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const successRateInput = form.querySelector('#add-success-rate');
    const successRateValue = form.querySelector('#success-rate-value');
    
    successRateInput.addEventListener('input', () => {
        successRateValue.textContent = `${successRateInput.value}%`;
    });
    
    form.querySelector('#add-record-btn').addEventListener('click', addNewRecord);
    
    form.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            App.utils.fadeOut(form);
        });
    });
    
    form.addEventListener('click', (e) => {
        if (e.target === form) {
            App.utils.fadeOut(form);
        }
    });
    
    document.body.appendChild(form);
    return form;
}

function addNewRecord() {
    const form = document.getElementById('add-record-form');
    if (!form) return;
    
    // Generate new ID
    const newId = App.state.dataset.length > 0 ? 
        Math.max(...App.state.dataset.map(item => item.id)) + 1 : 1;
    
    // Create new record
    const newRecord = {
        id: newId,
        date: form.querySelector('#add-date').value,
        serveType: form.querySelector('#add-serve-type').value,
        strokeType: form.querySelector('#add-stroke-type').value,
        focus: form.querySelector('#add-focus').value,
        successRate: parseInt(form.querySelector('#add-success-rate').value),
        points: parseInt(form.querySelector('#add-points').value)
    };
    
    // Add to dataset
    App.state.dataset.push(newRecord);
    
    // Update dashboard
    loadDashboardData();
    refreshDashboardVisualizations();
    
    App.utils.fadeOut(form);
    App.showNotification('Record added successfully', 'success');
}

// Export dashboard data
function exportDashboardData() {
    const format = App.state.userPreferences.exportFormat;
    const data = DashboardState.filteredData;
    
    let dataStr;
    let mimeType;
    let extension;
    
    switch(format) {
        case 'csv':
            dataStr = convertToCSV(data);
            mimeType = 'text/csv';
            extension = 'csv';
            break;
        case 'json':
        default:
            dataStr = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            extension = 'json';
    }
    
    const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(dataStr)}`;
    const fileName = `dashboard-export-${new Date().toISOString().split('T')[0]}.${extension}`;
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', fileName);
    link.click();
    
    App.showNotification(`Dashboard data exported as ${format.toUpperCase()}`, 'success');
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ];
    
    return csvRows.join('\n');
}

// Initialize comparison tools
function initializeComparisonTools() {
    const comparisonContainer = document.getElementById('comparison-tools');
    if (!comparisonContainer) return;
    
    // Initialize comparison functionality
    comparisonContainer.innerHTML = `
        <div class="comparison-controls">
            <h3>Compare Statistics</h3>
            <div class="comparison-options">
                <select id="compare-metric">
                    <option value="successRate">Success Rate</option>
                    <option value="points">Points</option>
                    <option value="serveType">Serve Type</option>
                    <option value="strokeType">Stroke Type</option>
                </select>
                <select id="compare-period">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                </select>
                <button id="run-comparison" class="btn btn-primary">Compare</button>
            </div>
        </div>
        <div id="comparison-results" class="comparison-results"></div>
    `;
    
    document.getElementById('run-comparison').addEventListener('click', runComparison);
}

function runComparison() {
    const metric = document.getElementById('compare-metric').value;
    const period = document.getElementById('compare-period').value;
    
    const results = performComparison(metric, period);
    displayComparisonResults(results, metric, period);
}

function performComparison(metric, period) {
    // This would perform actual comparison logic
    // For now, return sample comparison data
    return {
        metric,
        period,
        data: [
            { label: 'Current', value: 75 },
            { label: 'Previous', value: 68 },
            { label: 'Average', value: 72 }
        ],
        change: '+7%',
        trend: 'improving'
    };
}

function displayComparisonResults(results, metric, period) {
    const resultsContainer = document.getElementById('comparison-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <h4>Comparison Results: ${metric} (${period})</h4>
        <div class="comparison-cards">
            ${results.data.map(item => `
                <div class="comparison-card">
                    <div class="comparison-label">${item.label}</div>
                    <div class="comparison-value">${item.value}${metric === 'successRate' ? '%' : ''}</div>
                </div>
            `).join('')}
        </div>
        <div class="comparison-summary">
            <p>Change: <span class="trend-${results.trend}">${results.change}</span></p>
            <p>Trend: ${results.trend}</p>
        </div>
    `;
}

// Update dashboard UI
function updateDashboardUI() {
    // Update theme
    updateDashboardTheme();
    
    // Update accessibility mode
    updateDashboardAccessibility();
    
    // Update time period display
    updateTimePeriodDisplay();
}

function updateDashboardTheme() {
    const theme = App.state.userPreferences.chartTheme;
    document.querySelectorAll('.chart-container').forEach(container => {
        container.setAttribute('data-theme', theme);
    });
}

function updateDashboardAccessibility() {
    const enabled = App.state.userPreferences.accessibilityMode;
    document.querySelectorAll('.dashboard-component').forEach(component => {
        component.classList.toggle('high-contrast', enabled);
    });
}

function updateTimePeriodDisplay() {
    const period = App.state.userPreferences.timePeriod;
    const periodDisplay = document.getElementById('current-period');
    if (periodDisplay) {
        periodDisplay.textContent = `Current period: ${period}`;
    }
}

// Render all dashboard visualizations
function renderDashboardVisualizations() {
    // Render all charts
    if (DashboardState.chartInstances.serveType) renderServeTypeChart();
    if (DashboardState.chartInstances.strokeAnalysis) renderStrokeAnalysisChart();
    if (DashboardState.chartInstances.focusAnalysis) renderFocusAnalysisChart();
    
    // Render data table
    renderDataTable();
    
    // Update statistics
    updateStatisticsDisplay();
}

// Dashboard-specific utility functions
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function formatNumber(num) {
    return num.toLocaleString();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Export dashboard functionality
window.Dashboard = {
    state: DashboardState,
    refresh: refreshDashboardVisualizations,
    applyFilters: applyFilters,
    exportData: exportDashboardData,
    addRecord: showAddRecordForm,
    utils: {
        animateValue: animateValue,
        formatNumber: formatNumber,
        formatDate: formatDate
    }
};