/**
 * local-storage.js - Local storage management for task persistence and application state
 * Handles all localStorage operations with error handling and data validation
 */

class LocalStorageManager {
    constructor() {
        this.storageKey = 'todoAppData';
        this.backupKey = 'todoAppBackup';
        this.init();
    }

    // Initialize storage manager
    init() {
        this.migrateLegacyData();
        this.setupStorageListeners();
        console.log('Local Storage Manager initialized');
    }

    // Save complete application state to localStorage
    saveAppState(state) {
        try {
            const dataToSave = {
                tasks: state.tasks || [],
                settings: state.settings || {},
                filter: state.filter || 'all',
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };

            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            this.triggerSaveAnimation();
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showStorageError('Failed to save data');
            return false;
        }
    }

    // Load complete application state from localStorage
    loadAppState() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (!storedData) return null;

            const parsedData = JSON.parse(storedData);
            
            // Validate loaded data structure
            if (this.validateData(parsedData)) {
                return parsedData;
            } else {
                this.restoreFromBackup();
                return null;
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.showStorageError('Failed to load data');
            this.restoreFromBackup();
            return null;
        }
    }

    // Save only tasks to localStorage
    saveTasks(tasks) {
        try {
            const currentState = this.loadAppState() || {};
            currentState.tasks = tasks;
            currentState.lastUpdated = new Date().toISOString();
            
            localStorage.setItem(this.storageKey, JSON.stringify(currentState));
            this.createBackup(currentState);
            this.triggerSaveAnimation();
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showStorageError('Failed to save tasks');
            return false;
        }
    }

    // Load only tasks from localStorage
    loadTasks() {
        try {
            const state = this.loadAppState();
            return state?.tasks || [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    // Save application settings
    saveSettings(settings) {
        try {
            const currentState = this.loadAppState() || {};
            currentState.settings = { ...currentState.settings, ...settings };
            currentState.lastUpdated = new Date().toISOString();
            
            localStorage.setItem(this.storageKey, JSON.stringify(currentState));
            this.triggerSettingsSaveAnimation();
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStorageError('Failed to save settings');
            return false;
        }
    }

    // Load application settings
    loadSettings() {
        try {
            const state = this.loadAppState();
            return state?.settings || {};
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    }

    // Clear all application data
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            this.triggerClearAnimation();
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // Export data as JSON file
    exportData() {
        try {
            const data = this.loadAppState();
            if (!data) return false;

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = `todo-app-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.triggerExportAnimation();
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showStorageError('Failed to export data');
            return false;
        }
    }

    // Import data from JSON file
    importData(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        if (this.validateData(importedData)) {
                            this.createBackup(this.loadAppState());
                            localStorage.setItem(this.storageKey, JSON.stringify(importedData));
                            this.triggerImportAnimation();
                            resolve(true);
                        } else {
                            reject(new Error('Invalid data format'));
                        }
                    } catch (parseError) {
                        reject(parseError);
                    }
                };
                
                reader.onerror = () => reject(new Error('File reading error'));
                reader.readAsText(file);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Create backup of current state
    createBackup(data) {
        try {
            localStorage.setItem(this.backupKey, JSON.stringify({
                ...data,
                backupCreated: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }

    // Restore from backup if available
    restoreFromBackup() {
        try {
            const backup = localStorage.getItem(this.backupKey);
            if (backup) {
                const backupData = JSON.parse(backup);
                if (this.validateData(backupData)) {
                    localStorage.setItem(this.storageKey, backup);
                    this.showRestoreNotification();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return false;
        }
    }

    // Validate data structure
    validateData(data) {
        return data && 
               typeof data === 'object' &&
               Array.isArray(data.tasks) &&
               typeof data.settings === 'object' &&
               typeof data.lastUpdated === 'string';
    }

    // Check localStorage availability
    isStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get storage usage information
    getStorageInfo() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const size = data ? new Blob([data]).size : 0;
            const maxSize = 5 * 1024 * 1024; // 5MB typical limit
            
            return {
                used: size,
                max: maxSize,
                percentage: (size / maxSize) * 100
            };
        } catch (error) {
            return { used: 0, max: 0, percentage: 0 };
        }
    }

    // Migrate from legacy storage format
    migrateLegacyData() {
        try {
            const legacyTasks = localStorage.getItem('todoTasks');
            if (legacyTasks) {
                const tasks = JSON.parse(legacyTasks);
                this.saveTasks(tasks);
                localStorage.removeItem('todoTasks');
                console.log('Migrated legacy task data');
            }
        } catch (error) {
            console.error('Error migrating legacy data:', error);
        }
    }

    // Setup storage event listeners
    setupStorageListeners() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue) {
                this.showStorageChangeNotification();
            }
        });

        window.addEventListener('beforeunload', () => {
            this.createBackup(this.loadAppState() || {});
        });
    }

    // Animation: Save operation
    triggerSaveAnimation() {
        const saveBtn = document.getElementById('save-changes-button');
        if (saveBtn) {
            saveBtn.classList.add('saving');
            setTimeout(() => saveBtn.classList.remove('saving'), 1000);
        }
    }

    // Animation: Settings save
    triggerSettingsSaveAnimation() {
        const settingsBtn = document.getElementById('save-settings-button');
        if (settingsBtn) {
            settingsBtn.classList.add('saving');
            setTimeout(() => settingsBtn.classList.remove('saving'), 1000);
        }
    }

    // Animation: Export operation
    triggerExportAnimation() {
        const exportBtn = document.querySelector('[data-action="export"]');
        if (exportBtn) {
            exportBtn.classList.add('exporting');
            setTimeout(() => exportBtn.classList.remove('exporting'), 1000);
        }
    }

    // Animation: Import operation
    triggerImportAnimation() {
        const importBtn = document.querySelector('[data-action="import"]');
        if (importBtn) {
            importBtn.classList.add('importing');
            setTimeout(() => importBtn.classList.remove('importing'), 1000);
        }
    }

    // Animation: Clear operation
    triggerClearAnimation() {
        const clearBtn = document.querySelector('[data-action="clear"]');
        if (clearBtn) {
            clearBtn.classList.add('clearing');
            setTimeout(() => clearBtn.classList.remove('clearing'), 1000);
        }
    }

    // Show storage error notification
    showStorageError(message) {
        this.showNotification(message, 'error');
    }

    // Show restore notification
    showRestoreNotification() {
        this.showNotification('Data restored from backup', 'success');
    }

    // Show storage change notification
    showStorageChangeNotification() {
        this.showNotification('Data updated from another tab', 'info');
    }

    // Generic notification function
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `storage-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        notification.style.backgroundColor = type === 'error' ? '#dc3545' : 
                                           type === 'success' ? '#28a745' : '#17a2b8';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize storage manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.storageManager = new LocalStorageManager();
});