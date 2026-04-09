// data_management.js - Data management and manipulation functionality for Table Tennis Statistics Dashboard

// Data management state and configuration
const DataManagementState = {
    currentDataset: [],
    datasetHistory: [],
    historyIndex: -1,
    selectedRecords: new Set(),
    bulkOperations: [],
    filters: {},
    sortConfig: null,
    dataTransformations: [],
    backupPoints: [],
    autoSaveEnabled: true,
    autoSaveInterval: null
};

// Initialize data management when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeDataManagement();
});

// Core data management initialization
function initializeDataManagement() {
    console.log('Initializing Data Management Module...');
    
    // Load current dataset from app state
    DataManagementState.currentDataset = [...App.state.dataset];
    
    // Initialize dataset history
    initializeDatasetHistory();
    
    // Initialize data management components
    initializeDataManagementComponents();
    
    // Set up event listeners
    setupDataManagementEventListeners();
    
    // Start auto-save if enabled
    if (DataManagementState.autoSaveEnabled) {
        startAutoSave();
    }
    
    console.log('Data Management Module initialized successfully');
}

// Initialize dataset history
function initializeDatasetHistory() {
    // Save initial state
    saveToHistory('Initial dataset');
    DataManagementState.backupPoints.push({
        timestamp: new Date().toISOString(),
        description: 'Initial backup',
        data: JSON.parse(JSON.stringify(DataManagementState.currentDataset))
    });
}

// Initialize all data management components
function initializeDataManagementComponents() {
    // Initialize edit/delete actions
    initializeEditDeleteActions();
    
    // Initialize data refresh settings
    initializeDataRefreshSettings();
    
    // Initialize export preferences
    initializeExportPreferences();
    
    // Initialize drilldown statistics
    initializeDrilldownStatistics();
    
    // Initialize analysis export options
    initializeAnalysisExportOptions();
    
    // Initialize user profile settings
    initializeUserProfileSettings();
    
    // Initialize accessibility options
    initializeAccessibilityOptions();
    
    // Initialize chart color scheme selector
    initializeChartColorSchemeSelector();
    
    // Initialize time period selector
    initializeTimePeriodSelector();
}

// Setup data management event listeners
function setupDataManagementEventListeners() {
    // Data refresh events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.refresh-action')) {
            handleDataRefresh(e.target.dataset.action);
        }
    });
    
    // Bulk selection events
    document.addEventListener('change', (e) => {
        if (e.target.matches('.record-selector')) {
            handleRecordSelection(e.target);
        }
    });
    
    // Bulk action events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.bulk-action')) {
            handleBulkAction(e.target.dataset.action);
        }
    });
    
    // Undo/redo events
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undoLastAction();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            redoLastAction();
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z') {
            e.preventDefault();
            redoLastAction();
        }
    });
    
    // Data transformation events
    document.addEventListener('submit', (e) => {
        if (e.target.matches('.data-transform-form')) {
            e.preventDefault();
            applyDataTransformation(e.target);
        }
    });
    
    // Export events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.analysis-export')) {
            handleAnalysisExport(e.target.dataset.format);
        }
    });
    
    // Settings change events
    document.addEventListener('change', (e) => {
        if (e.target.matches('.setting-control')) {
            handleSettingChange(e.target);
        }
    });
    
    // Data backup events
    document.addEventListener('click', (e) => {
        if (e.target.matches('.backup-action')) {
            handleBackupAction(e.target.dataset.action);
        }
    });
}

// Initialize edit/delete actions
function initializeEditDeleteActions() {
    const actionsContainer = document.getElementById('edit_delete_actions');
    if (!actionsContainer) return;
    
    actionsContainer.innerHTML = `
        <div class="edit-delete-actions">
            <h3>Record Actions</h3>
            <div class="action-buttons">
                <button class="btn btn-primary edit-action" data-action="edit-selected">
                    <i class="edit-icon"></i>
                    Edit Selected
                </button>
                <button class="btn btn-danger delete-action" data-action="delete-selected">
                    <i class="delete-icon"></i>
                    Delete Selected
                </button>
                <button class="btn btn-secondary duplicate-action" data-action="duplicate-selected">
                    <i class="duplicate-icon"></i>
                    Duplicate Selected
                </button>
            </div>
            <div class="selection-info">
                <span id="selected-count">0 records selected</span>
                <button class="btn btn-sm btn-outline" id="select-all">Select All</button>
                <button class="btn btn-sm btn-outline" id="clear-selection">Clear Selection</button>
            </div>
            <div class="bulk-edit-form" id="bulk-edit-form" style="display: none;">
                <h4>Bulk Edit</h4>
                <form class="bulk-edit-controls">
                    <div class="form-group">
                        <label for="bulk-field">Field to Update</label>
                        <select id="bulk-field">
                            <option value="serveType">Serve Type</option>
                            <option value="strokeType">Stroke Type</option>
                            <option value="focus">Focus</option>
                            <option value="successRate">Success Rate</option>
                            <option value="points">Points</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="bulk-value">New Value</label>
                        <input type="text" id="bulk-value" placeholder="Enter new value...">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-bulk-edit">Cancel</button>
                        <button type="submit" class="btn btn-primary" id="apply-bulk-edit">Apply to Selected</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add event listeners
    actionsContainer.querySelector('#select-all').addEventListener('click', selectAllRecords);
    actionsContainer.querySelector('#clear-selection').addEventListener('click', clearSelection);
    actionsContainer.querySelector('.edit-action').addEventListener('click', editSelectedRecords);
    actionsContainer.querySelector('.delete-action').addEventListener('click', deleteSelectedRecords);
    actionsContainer.querySelector('.duplicate-action').addEventListener('click', duplicateSelectedRecords);
    actionsContainer.querySelector('#cancel-bulk-edit').addEventListener('click', () => {
        actionsContainer.querySelector('#bulk-edit-form').style.display = 'none';
    });
    actionsContainer.querySelector('#apply-bulk-edit').addEventListener('click', applyBulkEdit);
}

// Initialize data refresh settings
function initializeDataRefreshSettings() {
    const refreshContainer = document.getElementById('data_refresh_settings');
    if (!refreshContainer) return;
    
    refreshContainer.innerHTML = `
        <div class="refresh-settings">
            <h3>Data Refresh Settings</h3>
            <div class="refresh-controls">
                <div class="form-group">
                    <label for="auto-refresh-interval">Auto-refresh Interval</label>
                    <select id="auto-refresh-interval">
                        <option value="0">Disabled</option>
                        <option value="30000">30 seconds</option>
                        <option value="60000">1 minute</option>
                        <option value="300000">5 minutes</option>
                        <option value="900000">15 minutes</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="refresh-on-focus">Refresh on Window Focus</label>
                    <input type="checkbox" id="refresh-on-focus" checked>
                </div>
                <div class="form-group">
                    <label for="cache-duration">Cache Duration</label>
                    <select id="cache-duration">
                        <option value="0">No caching</option>
                        <option value="300000">5 minutes</option>
                        <option value="1800000">30 minutes</option>
                        <option value="3600000">1 hour</option>
                        <option value="86400000">1 day</option>
                    </select>
                </div>
            </div>
            <div class="refresh-actions">
                <button class="btn btn-primary refresh-action" data-action="manual">
                    <i class="refresh-icon"></i>
                    Refresh Now
                </button>
                <button class="btn btn-secondary refresh-action" data-action="clear-cache">
                    Clear Cache
                </button>
            </div>
            <div class="refresh-history">
                <h4>Refresh History</h4>
                <div class="history-list" id="refresh-history-list">
                    <p class="empty-message">No refresh history available</p>
                </div>
            </div>
        </div>
    `;
    
    // Load saved settings
    loadRefreshSettings();
}

// Initialize export preferences
function initializeExportPreferences() {
    const exportContainer = document.getElementById('export_preferences');
    if (!exportContainer) return;
    
    exportContainer.innerHTML = `
        <div class="export-preferences">
            <h3>Export Preferences</h3>
            <div class="preference-sections">
                <div class="preference-section">
                    <h4>Default Export Format</h4>
                    <div class="format-options">
                        <label class="format-option">
                            <input type="radio" name="export-format" value="csv" checked>
                            <span>CSV</span>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="export-format" value="json">
                            <span>JSON</span>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="export-format" value="xlsx">
                            <span>Excel</span>
                        </label>
                        <label class="format-option">
                            <input type="radio" name="export-format" value="pdf">
                            <span>PDF</span>
                        </label>
                    </div>
                </div>
                
                <div class="preference-section">
                    <h4>Export Options</h4>
                    <div class="option-checkboxes">
                        <label class="option-checkbox">
                            <input type="checkbox" id="include-metadata" checked>
                            <span>Include metadata</span>
                        </label>
                        <label class="option-checkbox">
                            <input type="checkbox" id="include-charts" checked>
                            <span>Include charts</span>
                        </label>
                        <label class="option-checkbox">
                            <input type="checkbox" id="compress-files">
                            <span>Compress files (ZIP)</span>
                        </label>
                        <label class="option-checkbox">
                            <input type="checkbox" id="timestamp-filenames" checked>
                            <span>Add timestamp to filenames</span>
                        </label>
                    </div>
                </div>
                
                <div class="preference-section">
                    <h4>Data Range</h4>
                    <div class="range-options">
                        <label class="range-option">
                            <input type="radio" name="export-range" value="all" checked>
                            <span>All data</span>
                        </label>
                        <label class="range-option">
                            <input type="radio" name="export-range" value="filtered">
                            <span>Currently filtered data</span>
                        </label>
                        <label class="range-option">
                            <input type="radio" name="export-range" value="selected">
                            <span>Selected records only</span>
                        </label>
                        <label class="range-option">
                            <input type="radio" name="export-range" value="custom">
                            <span>Custom range</span>
                        </label>
                    </div>
                    <div class="custom-range" id="custom-range" style="display: none;">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="start-date">Start Date</label>
                                <input type="date" id="start-date">
                            </div>
                            <div class="form-group">
                                <label for="end-date">End Date</label>
                                <input type="date" id="end-date">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="export-actions">
                <button class="btn btn-primary" id="save-export-preferences">
                    Save Preferences
                </button>
                <button class="btn btn-secondary" id="reset-export-preferences">
                    Reset to Defaults
                </button>
            </div>
        </div>
    `;
    
    // Load saved preferences
    loadExportPreferences();
    
    // Add event listeners
    exportContainer.querySelector('input[name="export-range"][value="custom"]').addEventListener('change', (e) => {
        exportContainer.querySelector('#custom-range').style.display = e.target.checked ? 'block' : 'none';
    });
    
    exportContainer.querySelector('#save-export-preferences').addEventListener('click', saveExportPreferences);
    exportContainer.querySelector('#reset-export-preferences').addEventListener('click', resetExportPreferences);
}

// Initialize drilldown statistics
function initializeDrilldownStatistics() {
    const drilldownContainer = document.getElementById('drilldown_statistics');
    if (!drilldownContainer) return;
    
    drilldownContainer.innerHTML = `
        <div class="drilldown-statistics">
            <h3>Drilldown Statistics</h3>
            <div class="drilldown-controls">
                <div class="form-group">
                    <label for="drilldown-metric">Select Metric</label>
                    <select id="drilldown-metric">
                        <option value="successRate">Success Rate</option>
                        <option value="points">Points</option>
                        <option value="serveType">Serve Type Distribution</option>
                        <option value="strokeType">Stroke Type Distribution</option>
                        <option value="focus">Focus Distribution</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="drilldown-dimension">Group By</label>
                    <select id="drilldown-dimension">
                        <option value="date">Date</option>
                        <option value="serveType">Serve Type</option>
                        <option value="strokeType">Stroke Type</option>
                        <option value="focus">Focus</option>
                        <option value="hourOfDay">Hour of Day</option>
                        <option value="dayOfWeek">Day of Week</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="generate-drilldown">
                    <i class="analyze-icon"></i>
                    Generate Analysis
                </button>
            </div>
            
            <div class="drilldown-results" id="drilldown-results">
                <div class="results-placeholder">
                    <i class="chart-icon"></i>
                    <p>Select metrics and click "Generate Analysis" to view detailed statistics</p>
                </div>
            </div>
            
            <div class="drilldown-export" id="drilldown-export" style="display: none;">
                <h4>Export Analysis</h4>
                <div class="export-options">
                    <button class="btn btn-outline analysis-export" data-format="csv">
                        Export as CSV
                    </button>
                    <button class="btn btn-outline analysis-export" data-format="json">
                        Export as JSON
                    </button>
                    <button class="btn btn-outline analysis-export" data-format="chart">
                        Export Chart Image
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener
    drilldownContainer.querySelector('#generate-drilldown').addEventListener('click', generateDrilldownStatistics);
}

// Initialize analysis export options
function initializeAnalysisExportOptions() {
    const exportContainer = document.getElementById('analysis_export_options');
    if (!exportContainer) return;
    
    exportContainer.innerHTML = `
        <div class="analysis-export-options">
            <h3>Analysis Export</h3>
            <div class="export-types">
                <div class="export-type">
                    <h4>Data Export</h4>
                    <p>Export raw or processed data in various formats</p>
                    <div class="export-buttons">
                        <button class="btn btn-outline analysis-export" data-format="raw-csv">
                            Raw Data (CSV)
                        </button>
                        <button class="btn btn-outline analysis-export" data-format="processed-json">
                            Processed Data (JSON)
                        </button>
                        <button class="btn btn-outline analysis-export" data-format="summary-pdf">
                            Summary Report (PDF)
                        </button>
                    </div>
                </div>
                
                <div class="export-type">
                    <h4>Visualization Export</h4>
                    <p>Export charts and graphs as images or interactive files</p>
                    <div class="export-buttons">
                        <button class="btn btn-outline analysis-export" data-format="chart-png">
                            Charts (PNG)
                        </button>
                        <button class="btn btn-outline analysis-export" data-format="chart-svg">
                            Charts (SVG)
                        </button>
                        <button class="btn btn-outline analysis-export" data-format="interactive-html">
                            Interactive Dashboard (HTML)
                        </button>
                    </div>
                </div>
                
                <div class="export-type">
                    <h4>Batch Export</h4>
                    <p>Export multiple items at once with custom settings</p>
                    <div class="batch-controls">
                        <div class="option-checkboxes">
                            <label class="option-checkbox">
                                <input type="checkbox" class="batch-option" value="data" checked>
                                <span>Include data</span>
                            </label>
                            <label class="option-checkbox">
                                <input type="checkbox" class="batch-option" value="charts" checked>
                                <span>Include charts</span>
                            </label>
                            <label class="option-checkbox">
                                <input type="checkbox" class="batch-option" value="statistics">
                                <span>Include statistics</span>
                            </label>
                        </div>
                        <button class="btn btn-primary" id="batch-export">
                            <i class="export-icon"></i>
                            Create Batch Export
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="export-history">
                <h4>Recent Exports</h4>
                <div class="history-list" id="export-history-list">
                    <p class="empty-message">No recent exports</p>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener
    exportContainer.querySelector('#batch-export').addEventListener('click', createBatchExport);
}

// Initialize user profile settings
function initializeUserProfileSettings() {
    const profileContainer = document.getElementById('user_profile_settings');
    if (!profileContainer) return;
    
    profileContainer.innerHTML = `
        <div class="user-profile-settings">
            <h3>User Profile Settings</h3>
            <div class="profile-form">
                <div class="form-section">
                    <h4>Personal Information</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="user-name">Name</label>
                            <input type="text" id="user-name" placeholder="Enter your name">
                        </div>
                        <div class="form-group">
                            <label for="user-email">Email</label>
                            <input type="email" id="user-email" placeholder="Enter your email">
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>Dashboard Preferences</h4>
                    <div class="preference-options">
                        <div class="form-group">
                            <label for="default-view">Default Dashboard View</label>
                            <select id="default-view">
                                <option value="overview">Overview</option>
                                <option value="detailed">Detailed</option>
                                <option value="comparison">Comparison</option>
                                <option value="trends">Trends</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="records-per-page">Records Per Page</label>
                            <select id="records-per-page">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>Data Management</h4>
                    <div class="data-options">
                        <label class="option-checkbox">
                            <input type="checkbox" id="auto-save" checked>
                            <span>Enable auto-save</span>
                        </label>
                        <label class="option-checkbox">
                            <input type="checkbox" id="confirm-delete" checked>
                            <span>Confirm before deleting</span>
                        </label>
                        <label class="option-checkbox">
                            <input type="checkbox" id="backup-enabled" checked>
                            <span>Enable automatic backups</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4>Notification Preferences</h4>
                    <div class="notification-options">
                        <label class="option-checkbox">
                            <input type="checkbox" id="notify-updates" checked>
                            <span>Notify on data updates</span>
                        </label>
                        <label class="option-checkbox">
                            <input type="checkbox" id="notify-errors">
                            <span>Notify on data errors</span>
                        </label>
                        <label class="option-checkbox">
                            <input type="checkbox" id="notify-exports" checked>
                            <span>Notify on export completion</span>
                        </label>
                    </div>
                </div>
                
                <div class="profile-actions">
                    <button class="btn btn-primary" id="save-profile">
                        Save Profile Settings
                    </button>
                    <button class="btn btn-secondary" id="reset-profile">
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Load profile settings
    loadProfileSettings();
    
    // Add event listeners
    profileContainer.querySelector('#save-profile').addEventListener('click', saveProfileSettings);
    profileContainer.querySelector('#reset-profile').addEventListener('click', resetProfileSettings);
}

// Initialize accessibility options
function initializeAccessibilityOptions() {
    const accessibilityContainer = document.getElementById('accessibility_options');
    if (!accessibilityContainer) return;
    
    accessibilityContainer.innerHTML = `
        <div class="accessibility-options">
            <h3>Accessibility Settings</h3>
            <div class="accessibility-controls">
                <div class="control-group">
                    <h4>Visual Adjustments</h4>
                    <div class="control-options">
                        <label class="control-option">
                            <input type="checkbox" id="high-contrast" class="setting-control">
                            <span>High Contrast Mode</span>
                        </label>
                        <label class="control-option">
                            <input type="checkbox" id="large-text" class="setting-control">
                            <span>Large Text</span>
                        </label>
                        <label class="control-option">
                            <input type="checkbox" id="reduce-motion" class="setting-control">
                            <span>Reduce Motion</span>
                        </label>
                        <label class="control-option">
                            <input type="checkbox" id="color-blind" class="setting-control">
                            <span>Color Blind Friendly</span>
                        </label>
                    </div>
                </div>
                
                <div class="control-group">
                    <h4>Navigation Assistance</h4>
                    <div class="control-options">
                        <label class="control-option">
                            <input type="checkbox" id="keyboard-nav" class="setting-control" checked>
                            <span>Keyboard Navigation</span>
                        </label>
                        <label class="control-option">
                            <input type="checkbox" id="focus-indicators" class="setting-control" checked>
                            <span>Focus Indicators</span>
                        </label>
                        <label class="control-option">
                            <input type="checkbox" id="skip-links" class="setting-control">
                            <span>Skip to Content Links</span>
                        </label>
                    </div>
                </div>
                
                <div class="control-group">
                    <h4>Screen Reader Support</h4>
                    <div class="control-options">
                        <label class="control-option">
                            <input type="checkbox" id="aria-labels" class="setting-control" checked>
                            <span>ARIA Labels</span>
                        </label>
                        <label class="control-option">
                            <input type="checkbox" id="live-regions" class="setting-control">
                            <span>Live Regions for Updates</span>
                        </label>
                    </div>
                </div>
                
                <div class="control-group">
                    <h4>Chart Accessibility</h4>
                    <div class="control-options">
                        <label class="control-option">
                            <input type="checkbox" id="chart-descriptions" class="setting-control" checked>
                            <span>Chart Descriptions</span>
                        </label>
                        <label class="control-option">
                            <input type="checkbox" id="data-tables" class="setting-control">
                            <span>Data Tables for Charts</span>
                        </label>
                        <label class="control-option">
                            <input type="checkbox" id="alt-text" class="setting-control" checked>
                            <span>Alternative Text for Images</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="accessibility-actions">
                <button class="btn btn-primary" id="apply-accessibility">
                    Apply Accessibility Settings
                </button>
                <button class="btn btn-secondary" id="reset-accessibility">
                    Reset to Defaults
                </button>
            </div>
            
            <div class="accessibility-info">
                <p><strong>Tip:</strong> Press <kbd>Alt</kbd> + <kbd>A</kbd> to toggle accessibility mode</p>
            </div>
        </div>
    `;
    
    // Load accessibility settings
    loadAccessibilitySettings();
    
    // Add event listeners
    accessibilityContainer.querySelector('#apply-accessibility').addEventListener('click', applyAccessibilitySettings);
    accessibilityContainer.querySelector('#reset-accessibility').addEventListener('click', resetAccessibilitySettings);
    
    // Keyboard shortcut for accessibility toggle
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            toggleAccessibilityMode();
        }
    });
}

// Initialize chart color scheme selector
function initializeChartColorSchemeSelector() {
    const colorSchemeContainer = document.getElementById('chart_color_scheme_selector');
    if (!colorSchemeContainer) return;
    
    colorSchemeContainer.innerHTML = `
        <div class="color-scheme-selector">
            <h3>Chart Color Schemes</h3>
            <div class="scheme-options">
                <div class="scheme-option" data-scheme="default">
                    <div class="scheme-preview">
                        <div class="color-sample" style="background-color: #4CAF50;"></div>
                        <div class="color-sample" style="background-color: #2196F3;"></div>
                        <div class="color-sample" style="background-color: #FF9800;"></div>
                        <div class="color-sample" style="background-color: #9C27B0;"></div>
                    </div>
                    <span class="scheme-name">Default</span>
                </div>
                
                <div class="scheme-option" data-scheme="pastel">
                    <div class="scheme-preview">
                        <div class="color-sample" style="background-color: #A5D6A7;"></div>
                        <div class="color-sample" style="background-color: #90CAF9;"></div>
                        <div class="color-sample" style="background-color: #FFE082;"></div>
                        <div class="color-sample" style="background-color: #CE93D8;"></div>
                    </div>
                    <span class="scheme-name">Pastel</span>
                </div>
                
                <div class="scheme-option" data-scheme="vibrant">
                    <div class="scheme-preview">
                        <div class="color-sample" style="background-color: #00E676;"></div>
                        <div class="color-sample" style="background-color: #00B0FF;"></div>
                        <div class="color-sample" style="background-color: #FF9100;"></div>
                        <div class="color-sample" style="background-color: #D500F9;"></div>
                    </div>
                    <span class="scheme-name">Vibrant</span>
                </div>
                
                <div class="scheme-option" data-scheme="monochrome">
                    <div class="scheme-preview">
                        <div class="color-sample" style="background-color: #616161;"></div>
                        <div class="color-sample" style="background-color: #757575;"></div>
                        <div class="color-sample" style="background-color: #9E9E9E;"></div>
                        <div class="color-sample" style="background-color: #BDBDBD;"></div>
                    </div>
                    <span class="scheme-name">Monochrome</span>
                </div>
                
                <div class="scheme-option" data-scheme="colorblind">
                    <div class="scheme-preview">
                        <div class="color-sample" style="background-color: #117733;"></div>
                        <div class="color-sample" style="background-color: #332288;"></div>
                        <div class="color-sample" style="background-color: #DDCC77;"></div>
                        <div class="color-sample" style="background-color: #CC6677;"></div>
                    </div>
                    <span class="scheme-name">Colorblind Safe</span>
                </div>
                
                <div class="scheme-option" data-scheme="custom">
                    <div class="scheme-preview">
                        <div class="color-sample custom-color" data-index="0"></div>
                        <div class="color-sample custom-color" data-index="1"></div>
                        <div class="color-sample custom-color" data-index="2"></div>
                        <div class="color-sample custom-color" data-index="3"></div>
                    </div>
                    <span class="scheme-name">Custom</span>
                </div>
            </div>
            
            <div class="custom-colors" id="custom-colors" style="display: none;">
                <h4>Custom Color Configuration</h4>
                <div class="color-pickers">
                    <div class="color-picker-group">
                        <label>Color 1</label>
                        <input type="color" class="color-picker" data-index="0" value="#4CAF50">
                    </div>
                    <div class="color-picker-group">
                        <label>Color 2</label>
                        <input type="color" class="color-picker" data-index="1" value="#2196F3">
                    </div>
                    <div class="color-picker-group">
                        <label>Color 3</label>
                        <input type="color" class="color-picker" data-index="2" value="#FF9800">
                    </div>
                    <div class="color-picker-group">
                        <label>Color 4</label>
                        <input type="color" class="color-picker" data-index="3" value="#9C27B0">
                    </div>
                </div>
                <button class="btn btn-sm btn-primary" id="apply-custom-colors">
                    Apply Custom Colors
                </button>
            </div>
            
            <div class="scheme-actions">
                <button class="btn btn-primary" id="apply-color-scheme">
                    Apply Color Scheme
                </button>
                <button class="btn btn-secondary" id="reset-color-scheme">
                    Reset to Default
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    colorSchemeContainer.querySelectorAll('.scheme-option').forEach(option => {
        option.addEventListener('click', () => {
            colorSchemeContainer.querySelectorAll('.scheme-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            
            const scheme = option.dataset.scheme;
            if (scheme === 'custom') {
                colorSchemeContainer.querySelector('#custom-colors').style.display = 'block';
            } else {
                colorSchemeContainer.querySelector('#custom-colors').style.display = 'none';
            }
        });
    });
    
    // Set default selection
    colorSchemeContainer.querySelector('.scheme-option[data-scheme="default"]').classList.add('selected');
    
    // Color picker updates
    colorSchemeContainer.querySelectorAll('.color-picker').forEach(picker => {
        picker.addEventListener('input', (e) => {
            const index = e.target.dataset.index;
            const color = e.target.value;
            colorSchemeContainer.querySelector(`.custom-color[data-index="${index}"]`).style.backgroundColor = color;
        });
    });
    
    colorSchemeContainer.querySelector('#apply-custom-colors').addEventListener('click', applyCustomColors);
    colorSchemeContainer.querySelector('#apply-color-scheme').addEventListener('click', applyColorScheme);
    colorSchemeContainer.querySelector('#reset-color-scheme').addEventListener('click', resetColorScheme);
}

// Initialize time period selector
function initializeTimePeriodSelector() {
    const timePeriodContainer = document.getElementById('time_period_selector');
    if (!timePeriodContainer) return;
    
    timePeriodContainer.innerHTML = `
        <div class="time-period-selector">
            <h3>Time Period Selection</h3>
            <div class="period-options">
                <div class="quick-periods">
                    <button class="btn btn-outline period-btn" data-period="today">Today</button>
                    <button class="btn btn-outline period-btn" data-period="yesterday">Yesterday</button>
                    <button class="btn btn-outline period-btn" data-period="last7">Last 7 Days</button>
                    <button class="btn btn-outline period-btn" data-period="last30">Last 30 Days</button>
                    <button class="btn btn-outline period-btn" data-period="thisMonth">This Month</button>
                    <button class="btn btn-outline period-btn" data-period="lastMonth">Last Month</button>
                    <button class="btn btn-outline period-btn" data-period="all">All Time</button>
                </div>
                
                <div class="custom-period">
                    <h4>Custom Date Range</h4>
                    <div class="date-range-picker">
                        <div class="form-group">
                            <label for="start-date-custom">Start Date</label>
                            <input type="date" id="start-date-custom">
                        </div>
                        <div class="form-group">
                            <label for="end-date-custom">End Date</label>
                            <input type="date" id="end-date-custom">
                        </div>
                        <button class="btn btn-primary" id="apply-custom-period">
                            Apply Custom Range
                        </button>
                    </div>
                </div>
                
                <div class="period-presets">
                    <h4>Saved Presets</h4>
                    <div class="preset-list" id="preset-list">
                        <div class="preset-item">
                            <span class="preset-name">Training Sessions</span>
                            <button class="btn btn-sm btn-outline apply-preset">Apply</button>
                            <button class="btn btn-sm btn-outline delete-preset">Delete</button>
                        </div>
                        <div class="preset-item">
                            <span class="preset-name">Competition Days</span>
                            <button class="btn btn-sm btn-outline apply-preset">Apply</button>
                            <button class="btn btn-sm btn-outline delete-preset">Delete</button>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" id="save-preset">
                        Save Current as Preset
                    </button>
                </div>
            </div>
            
            <div class="period-display">
                <h4>Current Selection</h4>
                <div class="selected-period" id="selected-period">
                    <p>All time (no date filter applied)</p>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    timePeriodContainer.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectTimePeriod(btn.dataset.period);
        });
    });
    
    timePeriodContainer.querySelector('#apply-custom-period').addEventListener('click', applyCustomTimePeriod);
    timePeriodContainer.querySelector('#save-preset').addEventListener('click', saveTimePeriodPreset);
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    timePeriodContainer.querySelector('#end-date-custom').value = today;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    timePeriodContainer.querySelector('#start-date-custom').value = weekAgo.toISOString().split('T')[0];
}

// Record selection functions
function handleRecordSelection(checkbox) {
    const recordId = parseInt(checkbox.dataset.recordId);
    
    if (checkbox.checked) {
        DataManagementState.selectedRecords.add(recordId);
    } else {
        DataManagementState.selectedRecords.delete(recordId);
    }
    
    updateSelectionInfo();
}

function selectAllRecords() {
    const checkboxes = document.querySelectorAll('.record-selector');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const recordId = parseInt(checkbox.dataset.recordId);
        DataManagementState.selectedRecords.add(recordId);
    });
    
    updateSelectionInfo();
    showBulkEditForm();
}

function clearSelection() {
    const checkboxes = document.querySelectorAll('.record-selector');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    DataManagementState.selectedRecords.clear();
    updateSelectionInfo();
    hideBulkEditForm();
}

function updateSelectionInfo() {
    const count = DataManagementState.selectedRecords.size;
    const countElement = document.getElementById('selected-count');
    
    if (countElement) {
        countElement.textContent = `${count} record${count !== 1 ? 's' : ''} selected`;
    }
    
    // Show/hide bulk edit form based on selection
    if (count > 1) {
        showBulkEditForm();
    } else {
        hideBulkEditForm();
    }
}

function showBulkEditForm() {
    const form = document.getElementById('bulk-edit-form');
    if (form) {
        form.style.display = 'block';
        App.utils.fadeIn(form);
    }
}

function hideBulkEditForm() {
    const form = document.getElementById('bulk-edit-form');
    if (form) {
        App.utils.fadeOut(form, 200, () => {
            form.style.display = 'none';
        });
    }
}

// Bulk edit functions
function editSelectedRecords() {
    const selectedCount = DataManagementState.selectedRecords.size;
    
    if (selectedCount === 0) {
        App.showNotification('Please select records to edit', 'warning');
        return;
    }
    
    if (selectedCount === 1) {
        // Edit single record
        const recordId = Array.from(DataManagementState.selectedRecords)[0];
        if (window.Dashboard && window.Dashboard.editRecord) {
            window.Dashboard.editRecord(recordId);
        }
    } else {
        // Show bulk edit form
        showBulkEditForm();
    }
}

function deleteSelectedRecords() {
    const selectedCount = DataManagementState.selectedRecords.size;
    
    if (selectedCount === 0) {
        App.showNotification('Please select records to delete', 'warning');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedCount} record${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`)) {
        return;
    }
    
    // Save to history before deletion
    saveToHistory(`Deleted ${selectedCount} records`);
    
    // Remove selected records
    const newDataset = DataManagementState.currentDataset.filter(
        record => !DataManagementState.selectedRecords.has(record.id)
    );
    
    // Update dataset
    updateDataset(newDataset, 'Bulk deletion');
    
    // Clear selection
    clearSelection();
    
    App.showNotification(`Successfully deleted ${selectedCount} records`, 'success');
}

function duplicateSelectedRecords() {
    const selectedCount = DataManagementState.selectedRecords.size;
    
    if (selectedCount === 0) {
        App.showNotification('Please select records to duplicate', 'warning');
        return;
    }
    
    // Save to history before duplication
    saveToHistory(`Duplicated ${selectedCount} records`);
    
    // Find max ID to start new IDs from
    const maxId = DataManagementState.currentDataset.reduce(
        (max, record) => Math.max(max, record.id), 0
    );
    
    let newId = maxId + 1;
    const duplicates = [];
    
    // Create duplicates
    DataManagementState.currentDataset.forEach(record => {
        if (DataManagementState.selectedRecords.has(record.id)) {
            const duplicate = { ...record };
            duplicate.id = newId++;
            duplicate.date = new Date().toISOString().split('T')[0]; // Today's date
            duplicates.push(duplicate);
        }
    });
    
    // Add duplicates to dataset
    const newDataset = [...DataManagementState.currentDataset, ...duplicates];
    updateDataset(newDataset, 'Bulk duplication');
    
    App.showNotification(`Successfully duplicated ${selectedCount} records`, 'success');
}

function applyBulkEdit() {
    const field = document.getElementById('bulk-field').value;
    const value = document.getElementById('bulk-value').value.trim();
    
    if (!value) {
        App.showNotification('Please enter a value for bulk edit', 'warning');
        return;
    }
    
    const selectedCount = DataManagementState.selectedRecords.size;
    
    // Validate value based on field type
    let validatedValue = value;
    let validationError = null;
    
    switch(field) {
        case 'successRate':
            const rate = parseInt(value);
            if (isNaN(rate) || rate < 0 || rate > 100) {
                validationError = 'Success rate must be between 0 and 100';
            } else {
                validatedValue = rate;
            }
            break;
        case 'points':
            const points = parseInt(value);
            if (isNaN(points) || points < 0) {
                validationError = 'Points must be a positive number';
            } else {
                validatedValue = points;
            }
            break;
        case 'serveType':
            const validServeTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
            if (!validServeTypes.includes(value)) {
                validationError = `Serve type must be one of: ${validServeTypes.join(', ')}`;
            }
            break;
        case 'strokeType':
            const validStrokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
            if (!validStrokeTypes.includes(value)) {
                validationError = `Stroke type must be one of: ${validStrokeTypes.join(', ')}`;
            }
            break;
        case 'focus':
            if (!['Right', 'Left'].includes(value)) {
                validationError = 'Focus must be "Right" or "Left"';
            }
            break;
    }
    
    if (validationError) {
        App.showNotification(validationError, 'error');
        return;
    }
    
    // Save to history before bulk edit
    saveToHistory(`Bulk edit: ${field} = ${value} for ${selectedCount} records`);
    
    // Apply bulk edit
    const newDataset = DataManagementState.currentDataset.map(record => {
        if (DataManagementState.selectedRecords.has(record.id)) {
            return {
                ...record,
                [field]: validatedValue
            };
        }
        return record;
    });
    
    updateDataset(newDataset, 'Bulk edit');
    hideBulkEditForm();
    
    App.showNotification(`Updated ${field} for ${selectedCount} records`, 'success');
}

// Dataset history functions
function saveToHistory(description) {
    // Remove any redo history
    if (DataManagementState.historyIndex < DataManagementState.datasetHistory.length - 1) {
        DataManagementState.datasetHistory = DataManagementState.datasetHistory.slice(
            0, DataManagementState.historyIndex + 1
        );
    }
    
    const historyEntry = {
        timestamp: new Date().toISOString(),
        description: description,
        dataset: JSON.parse(JSON.stringify(DataManagementState.currentDataset))
    };
    
    DataManagementState.datasetHistory.push(historyEntry);
    DataManagementState.historyIndex = DataManagementState.datasetHistory.length - 1;
    
    // Limit history size
    if (DataManagementState.datasetHistory.length > 50) {
        DataManagementState.datasetHistory.shift();
        DataManagementState.historyIndex--;
    }
}

function undoLastAction() {
    if (DataManagementState.historyIndex > 0) {
        DataManagementState.historyIndex--;
        const previousState = DataManagementState.datasetHistory[DataManagementState.historyIndex];
        DataManagementState.currentDataset = JSON.parse(JSON.stringify(previousState.dataset));
        updateAppDataset();
        App.showNotification('Undo: ' + previousState.description, 'info');
    } else {
        App.showNotification('Nothing to undo', 'info');
    }
}

function redoLastAction() {
    if (DataManagementState.historyIndex < DataManagementState.datasetHistory.length - 1) {
        DataManagementState.historyIndex++;
        const nextState = DataManagementState.datasetHistory[DataManagementState.historyIndex];
        DataManagementState.currentDataset = JSON.parse(JSON.stringify(nextState.dataset));
        updateAppDataset();
        App.showNotification('Redo: ' + nextState.description, 'info');
    } else {
        App.showNotification('Nothing to redo', 'info');
    }
}

// Update dataset and sync with app state
function updateDataset(newDataset, actionDescription = 'Update') {
    // Save to history
    saveToHistory(actionDescription);
    
    // Update local dataset
    DataManagementState.currentDataset = newDataset;
    
    // Update app state
    updateAppDataset();
}

function updateAppDataset() {
    App.state.dataset = [...DataManagementState.currentDataset];
    
    // Trigger data update events
    document.dispatchEvent(new CustomEvent('dataUpdated'));
    
    // Update dashboard if it exists
    if (window.Dashboard && window.Dashboard.refresh) {
        window.Dashboard.refresh();
    }
}

// Data refresh functions
function handleDataRefresh(action) {
    switch(action) {
        case 'manual':
            refreshDataManually();
            break;
        case 'clear-cache':
            clearDataCache();
            break;
    }
}

function refreshDataManually() {
    App.showNotification('Refreshing data...', 'info');
    
    // Simulate data refresh (in real app, this would fetch from API)
    setTimeout(() => {
        // For now, just reload current data
        DataManagementState.currentDataset = [...App.state.dataset];
        updateAppDataset();
        
        // Add to refresh history
        addRefreshHistoryEntry('Manual refresh');
        
        App.showNotification('Data refreshed successfully', 'success');
    }, 1000);
}

function clearDataCache() {
    if (confirm('Are you sure you want to clear all cached data?')) {
        // Clear any cached data
        localStorage.removeItem('ttDashboardCache');
        sessionStorage.removeItem('ttDashboardSessionCache');
        
        // Clear refresh history
        const historyList = document.getElementById('refresh-history-list');
        if (historyList) {
            historyList.innerHTML = '<p class="empty-message">No refresh history available</p>';
        }
        
        App.showNotification('Data cache cleared', 'success');
    }
}

function addRefreshHistoryEntry(description) {
    const historyList = document.getElementById('refresh-history-list');
    if (!historyList) return;
    
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.innerHTML = `
        <div class="entry-time">${new Date().toLocaleTimeString()}</div>
        <div class="entry-description">${description}</div>
        <div class="entry-status success">Success</div>
    `;
    
    // Remove empty message if present
    const emptyMessage = historyList.querySelector('.empty-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Add new entry at the top
    historyList.insertBefore(entry, historyList.firstChild);
    
    // Limit to 10 entries
    const entries = historyList.querySelectorAll('.history-entry');
    if (entries.length > 10) {
        entries[entries.length - 1].remove();
    }
}

// Load and save settings
function loadRefreshSettings() {
    const settings = JSON.parse(localStorage.getItem('ttRefreshSettings') || '{}');
    
    if (settings.autoRefreshInterval) {
        document.getElementById('auto-refresh-interval').value = settings.autoRefreshInterval;
    }
    
    if (settings.refreshOnFocus !== undefined) {
        document.getElementById('refresh-on-focus').checked = settings.refreshOnFocus;
    }
    
    if (settings.cacheDuration) {
        document.getElementById('cache-duration').value = settings.cacheDuration;
    }
}

function loadExportPreferences() {
    const preferences = JSON.parse(localStorage.getItem('ttExportPreferences') || '{}');
    
    if (preferences.defaultFormat) {
        document.querySelector(`input[name="export-format"][value="${preferences.defaultFormat}"]`).checked = true;
    }
    
    if (preferences.includeMetadata !== undefined) {
        document.getElementById('include-metadata').checked = preferences.includeMetadata;
    }
    
    if (preferences.includeCharts !== undefined) {
        document.getElementById('include-charts').checked = preferences.includeCharts;
    }
    
    if (preferences.compressFiles !== undefined) {
        document.getElementById('compress-files').checked = preferences.compressFiles;
    }
    
    if (preferences.timestampFilenames !== undefined) {
        document.getElementById('timestamp-filenames').checked = preferences.timestampFilenames;
    }
    
    if (preferences.exportRange) {
        document.querySelector(`input[name="export-range"][value="${preferences.exportRange}"]`).checked = true;
        
        if (preferences.exportRange === 'custom' && preferences.customRange) {
            document.getElementById('start-date').value = preferences.customRange.start;
            document.getElementById('end-date').value = preferences.customRange.end;
            document.getElementById('custom-range').style.display = 'block';
        }
    }
}

function saveExportPreferences() {
    const preferences = {
        defaultFormat: document.querySelector('input[name="export-format"]:checked').value,
        includeMetadata: document.getElementById('include-metadata').checked,
        includeCharts: document.getElementById('include-charts').checked,
        compressFiles: document.getElementById('compress-files').checked,
        timestampFilenames: document.getElementById('timestamp-filenames').checked,
        exportRange: document.querySelector('input[name="export-range"]:checked').value
    };
    
    if (preferences.exportRange === 'custom') {
        preferences.customRange = {
            start: document.getElementById('start-date').value,
            end: document.getElementById('end-date').value
        };
    }
    
    localStorage.setItem('ttExportPreferences', JSON.stringify(preferences));
    App.showNotification('Export preferences saved', 'success');
}

function resetExportPreferences() {
    if (confirm('Reset all export preferences to defaults?')) {
        localStorage.removeItem('ttExportPreferences');
        initializeExportPreferences(); // Re-initialize with defaults
        App.showNotification('Export preferences reset to defaults', 'success');
    }
}

function loadProfileSettings() {
    const profile = JSON.parse(localStorage.getItem('ttUserProfile') || '{}');
    
    if (profile.name) {
        document.getElementById('user-name').value = profile.name;
    }
    
    if (profile.email) {
        document.getElementById('user-email').value = profile.email;
    }
    
    if (profile.defaultView) {
        document.getElementById('default-view').value = profile.defaultView;
    }
    
    if (profile.recordsPerPage) {
        document.getElementById('records-per-page').value = profile.recordsPerPage;
    }
    
    if (profile.autoSave !== undefined) {
        document.getElementById('auto-save').checked = profile.autoSave;
        DataManagementState.autoSaveEnabled = profile.autoSave;
        
        if (profile.autoSave) {
            startAutoSave();
        } else {
            stopAutoSave();
        }
    }
    
    if (profile.confirmDelete !== undefined) {
        document.getElementById('confirm-delete').checked = profile.confirmDelete;
    }
    
    if (profile.backupEnabled !== undefined) {
        document.getElementById('backup-enabled').checked = profile.backupEnabled;
    }
    
    if (profile.notifications) {
        document.getElementById('notify-updates').checked = profile.notifications.updates || true;
        document.getElementById('notify-errors').checked = profile.notifications.errors || false;
        document.getElementById('notify-exports').checked = profile.notifications.exports || true;
    }
}

function saveProfileSettings() {
    const profile = {
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        defaultView: document.getElementById('default-view').value,
        recordsPerPage: parseInt(document.getElementById('records-per-page').value),
        autoSave: document.getElementById('auto-save').checked,
        confirmDelete: document.getElementById('confirm-delete').checked,
        backupEnabled: document.getElementById('backup-enabled').checked,
        notifications: {
            updates: document.getElementById('notify-updates').checked,
            errors: document.getElementById('notify-errors').checked,
            exports: document.getElementById('notify-exports').checked
        },
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('ttUserProfile', JSON.stringify(profile));
    
    // Update auto-save state
    DataManagementState.autoSaveEnabled = profile.autoSave;
    if (profile.autoSave) {
        startAutoSave();
    } else {
        stopAutoSave();
    }
    
    App.showNotification('Profile settings saved', 'success');
}

function resetProfileSettings() {
    if (confirm('Reset all profile settings to defaults?')) {
        localStorage.removeItem('ttUserProfile');
        initializeUserProfileSettings(); // Re-initialize with defaults
        App.showNotification('Profile settings reset to defaults', 'success');
    }
}

function loadAccessibilitySettings() {
    const settings = JSON.parse(localStorage.getItem('ttAccessibilitySettings') || '{}');
    
    if (settings.highContrast !== undefined) {
        document.getElementById('high-contrast').checked = settings.highContrast;
    }
    
    if (settings.largeText !== undefined) {
        document.getElementById('large-text').checked = settings.largeText;
    }
    
    if (settings.reduceMotion !== undefined) {
        document.getElementById('reduce-motion').checked = settings.reduceMotion;
    }
    
    if (settings.colorBlind !== undefined) {
        document.getElementById('color-blind').checked = settings.colorBlind;
    }
    
    if (settings.keyboardNav !== undefined) {
        document.getElementById('keyboard-nav').checked = settings.keyboardNav;
    }
    
    if (settings.focusIndicators !== undefined) {
        document.getElementById('focus-indicators').checked = settings.focusIndicators;
    }
    
    if (settings.skipLinks !== undefined) {
        document.getElementById('skip-links').checked = settings.skipLinks;
    }
    
    if (settings.ariaLabels !== undefined) {
        document.getElementById('aria-labels').checked = settings.ariaLabels;
    }
    
    if (settings.liveRegions !== undefined) {
        document.getElementById('live-regions').checked = settings.liveRegions;
    }
    
    if (settings.chartDescriptions !== undefined) {
        document.getElementById('chart-descriptions').checked = settings.chartDescriptions;
    }
    
    if (settings.dataTables !== undefined) {
        document.getElementById('data-tables').checked = settings.dataTables;
    }
    
    if (settings.altText !== undefined) {
        document.getElementById('alt-text').checked = settings.altText;
    }
}

function applyAccessibilitySettings() {
    const settings = {
        highContrast: document.getElementById('high-contrast').checked,
        largeText: document.getElementById('large-text').checked,
        reduceMotion: document.getElementById('reduce-motion').checked,
        colorBlind: document.getElementById('color-blind').checked,
        keyboardNav: document.getElementById('keyboard-nav').checked,
        focusIndicators: document.getElementById('focus-indicators').checked,
        skipLinks: document.getElementById('skip-links').checked,
        ariaLabels: document.getElementById('aria-labels').checked,
        liveRegions: document.getElementById('live-regions').checked,
        chartDescriptions: document.getElementById('chart-descriptions').checked,
        dataTables: document.getElementById('data-tables').checked,
        altText: document.getElementById('alt-text').checked
    };
    
    localStorage.setItem('ttAccessibilitySettings', JSON.stringify(settings));
    
    // Apply settings to document
    applyAccessibilityToDocument(settings);
    
    App.showNotification('Accessibility settings applied', 'success');
}

function applyAccessibilityToDocument(settings) {
    // Apply high contrast
    document.body.classList.toggle('high-contrast', settings.highContrast);
    
    // Apply large text
    document.body.classList.toggle('large-text', settings.largeText);
    
    // Apply reduced motion
    if (settings.reduceMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0.01s');
    } else {
        document.documentElement.style.removeProperty('--animation-duration');
    }
    
    // Apply color blind mode
    document.body.classList.toggle('color-blind', settings.colorBlind);
    
    // Notify screen readers if live regions enabled
    if (settings.liveRegions) {
        const liveRegion = document.getElementById('live-region') || createLiveRegion();
        liveRegion.textContent = 'Accessibility settings updated';
        liveRegion.setAttribute('aria-live', 'polite');
    }
}

function createLiveRegion() {
    const region = document.createElement('div');
    region.id = 'live-region';
    region.className = 'sr-only';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
    return region;
}

function resetAccessibilitySettings() {
    if (confirm('Reset all accessibility settings to defaults?')) {
        localStorage.removeItem('ttAccessibilitySettings');
        initializeAccessibilityOptions(); // Re-initialize with defaults
        App.showNotification('Accessibility settings reset to defaults', 'success');
    }
}

function toggleAccessibilityMode() {
    const currentMode = document.body.classList.contains('accessibility-mode');
    document.body.classList.toggle('accessibility-mode', !currentMode);
    
    const mode = !currentMode ? 'enabled' : 'disabled';
    App.showNotification(`Accessibility mode ${mode}`, 'info');
}

// Color scheme functions
function applyCustomColors() {
    const colors = [];
    document.querySelectorAll('.color-picker').forEach(picker => {
        colors.push(picker.value);
    });
    
    // Save custom colors
    localStorage.setItem('ttCustomColors', JSON.stringify(colors));
    
    // Update custom color preview
    document.querySelectorAll('.custom-color').forEach((sample, index) => {
        sample.style.backgroundColor = colors[index];
    });
    
    App.showNotification('Custom colors saved', 'success');
}

function applyColorScheme() {
    const selectedOption = document.querySelector('.scheme-option.selected');
    const scheme = selectedOption.dataset.scheme;
    
    let colors;
    
    if (scheme === 'custom') {
        const savedColors = JSON.parse(localStorage.getItem('ttCustomColors') || 'null');
        if (!savedColors) {
            App.showNotification('Please configure custom colors first', 'warning');
            return;
        }
        colors = savedColors;
    } else {
        // Define color schemes
        const schemes = {
            default: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
            pastel: ['#A5D6A7', '#90CAF9', '#FFE082', '#CE93D8'],
            vibrant: ['#00E676', '#00B0FF', '#FF9100', '#D500F9'],
            monochrome: ['#616161', '#757575', '#9E9E9E', '#BDBDBD'],
            colorblind: ['#117733', '#332288', '#DDCC77', '#CC6677']
        };
        
        colors = schemes[scheme] || schemes.default;
    }
    
    // Save selected scheme
    localStorage.setItem('ttColorScheme', scheme);
    localStorage.setItem('ttChartColors', JSON.stringify(colors));
    
    // Apply to charts
    applyColorsToCharts(colors);
    
    App.showNotification(`"${selectedOption.querySelector('.scheme-name').textContent}" color scheme applied`, 'success');
}

function applyColorsToCharts(colors) {
    // Update CSS custom properties
    document.documentElement.style.setProperty('--chart-color-1', colors[0]);
    document.documentElement.style.setProperty('--chart-color-2', colors[1]);
    document.documentElement.style.setProperty('--chart-color-3', colors[2]);
    document.documentElement.style.setProperty('--chart-color-4', colors[3]);
    
    // Dispatch event for charts to update
    document.dispatchEvent(new CustomEvent('chartColorsUpdated', {
        detail: { colors }
    }));
}

function resetColorScheme() {
    if (confirm('Reset color scheme to default?')) {
        localStorage.removeItem('ttColorScheme');
        localStorage.removeItem('ttChartColors');
        localStorage.removeItem('ttCustomColors');
        
        // Re-initialize with defaults
        initializeChartColorSchemeSelector();
        applyColorsToCharts(['#4CAF50', '#2196F3', '#FF9800', '#9C27B0']);
        
        App.showNotification('Color scheme reset to default', 'success');
    }
}

// Time period functions
function selectTimePeriod(period) {
    let startDate, endDate, description;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(period) {
        case 'today':
            startDate = new Date(today);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            description = 'Today';
            break;
        case 'yesterday':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 1);
            endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);
            description = 'Yesterday';
            break;
        case 'last7':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 6);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            description = 'Last 7 days';
            break;
        case 'last30':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - 29);
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);
            description = 'Last 30 days';
            break;
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            description = 'This month';
            break;
        case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            endDate.setHours(23, 59, 59, 999);
            description = 'Last month';
            break;
        case 'all':
        default:
            startDate = null;
            endDate = null;
            description = 'All time';
            break;
    }
    
    // Update time period selector
    DataManagementState.filters.timePeriod = {
        start: startDate,
        end: endDate,
        description: description
    };
    
    // Update display
    updateTimePeriodDisplay();
    
    // Apply filters
    applyTimePeriodFilter();
}

function applyCustomTimePeriod() {
    const startInput = document.getElementById('start-date-custom');
    const endInput = document.getElementById('end-date-custom');
    
    if (!startInput.value || !endInput.value) {
        App.showNotification('Please select both start and end dates', 'warning');
        return;
    }
    
    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value);
    endDate.setHours(23, 59, 59, 999);
    
    if (startDate > endDate) {
        App.showNotification('Start date cannot be after end date', 'error');
        return;
    }
    
    DataManagementState.filters.timePeriod = {
        start: startDate,
        end: endDate,
        description: `Custom: ${startInput.value} to ${endInput.value}`
    };
    
    updateTimePeriodDisplay();
    applyTimePeriodFilter();
}

function updateTimePeriodDisplay() {
    const displayElement = document.getElementById('selected-period');
    if (!displayElement) return;
    
    const period = DataManagementState.filters.timePeriod;
    
    if (period && period.description) {
        displayElement.innerHTML = `
            <p><strong>${period.description}</strong></p>
            ${period.start ? `<p>From: ${period.start.toLocaleDateString()}</p>` : ''}
            ${period.end ? `<p>To: ${period.end.toLocaleDateString()}</p>` : ''}
        `;
    } else {
        displayElement.innerHTML = '<p>All time (no date filter applied)</p>';
    }
}

function applyTimePeriodFilter() {
    const period = DataManagementState.filters.timePeriod;
    
    if (!period || !period.start) {
        // Clear time filter
        delete DataManagementState.filters.dateRange;
    } else {
        // Apply time filter
        DataManagementState.filters.dateRange = {
            start: period.start,
            end: period.end
        };
    }
    
    // Trigger filter update
    document.dispatchEvent(new CustomEvent('filtersUpdated', {
        detail: { filters: DataManagementState.filters }
    }));
    
    App.showNotification(`Time period filter applied: ${period.description}`, 'info');
}

function saveTimePeriodPreset() {
    const period = DataManagementState.filters.timePeriod;
    
    if (!period) {
        App.showNotification('No time period selected to save', 'warning');
        return;
    }
    
    const presetName = prompt('Enter a name for this preset:');
    if (!presetName) return;
    
    const presets = JSON.parse(localStorage.getItem('ttTimePresets') || '[]');
    
    // Check if preset with this name already exists
    if (presets.some(p => p.name === presetName)) {
        if (!confirm(`Preset "${presetName}" already exists. Overwrite?`)) {
            return;
        }
        // Remove existing preset with same name
        presets = presets.filter(p => p.name !== presetName);
    }
    
    presets.push({
        name: presetName,
        period: period,
        created: new Date().toISOString()
    });
    
    localStorage.setItem('ttTimePresets', JSON.stringify(presets));
    
    // Update preset list
    updatePresetList();
    
    App.showNotification(`Preset "${presetName}" saved`, 'success');
}

function updatePresetList() {
    const presetList = document.getElementById('preset-list');
    if (!presetList) return;
    
    const presets = JSON.parse(localStorage.getItem('ttTimePresets') || '[]');
    
    if (presets.length === 0) {
        presetList.innerHTML = '<p class="empty-message">No saved presets</p>';
        return;
    }
    
    presetList.innerHTML = presets.map(preset => `
        <div class="preset-item">
            <span class="preset-name">${preset.name}</span>
            <button class="btn btn-sm btn-outline apply-preset" data-name="${preset.name}">Apply</button>
            <button class="btn btn-sm btn-outline delete-preset" data-name="${preset.name}">Delete</button>
        </div>
    `).join('');
    
    // Add event listeners to new buttons
    presetList.querySelectorAll('.apply-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            applyPreset(btn.dataset.name);
        });
    });
    
    presetList.querySelectorAll('.delete-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            deletePreset(btn.dataset.name);
        });
    });
}

function applyPreset(presetName) {
    const presets = JSON.parse(localStorage.getItem('ttTimePresets') || '[]');
    const preset = presets.find(p => p.name === presetName);
    
    if (preset) {
        DataManagementState.filters.timePeriod = preset.period;
        updateTimePeriodDisplay();
        applyTimePeriodFilter();
        App.showNotification(`Preset "${presetName}" applied`, 'success');
    }
}

function deletePreset(presetName) {
    if (!confirm(`Delete preset "${presetName}"?`)) return;
    
    const presets = JSON.parse(localStorage.getItem('ttTimePresets') || '[]');
    const filteredPresets = presets.filter(p => p.name !== presetName);
    
    localStorage.setItem('ttTimePresets', JSON.stringify(filteredPresets));
    updatePresetList();
    
    App.showNotification(`Preset "${presetName}" deleted`, 'success');
}

// Drilldown statistics
function generateDrilldownStatistics() {
    const metric = document.getElementById('drilldown-metric').value;
    const dimension = document.getElementById('drilldown-dimension').value;
    
    // Calculate statistics based on metric and dimension
    const results = calculateDrilldownStats(metric, dimension);
    
    // Display results
    displayDrilldownResults(results, metric, dimension);
    
    // Show export options
    document.getElementById('drilldown-export').style.display = 'block';
}

function calculateDrilldownStats(metric, dimension) {
    const data = DataManagementState.currentDataset;
    
    if (data.length === 0) {
        return { error: 'No data available for analysis' };
    }
    
    // Group data by dimension
    const groups = {};
    
    data.forEach(record => {
        let groupKey;
        
        switch(dimension) {
            case 'date':
                groupKey = record.date;
                break;
            case 'serveType':
                groupKey = record.serveType;
                break;
            case 'strokeType':
                groupKey = record.strokeType;
                break;
            case 'focus':
                groupKey = record.focus;
                break;
            case 'hourOfDay':
                // Extract hour from date (simplified)
                groupKey = 'All hours'; // In real app, parse date and extract hour
                break;
            case 'dayOfWeek':
                // Extract day of week from date
                const date = new Date(record.date);
                groupKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
                break;
            default:
                groupKey = 'All';
        }
        
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(record);
    });
    
    // Calculate metric for each group
    const results = [];
    
    Object.keys(groups).forEach(groupKey => {
        const groupData = groups[groupKey];
        let value;
        
        switch(metric) {
            case 'successRate':
                value = groupData.reduce((sum, record) => sum + record.successRate, 0) / groupData.length;
                break;
            case 'points':
                value = groupData.reduce((sum, record) => sum + record.points, 0);
                break;
            case 'serveType':
            case 'strokeType':
            case 'focus':
                // For distribution metrics, count occurrences
                const counts = {};
                groupData.forEach(record => {
                    const key = record[metric];
                    counts[key] = (counts[key] || 0) + 1;
                });
                value = counts;
                break;
        }
        
        results.push({
            group: groupKey,
            count: groupData.length,
            value: typeof value === 'number' ? Math.round(value * 100) / 100 : value
        });
    });
    
    // Sort results
    results.sort((a, b) => {
        if (typeof a.value === 'number' && typeof b.value === 'number') {
            return b.value - a.value;
        }
        return a.group.localeCompare(b.group);
    });
    
    return {
        metric: metric,
        dimension: dimension,
        totalRecords: data.length,
        groups: results,
        generatedAt: new Date().toISOString()
    };
}

function displayDrilldownResults(results, metric, dimension) {
    const resultsContainer = document.getElementById('drilldown-results');
    
    if (results.error) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="error-icon"></i>
                <p>${results.error}</p>
            </div>
        `;
        return;
    }
    
    let content = '';
    
    if (typeof results.groups[0].value === 'number') {
        // Numerical results - show table and chart
        content = `
            <div class="drilldown-summary">
                <h4>Summary</h4>
                <p>Analyzed ${results.totalRecords} records grouped by ${dimension}</p>
            </div>
            
            <div class="drilldown-table">
                <table>
                    <thead>
                        <tr>
                            <th>${dimension}</th>
                            <th>Count</th>
                            <th>${metric}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.groups.map(group => `
                            <tr>
                                <td>${group.group}</td>
                                <td>${group.count}</td>
                                <td>${group.value}${metric === 'successRate' ? '%' : ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="drilldown-chart">
                <canvas id="drilldown-chart-canvas"></canvas>
            </div>
        `;
        
        // Create chart
        setTimeout(() => {
            createDrilldownChart(results, metric, dimension);
        }, 100);
        
    } else {
        // Distribution results - show distribution
        content = `
            <div class="distribution-results">
                <h4>Distribution Analysis</h4>
                ${results.groups.map(group => `
                    <div class="distribution-group">
                        <h5>${group.group}</h5>
                        <div class="distribution-values">
                            ${Object.keys(group.value).map(key => `
                                <div class="distribution-item">
                                    <span class="item-label">${key}:</span>
                                    <span class="item-value">${group.value[key]} (${Math.round((group.value[key] / group.count) * 100)}%)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    resultsContainer.innerHTML = content;
}

function createDrilldownChart(results, metric, dimension) {
    const canvas = document.getElementById('drilldown-chart-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const labels = results.groups.map(g => g.group);
    const data = results.groups.map(g => g.value);
    
    // Clear previous chart
    if (DataManagementState.drilldownChart) {
        DataManagementState.drilldownChart.destroy();
    }
    
    // Create new chart
    DataManagementState.drilldownChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: metric === 'successRate' ? 'Average Success Rate (%)' : 'Total Points',
                data: data,
                backgroundColor: 'rgba(33, 150, 243, 0.7)',
                borderColor: '#2196F3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: metric === 'successRate' ? 'Success Rate (%)' : 'Points'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: dimension
                    }
                }
            }
        }
    });
}

// Analysis export functions
function handleAnalysisExport(format) {
    const data = DataManagementState.currentDataset;
    
    if (data.length === 0) {
        App.showNotification('No data to export', 'warning');
        return;
    }
    
    let exportData;
    let mimeType;
    let extension;
    let filename;
    
    switch(format) {
        case 'raw-csv':
            exportData = convertToCSV(data);
            mimeType = 'text/csv';
            extension = 'csv';
            filename = `table-tennis-raw-data-${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'processed-json':
            exportData = JSON.stringify(processDataForExport(data), null, 2);
            mimeType = 'application/json';
            extension = 'json';
            filename = `table-tennis-processed-${new Date().toISOString().split('T')[0]}.json`;
            break;
        case 'summary-pdf':
            // In real app, generate PDF
            exportData = generateSummaryText(data);
            mimeType = 'text/plain';
            extension = 'txt';
            filename = `table-tennis-summary-${new Date().toISOString().split('T')[0]}.txt`;
            break;
        case 'chart-png':
        case 'chart-svg':
        case 'interactive-html':
            App.showNotification(`${format.toUpperCase()} export would be implemented with a chart library`, 'info');
            return;
        default:
            App.showNotification('Export format not supported', 'error');
            return;
    }
    
    // Download file
    downloadFile(exportData, filename, mimeType);
    
    // Add to export history
    addExportHistoryEntry(format, filename);
    
    App.showNotification(`Exported as ${format}`, 'success');
}

function processDataForExport(data) {
    // Add calculated fields and metadata
    return {
        metadata: {
            exportedAt: new Date().toISOString(),
            recordCount: data.length,
            timePeriod: DataManagementState.filters.timePeriod?.description || 'All time'
        },
        statistics: {
            avgSuccessRate: Math.round(data.reduce((sum, record) => sum + record.successRate, 0) / data.length),
            totalPoints: data.reduce((sum, record) => sum + record.points, 0),
            serveTypeDistribution: calculateDistribution(data, 'serveType'),
            strokeTypeDistribution: calculateDistribution(data, 'strokeType'),
            focusDistribution: calculateDistribution(data, 'focus')
        },
        records: data
    };
}

function calculateDistribution(data, field) {
    const distribution = {};
    data.forEach(record => {
        distribution[record[field]] = (distribution[record[field]] || 0) + 1;
    });
    return distribution;
}

function generateSummaryText(data) {
    const stats = processDataForExport(data);
    
    return `Table Tennis Statistics Summary
====================================
Exported: ${new Date(stats.metadata.exportedAt).toLocaleString()}
Time Period: ${stats.metadata.timePeriod}
Total Records: ${stats.metadata.recordCount}

Overall Statistics:
------------------
Average Success Rate: ${stats.statistics.avgSuccessRate}%
Total Points Scored: ${stats.statistics.totalPoints}

Serve Type Distribution:
------------------------
${Object.keys(stats.statistics.serveTypeDistribution).map(type => 
    `  ${type}: ${stats.statistics.serveTypeDistribution[type]} records`
).join('\n')}

Stroke Type Distribution:
-------------------------
${Object.keys(stats.statistics.strokeTypeDistribution).map(type => 
    `  ${type}: ${stats.statistics.strokeTypeDistribution[type]} records`
).join('\n')}

Focus Distribution:
-------------------
${Object.keys(stats.statistics.focusDistribution).map(focus => 
    `  ${focus}: ${stats.statistics.focusDistribution[focus]} records`
).join('\n')}

Individual Records:
-------------------
${data.map(record => 
    `Date: ${record.date}, Serve: ${record.serveType}, Stroke: ${record.strokeType}, Focus: ${record.focus}, Success: ${record.successRate}%, Points: ${record.points}`
).join('\n')}`;
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

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
}

function addExportHistoryEntry(format, filename) {
    const historyList = document.getElementById('export-history-list');
    if (!historyList) return;
    
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.innerHTML = `
        <div class="entry-time">${new Date().toLocaleTimeString()}</div>
        <div class="entry-description">${format} export</div>
        <div class="entry-filename">${filename}</div>
    `;
    
    // Remove empty message if present
    const emptyMessage = historyList.querySelector('.empty-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Add new entry at the top
    historyList.insertBefore(entry, historyList.firstChild);
    
    // Limit to 10 entries
    const entries = historyList.querySelectorAll('.history-entry');
    if (entries.length > 10) {
        entries[entries.length - 1].remove();
    }
}

function createBatchExport() {
    const selectedOptions = Array.from(document.querySelectorAll('.batch-option:checked'))
        .map(option => option.value);
    
    if (selectedOptions.length === 0) {
        App.showNotification('Please select at least one option for batch export', 'warning');
        return;
    }
    
    App.showNotification('Creating batch export...', 'info');
    
    // Simulate batch export creation
    setTimeout(() => {
        const exportData = {
            timestamp: new Date().toISOString(),
            options: selectedOptions,
            files: selectedOptions.map(option => `${option}-export-${new Date().toISOString().split('T')[0]}.zip`)
        };
        
        // In real app, create actual ZIP file with selected exports
        downloadFile(
            JSON.stringify(exportData, null, 2),
            `batch-export-${new Date().toISOString().split('T')[0]}.json`,
            'application/json'
        );
        
        App.showNotification('Batch export created successfully', 'success');
    }, 2000);
}

// Auto-save functionality
function startAutoSave() {
    if (DataManagementState.autoSaveInterval) {
        clearInterval(DataManagementState.autoSaveInterval);
    }
    
    DataManagementState.autoSaveInterval = setInterval(() => {
        if (DataManagementState.currentDataset.length > 0) {
            autoSaveData();
        }
    }, 300000); // Auto-save every 5 minutes
}

function stopAutoSave() {
    if (DataManagementState.autoSaveInterval) {
        clearInterval(DataManagementState.autoSaveInterval);
        DataManagementState.autoSaveInterval = null;
    }
}

function autoSaveData() {
    const backup = {
        timestamp: new Date().toISOString(),
        dataset: JSON.parse(JSON.stringify(DataManagementState.currentDataset)),
        description: 'Auto-save backup'
    };
    
    // Save to localStorage
    localStorage.setItem('ttAutoSaveBackup', JSON.stringify(backup));
    
    // Add to backup points (keep last 5)
    DataManagementState.backupPoints.push(backup);
    if (DataManagementState.backupPoints.length > 5) {
        DataManagementState.backupPoints.shift();
    }
    
    console.log('Data auto-saved at', backup.timestamp);
}

function handleBackupAction(action) {
    switch(action) {
        case 'create':
            createManualBackup();
            break;
        case 'restore':
            restoreFromBackup();
            break;
        case 'manage':
            manageBackups();
            break;
    }
}

function createManualBackup() {
    const description = prompt('Enter a description for this backup:') || 'Manual backup';
    
    const backup = {
        timestamp: new Date().toISOString(),
        dataset: JSON.parse(JSON.stringify(DataManagementState.currentDataset)),
        description: description
    };
    
    // Save to localStorage
    const backups = JSON.parse(localStorage.getItem('ttManualBackups') || '[]');
    backups.push(backup);
    
    // Keep only last 10 backups
    if (backups.length > 10) {
        backups.shift();
    }
    
    localStorage.setItem('ttManualBackups', JSON.stringify(backups));
    
    App.showNotification(`Backup created: ${description}`, 'success');
}

// Handle setting changes
function handleSettingChange(element) {
    const settingId = element.id;
    const value = element.type === 'checkbox' ? element.checked : element.value;
    
    // Save setting immediately
    const settings = JSON.parse(localStorage.getItem('ttSettings') || '{}');
    settings[settingId] = value;
    localStorage.setItem('ttSettings', JSON.stringify(settings));
    
    // Apply setting if needed
    applySetting(settingId, value);
}

function applySetting(settingId, value) {
    switch(settingId) {
        case 'auto-save':
            DataManagementState.autoSaveEnabled = value;
            if (value) {
                startAutoSave();
            } else {
                stopAutoSave();
            }
            break;
        case 'high-contrast':
            document.body.classList.toggle('high-contrast', value);
            break;
        case 'large-text':
            document.body.classList.toggle('large-text', value);
            break;
        // Add more setting applications as needed
    }
}

// Export data management functionality
window.DataManagement = {
    state: DataManagementState,
    selectAll: selectAllRecords,
    clearSelection: clearSelection,
    editSelected: editSelectedRecords,
    deleteSelected: deleteSelectedRecords,
    duplicateSelected: duplicateSelectedRecords,
    applyBulkEdit: applyBulkEdit,
    undo: undoLastAction,
    redo: redoLastAction,
    refreshData: refreshDataManually,
    generateDrilldown: generateDrilldownStatistics,
    exportAnalysis: handleAnalysisExport,
    saveProfile: saveProfileSettings,
    applyAccessibility: applyAccessibilitySettings,
    applyColorScheme: applyColorScheme,
    selectTimePeriod: selectTimePeriod,
    createBackup: createManualBackup,
    utils: {
        convertToCSV: convertToCSV,
        downloadFile: downloadFile,
        formatDate: (date) => new Date(date).toLocaleDateString()
    }
};