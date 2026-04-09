// main.js - Core application logic, initialization, and shared utilities for Table Tennis Statistics Dashboard

// Application state and configuration
const AppState = {
    initialized: false,
    currentPage: 'dashboard',
    userPreferences: {
        chartTheme: 'default',
        accessibilityMode: false,
        timePeriod: 'all',
        exportFormat: 'csv'
    },
    dataset: [],
    activeFilters: {}
};

// DOM ready initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupGlobalEventListeners();
    loadUserPreferences();
});

// Core application initialization
function initializeApp() {
    console.log('Initializing Table Tennis Statistics Dashboard...');
    
    // Initialize all dashboard components
    initializeComponents();
    
    // Set up navigation
    setupNavigation();
    
    // Load sample data if no data exists
    if (AppState.dataset.length === 0) {
        loadSampleData();
    }
    
    // Update UI state
    updateUI();
    
    AppState.initialized = true;
    console.log('Dashboard initialized successfully');
}

// Initialize all dashboard components
function initializeComponents() {
    const components = [
        'file_upload_component',
        'statistics_summary_table',
        'manual_data_entry_form',
        'data_validation_feedback',
        'data_export_options',
        'user_profile_settings',
        'upload_progress_indicator',
        'search_and_filter_controls',
        'dataset_statistics_overview',
        'stroke_analysis_bar_graph',
        'edit_delete_actions',
        'data_refresh_settings',
        'dashboard_navigation_menu',
        'data_upload_quick_action',
        'sample_data_template_download',
        'export_preferences',
        'expandable_chart_visualizations',
        'drilldown_statistics',
        'analysis_export_options',
        'serve_type_pie_chart',
        'focus_analysis_pie_chart',
        'datatable_with_records',
        'accessibility_options',
        'chart_color_scheme_selector',
        'time_period_selector',
        'comparison_tools'
    ];
    
    components.forEach(component => {
        const element = document.getElementById(component);
        if (element) {
            element.classList.add('initialized');
            fadeIn(element);
        }
    });
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Navigation menu
    document.addEventListener('click', (e) => {
        if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
            e.preventDefault();
            const page = e.target.dataset.page || e.target.closest('.nav-link').dataset.page;
            navigateToPage(page);
        }
    });
    
    // Quick action buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('.quick-action') || e.target.closest('.quick-action')) {
            const action = e.target.dataset.action || e.target.closest('.quick-action').dataset.action;
            handleQuickAction(action);
        }
    });
    
    // Data refresh
    document.addEventListener('dataUpdated', () => {
        refreshDataVisualizations();
    });
    
    // Window resize for responsive charts
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            refreshDataVisualizations();
        }, 250);
    });
}

// Navigation between pages
function navigateToPage(pageName) {
    if (AppState.currentPage === pageName) return;
    
    // Animate page transition
    const currentPage = document.querySelector(`[data-page="${AppState.currentPage}"]`);
    const nextPage = document.querySelector(`[data-page="${pageName}"]`);
    
    if (currentPage) fadeOut(currentPage);
    if (nextPage) {
        fadeIn(nextPage);
        AppState.currentPage = pageName;
        updateActiveNavigation();
        
        // Load page-specific data
        loadPageData(pageName);
    }
}

// Update active navigation state
function updateActiveNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === AppState.currentPage) {
            link.classList.add('active');
            slideIndicator(link);
        }
    });
}

// Handle quick actions
function handleQuickAction(action) {
    switch(action) {
        case 'upload':
            triggerFileUpload();
            break;
        case 'export':
            exportData();
            break;
        case 'refresh':
            refreshData();
            break;
        case 'settings':
            openSettings();
            break;
        default:
            console.log(`Quick action "${action}" triggered`);
    }
}

// Data management utilities
function loadSampleData() {
    // Sample table tennis data
    AppState.dataset = [
        { id: 1, date: '2024-01-15', serveType: 'Pendulum', strokeType: 'Forehand Serve', focus: 'Right', successRate: 85, points: 11 },
        { id: 2, date: '2024-01-15', serveType: 'Chop', strokeType: 'Backhand Serve', focus: 'Left', successRate: 72, points: 9 },
        { id: 3, date: '2024-01-16', serveType: 'Tomahawk', strokeType: 'Forehand Loop', focus: 'Right', successRate: 91, points: 15 },
        { id: 4, date: '2024-01-16', serveType: 'Forehand', strokeType: 'Backhand Loop', focus: 'Left', successRate: 68, points: 8 },
        { id: 5, date: '2024-01-17', serveType: 'Pendulum', strokeType: 'Forehand Serve', focus: 'Right', successRate: 88, points: 12 }
    ];
    
    // Dispatch data loaded event
    document.dispatchEvent(new CustomEvent('dataLoaded', { detail: { dataset: AppState.dataset } }));
}

function refreshData() {
    showLoadingIndicator();
    
    // Simulate data refresh
    setTimeout(() => {
        // In a real app, this would fetch from API
        document.dispatchEvent(new CustomEvent('dataUpdated'));
        hideLoadingIndicator();
        showNotification('Data refreshed successfully', 'success');
    }, 1000);
}

function exportData() {
    const format = AppState.userPreferences.exportFormat;
    const dataStr = JSON.stringify(AppState.dataset, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `table-tennis-stats-${new Date().toISOString().split('T')[0]}.${format}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification(`Data exported as ${format.toUpperCase()}`, 'success');
}

// UI update functions
function updateUI() {
    // Update all UI components based on current state
    updateChartThemes();
    updateAccessibilityMode();
    updateTimePeriodFilters();
}

function updateChartThemes() {
    const theme = AppState.userPreferences.chartTheme;
    document.documentElement.setAttribute('data-chart-theme', theme);
    document.dispatchEvent(new CustomEvent('chartThemeChanged', { detail: { theme } }));
}

function updateAccessibilityMode() {
    const enabled = AppState.userPreferences.accessibilityMode;
    document.body.classList.toggle('accessibility-mode', enabled);
    
    if (enabled) {
        document.dispatchEvent(new CustomEvent('accessibilityEnabled'));
    }
}

function updateTimePeriodFilters() {
    const period = AppState.userPreferences.timePeriod;
    document.dispatchEvent(new CustomEvent('timePeriodChanged', { detail: { period } }));
}

// Animation utilities
function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.max(1 - progress / duration, 0);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

function slideIndicator(element) {
    const indicator = document.querySelector('.nav-indicator');
    if (indicator && element) {
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement.getBoundingClientRect();
        
        indicator.style.width = `${rect.width}px`;
        indicator.style.left = `${rect.left - parentRect.left}px`;
        indicator.style.opacity = '1';
    }
}

// Loading and notification utilities
function showLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator') || createLoadingIndicator();
    fadeIn(indicator);
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) fadeOut(indicator);
}

function createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loading-indicator';
    indicator.className = 'loading-indicator';
    indicator.innerHTML = `
        <div class="spinner"></div>
        <span>Loading...</span>
    `;
    document.body.appendChild(indicator);
    return indicator;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    notification.style.transform = 'translateY(-100%)';
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// User preferences management
function loadUserPreferences() {
    const savedPrefs = localStorage.getItem('ttDashboardPrefs');
    if (savedPrefs) {
        try {
            AppState.userPreferences = { ...AppState.userPreferences, ...JSON.parse(savedPrefs) };
        } catch (e) {
            console.error('Error loading user preferences:', e);
        }
    }
}

function saveUserPreferences() {
    localStorage.setItem('ttDashboardPrefs', JSON.stringify(AppState.userPreferences));
}

function updateUserPreference(key, value) {
    AppState.userPreferences[key] = value;
    saveUserPreferences();
    updateUI();
}

// Data visualization refresh
function refreshDataVisualizations() {
    // Trigger refresh for all chart components
    const chartEvents = [
        'serve_type_pie_chart',
        'stroke_analysis_bar_graph',
        'focus_analysis_pie_chart',
        'expandable_chart_visualizations',
        'drilldown_statistics'
    ];
    
    chartEvents.forEach(chartId => {
        const element = document.getElementById(chartId);
        if (element) {
            element.dispatchEvent(new CustomEvent('refreshChart'));
        }
    });
}

// Page-specific data loading
function loadPageData(pageName) {
    switch(pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'analysis':
            loadAnalysisData();
            break;
        case 'upload':
            loadUploadData();
            break;
        case 'settings':
            loadSettingsData();
            break;
        case 'export':
            loadExportData();
            break;
    }
}

function loadDashboardData() {
    // Dashboard-specific initialization
    document.dispatchEvent(new CustomEvent('dashboardLoaded'));
}

function loadAnalysisData() {
    // Analysis-specific initialization
    document.dispatchEvent(new CustomEvent('analysisLoaded'));
}

function loadUploadData() {
    // Upload-specific initialization
    document.dispatchEvent(new CustomEvent('uploadLoaded'));
}

function loadSettingsData() {
    // Settings-specific initialization
    document.dispatchEvent(new CustomEvent('settingsLoaded'));
}

function loadExportData() {
    // Export-specific initialization
    document.dispatchEvent(new CustomEvent('exportLoaded'));
}

// File upload trigger
function triggerFileUpload() {
    const fileInput = document.getElementById('file-upload-input') || createFileInput();
    fileInput.click();
}

function createFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'file-upload-input';
    input.accept = '.csv,.json,.xlsx';
    input.style.display = 'none';
    
    input.addEventListener('change', handleFileUpload);
    document.body.appendChild(input);
    return input;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoadingIndicator();
    showNotification(`Uploading ${file.name}...`, 'info');
    
    // Simulate upload processing
    setTimeout(() => {
        // In real app, process the file here
        hideLoadingIndicator();
        showNotification('File uploaded successfully', 'success');
        document.dispatchEvent(new CustomEvent('fileUploaded', { detail: { file } }));
    }, 1500);
}

// Settings modal
function openSettings() {
    const modal = document.getElementById('settings-modal') || createSettingsModal();
    fadeIn(modal);
}

function createSettingsModal() {
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Settings</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Settings content would be populated by settings component -->
            </div>
        </div>
    `;
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        fadeOut(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fadeOut(modal);
        }
    });
    
    document.body.appendChild(modal);
    return modal;
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Public API for other modules
window.App = {
    state: AppState,
    navigateTo: navigateToPage,
    refreshData: refreshData,
    exportData: exportData,
    updatePreference: updateUserPreference,
    showNotification: showNotification,
    utils: {
        debounce: debounce,
        throttle: throttle,
        fadeIn: fadeIn,
        fadeOut: fadeOut
    }
};

// Export for module usage (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.App;
}