// settings.js - User settings and configuration management for Table Tennis Statistics Dashboard

// Settings state and configuration
const SettingsState = {
    currentTab: 'profile',
    unsavedChanges: false,
    settingsData: {
        profile: {},
        preferences: {},
        accessibility: {},
        notifications: {},
        dataManagement: {},
        exportSettings: {}
    },
    backupSettings: null,
    validationErrors: {}
};

// Initialize settings when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-page="settings"]')) {
        initializeSettings();
    }
});

// Listen for settings page loaded event
document.addEventListener('settingsLoaded', () => {
    initializeSettings();
});

// Core settings initialization
function initializeSettings() {
    console.log('Initializing Settings Module...');
    
    // Load all settings from storage
    loadAllSettings();
    
    // Initialize settings components
    initializeSettingsComponents();
    
    // Set up event listeners
    setupSettingsEventListeners();
    
    // Update UI with loaded settings
    updateSettingsUI();
    
    console.log('Settings Module initialized successfully');
}

// Load all settings from storage
function loadAllSettings() {
    SettingsState.settingsData = {
        profile: JSON.parse(localStorage.getItem('ttUserProfile') || '{}'),
        preferences: JSON.parse(localStorage.getItem('ttUserPreferences') || '{}'),
        accessibility: JSON.parse(localStorage.getItem('ttAccessibilitySettings') || '{}'),
        notifications: JSON.parse(localStorage.getItem('ttNotificationSettings') || '{}'),
        dataManagement: JSON.parse(localStorage.getItem('ttDataManagementSettings') || '{}'),
        exportSettings: JSON.parse(localStorage.getItem('ttExportSettings') || '{}')
    };
    
    // Create backup for cancel functionality
    SettingsState.backupSettings = JSON.parse(JSON.stringify(SettingsState.settingsData));
}

// Initialize settings components
function initializeSettingsComponents() {
    // Initialize user profile settings
    initializeUserProfileSettings();
    
    // Initialize export preferences
    initializeExportPreferences();
    
    // Initialize accessibility options
    initializeAccessibilityOptions();
    
    // Initialize notification settings
    initializeNotificationSettings();
    
    // Initialize data management settings
    initializeDataManagementSettings();
    
    // Initialize navigation and tabs
    initializeSettingsNavigation();
}

// Setup settings event listeners
function setupSettingsEventListeners() {
    // Tab navigation
    document.addEventListener('click', (e) => {
        if (e.target.matches('.settings-tab') || e.target.closest('.settings-tab')) {
            const tab = e.target.dataset.tab || e.target.closest('.settings-tab').dataset.tab;
            switchSettingsTab(tab);
        }
    });
    
    // Form input changes
    document.addEventListener('input', (e) => {
        if (e.target.matches('.setting-input')) {
            handleSettingChange(e.target);
        }
    });
    
    document.addEventListener('change', (e) => {
        if (e.target.matches('.setting-input')) {
            handleSettingChange(e.target);
        }
    });
    
    // Save and cancel buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('#save-settings')) {
            saveAllSettings();
        }
        
        if (e.target.matches('#cancel-changes')) {
            cancelChanges();
        }
        
        if (e.target.matches('#reset-to-defaults')) {
            resetToDefaults();
        }
        
        if (e.target.matches('#export-settings')) {
            exportSettings();
        }
        
        if (e.target.matches('#import-settings')) {
            importSettings();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveAllSettings();
        }
        
        if (e.key === 'Escape') {
            cancelChanges();
        }
    });
}

// Initialize user profile settings
function initializeUserProfileSettings() {
    const profileContainer = document.getElementById('user_profile_settings');
    if (!profileContainer) return;
    
    profileContainer.innerHTML = `
        <div class="settings-section">
            <h3>Personal Information</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="profile-name">Full Name</label>
                    <input type="text" id="profile-name" class="setting-input" data-category="profile" data-field="name" 
                           placeholder="Enter your full name">
                </div>
                <div class="form-group">
                    <label for="profile-email">Email Address</label>
                    <input type="email" id="profile-email" class="setting-input" data-category="profile" data-field="email" 
                           placeholder="Enter your email address">
                </div>
                <div class="form-group">
                    <label for="profile-phone">Phone Number</label>
                    <input type="tel" id="profile-phone" class="setting-input" data-category="profile" data-field="phone" 
                           placeholder="Enter your phone number">
                </div>
                <div class="form-group">
                    <label for="profile-location">Location</label>
                    <input type="text" id="profile-location" class="setting-input" data-category="profile" data-field="location" 
                           placeholder="Enter your location">
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Player Profile</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="profile-playing-style">Playing Style</label>
                    <select id="profile-playing-style" class="setting-input" data-category="profile" data-field="playingStyle">
                        <option value="">Select playing style</option>
                        <option value="offensive">Offensive</option>
                        <option value="defensive">Defensive</option>
                        <option value="allround">All-round</option>
                        <option value="serve-specialist">Serve Specialist</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="profile-dominant-hand">Dominant Hand</label>
                    <select id="profile-dominant-hand" class="setting-input" data-category="profile" data-field="dominantHand">
                        <option value="">Select dominant hand</option>
                        <option value="right">Right-handed</option>
                        <option value="left">Left-handed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="profile-skill-level">Skill Level</label>
                    <select id="profile-skill-level" class="setting-input" data-category="profile" data-field="skillLevel">
                        <option value="">Select skill level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="profile-years-playing">Years Playing</label>
                    <input type="number" id="profile-years-playing" class="setting-input" data-category="profile" data-field="yearsPlaying" 
                           min="0" max="50" placeholder="Years of experience">
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Profile Preferences</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="profile-language">Language</label>
                    <select id="profile-language" class="setting-input" data-category="profile" data-field="language">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="profile-timezone">Timezone</label>
                    <select id="profile-timezone" class="setting-input" data-category="profile" data-field="timezone">
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time (EST)</option>
                        <option value="PST">Pacific Time (PST)</option>
                        <option value="CET">Central European Time (CET)</option>
                        <option value="GMT">Greenwich Mean Time (GMT)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="profile-date-format">Date Format</label>
                    <select id="profile-date-format" class="setting-input" data-category="profile" data-field="dateFormat">
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="profile-currency">Currency</label>
                    <select id="profile-currency" class="setting-input" data-category="profile" data-field="currency">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Profile Photo</h3>
            <div class="profile-photo-section">
                <div class="photo-preview" id="profile-photo-preview">
                    <div class="photo-placeholder">
                        <i class="user-icon"></i>
                    </div>
                </div>
                <div class="photo-controls">
                    <button type="button" class="btn btn-outline" id="upload-photo">
                        <i class="upload-icon"></i>
                        Upload Photo
                    </button>
                    <button type="button" class="btn btn-outline" id="remove-photo">
                        <i class="delete-icon"></i>
                        Remove Photo
                    </button>
                </div>
                <input type="file" id="photo-upload-input" accept="image/*" style="display: none;">
            </div>
        </div>
    `;
    
    // Add event listeners for photo upload
    const uploadBtn = profileContainer.querySelector('#upload-photo');
    const removeBtn = profileContainer.querySelector('#remove-photo');
    const fileInput = profileContainer.querySelector('#photo-upload-input');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', removeProfilePhoto);
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handlePhotoUpload);
    }
}

// Initialize export preferences
function initializeExportPreferences() {
    const exportContainer = document.getElementById('export_preferences');
    if (!exportContainer) return;
    
    exportContainer.innerHTML = `
        <div class="settings-section">
            <h3>Default Export Settings</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="export-default-format">Default Format</label>
                    <select id="export-default-format" class="setting-input" data-category="exportSettings" data-field="defaultFormat">
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                        <option value="xlsx">Excel</option>
                        <option value="pdf">PDF</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="export-compression">Compression Level</label>
                    <select id="export-compression" class="setting-input" data-category="exportSettings" data-field="compressionLevel">
                        <option value="none">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="export-quality">Export Quality</label>
                    <select id="export-quality" class="setting-input" data-category="exportSettings" data-field="quality">
                        <option value="standard">Standard</option>
                        <option value="high">High</option>
                        <option value="maximum">Maximum</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Export Content Options</h3>
            <div class="checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="exportSettings" data-field="includeMetadata" checked>
                    <span>Include metadata</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="exportSettings" data-field="includeCharts" checked>
                    <span>Include charts</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="exportSettings" data-field="includeStatistics" checked>
                    <span>Include statistics</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="exportSettings" data-field="includeRawData">
                    <span>Include raw data</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="exportSettings" data-field="timestampFilenames" checked>
                    <span>Add timestamp to filenames</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="exportSettings" data-field="compressExports">
                    <span>Compress exports (ZIP)</span>
                </label>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Export Automation</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="export-auto-save">Auto-save Exports</label>
                    <select id="export-auto-save" class="setting-input" data-category="exportSettings" data-field="autoSave">
                        <option value="never">Never</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="export-backup-location">Backup Location</label>
                    <select id="export-backup-location" class="setting-input" data-category="exportSettings" data-field="backupLocation">
                        <option value="local">Local Storage</option>
                        <option value="cloud">Cloud Storage</option>
                        <option value="both">Both</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="export-retention">Data Retention</label>
                    <select id="export-retention" class="setting-input" data-category="exportSettings" data-field="retentionPeriod">
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="365">1 year</option>
                        <option value="forever">Keep forever</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Export Templates</h3>
            <div class="template-management">
                <div class="template-list" id="export-templates-list">
                    <div class="template-item">
                        <span class="template-name">Standard Report</span>
                        <div class="template-actions">
                            <button class="btn btn-sm btn-outline">Edit</button>
                            <button class="btn btn-sm btn-outline">Delete</button>
                        </div>
                    </div>
                    <div class="template-item">
                        <span class="template-name">Detailed Analysis</span>
                        <div class="template-actions">
                            <button class="btn btn-sm btn-outline">Edit</button>
                            <button class="btn btn-sm btn-outline">Delete</button>
                        </div>
                    </div>
                </div>
                <button class="btn btn-outline" id="create-template">
                    <i class="add-icon"></i>
                    Create New Template
                </button>
            </div>
        </div>
    `;
    
    // Add event listener for template creation
    const createBtn = exportContainer.querySelector('#create-template');
    if (createBtn) {
        createBtn.addEventListener('click', createExportTemplate);
    }
}

// Initialize accessibility options
function initializeAccessibilityOptions() {
    const accessibilityContainer = document.getElementById('accessibility_options');
    if (!accessibilityContainer) return;
    
    accessibilityContainer.innerHTML = `
        <div class="settings-section">
            <h3>Visual Accessibility</h3>
            <div class="checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="highContrastMode">
                    <span>High contrast mode</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="largeText">
                    <span>Large text size</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="reduceMotion">
                    <span>Reduce motion and animations</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="colorBlindMode">
                    <span>Color blind friendly mode</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="simplifiedLayout">
                    <span>Simplified layout</span>
                </label>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Navigation & Interaction</h3>
            <div class="checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="keyboardNavigation" checked>
                    <span>Enhanced keyboard navigation</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="focusIndicators" checked>
                    <span>Visible focus indicators</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="skipToContent">
                    <span>Skip to content links</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="tabIndexManagement">
                    <span>Smart tab index management</span>
                </label>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Screen Reader Support</h3>
            <div class="checkbox-group">
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="ariaLabels" checked>
                    <span>ARIA labels and roles</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="liveRegions">
                    <span>Live regions for dynamic content</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="altText">
                    <span>Automatic alt text for images</span>
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" class="setting-input" data-category="accessibility" data-field="screenReaderOptimized">
                    <span>Screen reader optimized layout</span>
                </label>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Customization</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="accessibility-font-size">Font Size</label>
                    <select id="accessibility-font-size" class="setting-input" data-category="accessibility" data-field="fontSize">
                        <option value="normal">Normal</option>
                        <option value="large">Large</option>
                        <option value="x-large">Extra Large</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="accessibility-line-height">Line Height</label>
                    <select id="accessibility-line-height" class="setting-input" data-category="accessibility" data-field="lineHeight">
                        <option value="normal">Normal</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="accessibility-color-scheme">Color Scheme</label>
                    <select id="accessibility-color-scheme" class="setting-input" data-category="accessibility" data-field="colorScheme">
                        <option value="default">Default</option>
                        <option value="high-contrast">High Contrast</option>
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="accessibility-animation">Animation Level</label>
                    <select id="accessibility-animation" class="setting-input" data-category="accessibility" data-field="animationLevel">
                        <option value="full">Full animations</option>
                        <option value="reduced">Reduced animations</option>
                        <option value="none">No animations</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="settings-section">
            <h3>Accessibility Shortcuts</h3>
            <div class="shortcut-list">
                <div class="shortcut-item">
                    <kbd>Alt</kbd> + <kbd>A</kbd>
                    <span>Toggle accessibility mode</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Alt</kbd> + <kbd>H</kbd>
                    <span>High contrast toggle</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Alt</kbd> + <kbd>L</kbd>
                    <span>Large text toggle</span>
                </div>
                <div class="shortcut-item">
                    <kbd>Alt</kbd> + <kbd>M</kbd>
                    <span>Reduce motion toggle</span>
                </div>
            </div>
        </div>
    `;
}

// Initialize notification settings
function initializeNotificationSettings() {
    // This would be implemented similarly to other settings sections
    // Placeholder for notification settings initialization
}

// Initialize data management settings
function initializeDataManagementSettings() {
    // This would be implemented similarly to other settings sections
    // Placeholder for data management settings initialization
}

// Initialize settings navigation
function initializeSettingsNavigation() {
    const navContainer = document.getElementById('dashboard_navigation_menu');
    if (!navContainer) return;
    
    navContainer.innerHTML = `
        <div class="settings-navigation">
            <h3>Settings Categories</h3>
            <nav class="settings-nav">
                <button class="settings-tab active" data-tab="profile">
                    <i class="profile-icon"></i>
                    <span>Profile</span>
                </button>
                <button class="settings-tab" data-tab="export">
                    <i class="export-icon"></i>
                    <span>Export</span>
                </button>
                <button class="settings-tab" data-tab="accessibility">
                    <i class="accessibility-icon"></i>
                    <span>Accessibility</span>
                </button>
                <button class="settings-tab" data-tab="notifications">
                    <i class="notification-icon"></i>
                    <span>Notifications</span>
                </button>
                <button class="settings-tab" data-tab="data">
                    <i class="data-icon"></i>
                    <span>Data Management</span>
                </button>
                <button class="settings-tab" data-tab="advanced">
                    <i class="advanced-icon"></i>
                    <span>Advanced</span>
                </button>
            </nav>
            
            <div class="settings-actions">
                <button class="btn btn-primary" id="save-settings" disabled>
                    <i class="save-icon"></i>
                    Save Changes
                </button>
                <button class="btn btn-secondary" id="cancel-changes" disabled>
                    Cancel
                </button>
                <button class="btn btn-outline" id="reset-to-defaults">
                    Reset to Defaults
                </button>
                <div class="action-divider"></div>
                <button class="btn btn-outline" id="export-settings">
                    Export Settings
                </button>
                <button class="btn btn-outline" id="import-settings">
                    Import Settings
                </button>
            </div>
            
            <div class="settings-status" id="settings-status">
                <span class="status-message">All settings saved</span>
                <span class="unsaved-indicator" style="display: none;">Unsaved changes</span>
            </div>
        </div>
    `;
    
    // Add event listeners to tabs
    navContainer.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchSettingsTab(tab.dataset.tab);
        });
    });
}

// Switch settings tabs
function switchSettingsTab(tabName) {
    if (SettingsState.currentTab === tabName) return;
    
    // Hide current tab
    const currentTab = document.querySelector(`.settings-content[data-tab="${SettingsState.currentTab}"]`);
    if (currentTab) {
        App.utils.fadeOut(currentTab, 200, () => {
            currentTab.style.display = 'none';
        });
    }
    
    // Show new tab
    const newTab = document.querySelector(`.settings-content[data-tab="${tabName}"]`);
    if (newTab) {
        newTab.style.display = 'block';
        App.utils.fadeIn(newTab, 200);
        
        // Update active tab styling
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.settings-tab[data-tab="${tabName}"]`).classList.add('active');
        
        SettingsState.currentTab = tabName;
    }
}

// Handle setting changes
function handleSettingChange(input) {
    const category = input.dataset.category;
    const field = input.dataset.field;
    let value;
    
    if (input.type === 'checkbox') {
        value = input.checked;
    } else if (input.type === 'number') {
        value = parseFloat(input.value) || 0;
    } else {
        value = input.value;
    }
    
    // Update settings data
    if (!SettingsState.settingsData[category]) {
        SettingsState.settingsData[category] = {};
    }
    SettingsState.settingsData[category][field] = value;
    
    // Mark as unsaved
    SettingsState.unsavedChanges = true;
    updateSaveButton();
    
    // Validate specific fields if needed
    validateSetting(category, field, value);
    
    // Apply changes immediately for certain settings
    applyImmediateSetting(category, field, value);
}

// Validate setting
function validateSetting(category, field, value) {
    const errors = SettingsState.validationErrors[category] || {};
    
    // Clear previous error
    delete errors[field];
    
    // Add validation logic for specific fields
    if (field === 'email' && value && !isValidEmail(value)) {
        errors[field] = 'Please enter a valid email address';
    }
    
    if (field === 'phone' && value && !isValidPhone(value)) {
        errors[field] = 'Please enter a valid phone number';
    }
    
    if (field === 'yearsPlaying' && (value < 0 || value > 100)) {
        errors[field] = 'Years playing must be between 0 and 100';
    }
    
    // Update validation errors
    if (Object.keys(errors).length > 0) {
        SettingsState.validationErrors[category] = errors;
    } else {
        delete SettingsState.validationErrors[category];
    }
    
    // Update UI with validation errors
    updateValidationUI();
}

// Apply immediate setting changes
function applyImmediateSetting(category, field, value) {
    // Apply accessibility settings immediately
    if (category === 'accessibility') {
        applyAccessibilitySetting(field, value);
    }
    
    // Apply theme/color settings immediately
    if (field === 'colorScheme') {
        applyColorScheme(value);
    }
    
    // Apply language settings immediately
    if (field === 'language') {
        applyLanguage(value);
    }
}

// Apply accessibility setting
function applyAccessibilitySetting(field, value) {
    switch(field) {
        case 'highContrastMode':
            document.body.classList.toggle('high-contrast', value);
            break;
        case 'largeText':
            document.body.classList.toggle('large-text', value);
            break;
        case 'reduceMotion':
            if (value) {
                document.documentElement.style.setProperty('--animation-duration', '0.01s');
            } else {
                document.documentElement.style.removeProperty('--animation-duration');
            }
            break;
        case 'colorBlindMode':
            document.body.classList.toggle('color-blind', value);
            break;
        case 'fontSize':
            applyFontSize(value);
            break;
    }
}

// Apply color scheme
function applyColorScheme(scheme) {
    document.body.className = document.body.className.replace(/\btheme-\S+/g, '');
    document.body.classList.add(`theme-${scheme}`);
    
    // Update chart colors if charts exist
    if (window.Dashboard && window.Dashboard.updateChartThemes) {
        window.Dashboard.updateChartThemes();
    }
}

// Apply language
function applyLanguage(language) {
    // This would trigger language change throughout the app
    console.log(`Language changed to: ${language}`);
    // In a real app, this would dispatch an event and update all text content
}

// Apply font size
function applyFontSize(size) {
    const sizes = {
        'normal': '16px',
        'large': '18px',
        'x-large': '20px'
    };
    
    document.documentElement.style.setProperty('--base-font-size', sizes[size] || '16px');
}

// Update save button state
function updateSaveButton() {
    const saveBtn = document.getElementById('save-settings');
    const cancelBtn = document.getElementById('cancel-changes');
    const status = document.getElementById('settings-status');
    
    if (saveBtn && cancelBtn && status) {
        saveBtn.disabled = !SettingsState.unsavedChanges;
        cancelBtn.disabled = !SettingsState.unsavedChanges;
        
        const unsavedIndicator = status.querySelector('.unsaved-indicator');
        const statusMessage = status.querySelector('.status-message');
        
        if (SettingsState.unsavedChanges) {
            unsavedIndicator.style.display = 'inline';
            statusMessage.style.display = 'none';
        } else {
            unsavedIndicator.style.display = 'none';
            statusMessage.style.display = 'inline';
        }
    }
}

// Update validation UI
function updateValidationUI() {
    // Clear all validation messages
    document.querySelectorAll('.validation-error').forEach(el => {
        el.remove();
    });
    
    document.querySelectorAll('.has-error').forEach(el => {
        el.classList.remove('has-error');
    });
    
    // Add new validation messages
    Object.keys(SettingsState.validationErrors).forEach(category => {
        Object.keys(SettingsState.validationErrors[category]).forEach(field => {
            const error = SettingsState.validationErrors[category][field];
            const input = document.querySelector(`[data-category="${category}"][data-field="${field}"]`);
            
            if (input) {
                const parent = input.closest('.form-group');
                if (parent) {
                    parent.classList.add('has-error');
                    
                    let errorElement = parent.querySelector('.validation-error');
                    if (!errorElement) {
                        errorElement = document.createElement('div');
                        errorElement.className = 'validation-error';
                        parent.appendChild(errorElement);
                    }
                    
                    errorElement.textContent = error;
                }
            }
        });
    });
}

// Update settings UI with loaded values
function updateSettingsUI() {
    // Update all input fields with saved values
    document.querySelectorAll('.setting-input').forEach(input => {
        const category = input.dataset.category;
        const field = input.dataset.field;
        
        if (SettingsState.settingsData[category] && SettingsState.settingsData[category][field] !== undefined) {
            const value = SettingsState.settingsData[category][field];
            
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
            
            // Apply immediate settings for certain fields
            applyImmediateSetting(category, field, value);
        }
    });
    
    // Update profile photo if exists
    updateProfilePhoto();
    
    // Reset unsaved changes state
    SettingsState.unsavedChanges = false;
    updateSaveButton();
}

// Update profile photo
function updateProfilePhoto() {
    const photoPreview = document.getElementById('profile-photo-preview');
    if (!photoPreview) return;
    
    const photoData = SettingsState.settingsData.profile.profilePhoto;
    
    if (photoData) {
        photoPreview.innerHTML = `
            <img src="${photoData}" alt="Profile photo" class="profile-photo">
        `;
    } else {
        photoPreview.innerHTML = `
            <div class="photo-placeholder">
                <i class="user-icon"></i>
            </div>
        `;
    }
}

// Handle photo upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        App.showNotification('Please select an image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        App.showNotification('Image must be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Update settings
        SettingsState.settingsData.profile.profilePhoto = imageData;
        SettingsState.unsavedChanges = true;
        updateSaveButton();
        
        // Update preview
        updateProfilePhoto();
        
        App.showNotification('Profile photo updated', 'success');
    };
    
    reader.onerror = function() {
        App.showNotification('Error reading image file', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Remove profile photo
function removeProfilePhoto() {
    if (!SettingsState.settingsData.profile.profilePhoto) {
        App.showNotification('No profile photo to remove', 'info');
        return;
    }
    
    delete SettingsState.settingsData.profile.profilePhoto;
    SettingsState.unsavedChanges = true;
    updateSaveButton();
    
    updateProfilePhoto();
    App.showNotification('Profile photo removed', 'success');
}

// Create export template
function createExportTemplate() {
    const modal = document.getElementById('template-modal') || createTemplateModal();
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Create Export Template</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="template-form">
                    <div class="form-group">
                        <label for="template-name">Template Name</label>
                        <input type="text" id="template-name" required placeholder="Enter template name">
                    </div>
                    <div class="form-group">
                        <label for="template-description">Description</label>
                        <textarea id="template-description" placeholder="Describe this template..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="template-format">Export Format</label>
                        <select id="template-format">
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                            <option value="xlsx">Excel</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    <div class="checkbox-group">
                        <h4>Include in Export</h4>
                        <label class="checkbox-label">
                            <input type="checkbox" name="include-data" checked>
                            <span>Raw data</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="include-charts" checked>
                            <span>Charts</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="include-stats" checked>
                            <span>Statistics</span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="include-metadata">
                            <span>Metadata</span>
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary close-modal">Cancel</button>
                <button class="btn btn-primary" id="save-template">Save Template</button>
            </div>
        </div>
    `;
    
    App.utils.fadeIn(modal);
    
    // Add event listeners
    modal.querySelector('#save-template').addEventListener('click', saveTemplate);
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            App.utils.fadeOut(modal);
        });
    });
}

function saveTemplate() {
    const form = document.getElementById('template-form');
    if (!form) return;
    
    const name = form.querySelector('#template-name').value;
    if (!name) {
        App.showNotification('Please enter a template name', 'error');
        return;
    }
    
    // Save template logic would go here
    App.showNotification(`Template "${name}" created successfully`, 'success');
    
    // Close modal
    const modal = document.getElementById('template-modal');
    if (modal) {
        App.utils.fadeOut(modal);
    }
}

// Save all settings
function saveAllSettings() {
    // Validate all settings before saving
    if (!validateAllSettings()) {
        App.showNotification('Please fix validation errors before saving', 'error');
        return;
    }
    
    // Save each category to localStorage
    Object.keys(SettingsState.settingsData).forEach(category => {
        localStorage.setItem(`tt${category.charAt(0).toUpperCase() + category.slice(1)}`, 
                            JSON.stringify(SettingsState.settingsData[category]));
    });
    
    // Update backup
    SettingsState.backupSettings = JSON.parse(JSON.stringify(SettingsState.settingsData));
    
    // Reset unsaved changes
    SettingsState.unsavedChanges = false;
    updateSaveButton();
    
    // Apply all settings
    applyAllSettings();
    
    App.showNotification('Settings saved successfully', 'success');
}

// Validate all settings
function validateAllSettings() {
    // Clear previous validation
    SettingsState.validationErrors = {};
    
    // Validate each field
    document.querySelectorAll('.setting-input').forEach(input => {
        const category = input.dataset.category;
        const field = input.dataset.field;
        let value;
        
        if (input.type === 'checkbox') {
            value = input.checked;
        } else if (input.type === 'number') {
            value = parseFloat(input.value) || 0;
        } else {
            value = input.value;
        }
        
        validateSetting(category, field, value);
    });
    
    // Check if there are any validation errors
    return Object.keys(SettingsState.validationErrors).length === 0;
}

// Apply all settings
function applyAllSettings() {
    // Apply accessibility settings
    if (SettingsState.settingsData.accessibility) {
        Object.keys(SettingsState.settingsData.accessibility).forEach(field => {
            applyAccessibilitySetting(field, SettingsState.settingsData.accessibility[field]);
        });
    }
    
    // Apply color scheme if specified
    if (SettingsState.settingsData.profile?.colorScheme) {
        applyColorScheme(SettingsState.settingsData.profile.colorScheme);
    }
    
    // Apply language if specified
    if (SettingsState.settingsData.profile?.language) {
        applyLanguage(SettingsState.settingsData.profile.language);
    }
    
    // Notify other modules about settings changes
    document.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: { settings: SettingsState.settingsData }
    }));
}

// Cancel changes
function cancelChanges() {
    if (!SettingsState.unsavedChanges) {
        App.showNotification('No changes to cancel', 'info');
        return;
    }
    
    if (confirm('Discard all unsaved changes?')) {
        // Restore from backup
        SettingsState.settingsData = JSON.parse(JSON.stringify(SettingsState.backupSettings));
        
        // Update UI
        updateSettingsUI();
        
        // Revert applied settings
        applyAllSettings();
        
        App.showNotification('Changes discarded', 'info');
    }
}

// Reset to defaults
function resetToDefaults() {
    if (confirm('Reset all settings to default values? This cannot be undone.')) {
        // Define default settings
        const defaultSettings = {
            profile: {
                language: 'en',
                timezone: 'UTC',
                dateFormat: 'MM/DD/YYYY',
                currency: 'USD'
            },
            preferences: {
                theme: 'light',
                itemsPerPage: 25,
                autoRefresh: false
            },
            accessibility: {
                highContrastMode: false,
                largeText: false,
                reduceMotion: false,
                keyboardNavigation: true
            },
            exportSettings: {
                defaultFormat: 'csv',
                includeMetadata: true,
                includeCharts: true,
                timestampFilenames: true
            }
        };
        
        // Merge defaults with current structure
        Object.keys(defaultSettings).forEach(category => {
            SettingsState.settingsData[category] = {
                ...SettingsState.settingsData[category],
                ...defaultSettings[category]
            };
        });
        
        SettingsState.unsavedChanges = true;
        updateSettingsUI();
        updateSaveButton();
        
        App.showNotification('Settings reset to defaults', 'success');
    }
}

// Export settings
function exportSettings() {
    const settingsData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings: SettingsState.settingsData
    };
    
    const dataStr = JSON.stringify(settingsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `table-tennis-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    App.showNotification('Settings exported successfully', 'success');
}

// Import settings
function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedSettings = JSON.parse(e.target.result);
                
                if (!importedSettings.settings || !importedSettings.version) {
                    throw new Error('Invalid settings file format');
                }
                
                if (confirm('Replace current settings with imported settings?')) {
                    SettingsState.settingsData = importedSettings.settings;
                    SettingsState.unsavedChanges = true;
                    
                    updateSettingsUI();
                    updateSaveButton();
                    
                    App.showNotification('Settings imported successfully', 'success');
                }
            } catch (error) {
                App.showNotification('Error importing settings: ' + error.message, 'error');
            }
        };
        
        reader.onerror = function() {
            App.showNotification('Error reading settings file', 'error');
        };
        
        reader.readAsText(file);
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function createTemplateModal() {
    const modal = document.createElement('div');
    modal.id = 'template-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
    return modal;
}

// Export settings functionality
window.Settings = {
    state: SettingsState,
    save: saveAllSettings,
    cancel: cancelChanges,
    reset: resetToDefaults,
    export: exportSettings,
    import: importSettings,
    utils: {
        isValidEmail: isValidEmail,
        isValidPhone: isValidPhone
    }
};