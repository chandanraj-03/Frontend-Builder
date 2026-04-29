/**
 * settings.js - Settings and configuration management for application preferences
 * Handles theme selection, accessibility options, notifications, and user preferences
 */

class SettingsManager {
    constructor() {
        this.settings = {
            theme: 'light',
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                fontSize: 'normal',
                keyboardNavigation: true
            },
            notifications: {
                enabled: true,
                sound: true,
                completionAlerts: true,
                reminderFrequency: 'daily'
            },
            appearance: {
                compactMode: false,
                showAnimations: true,
                taskDensity: 'comfortable'
            },
            data: {
                autoBackup: true,
                backupFrequency: 'weekly',
                exportFormat: 'json'
            },
            general: {
                language: 'en',
                timeFormat: '12h',
                firstDayOfWeek: 'sunday'
            }
        };
        this.init();
    }

    // Initialize settings manager
    init() {
        this.loadSettings();
        this.applySettings();
        this.setupSettingsListeners();
        console.log('Settings Manager initialized');
    }

    // Load settings from localStorage
    loadSettings() {
        try {
            const storedSettings = localStorage.getItem('appSettings');
            if (storedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('appSettings', JSON.stringify(this.settings));
            this.showSaveConfirmation();
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showSaveError();
            return false;
        }
    }

    // Apply all current settings to the application
    applySettings() {
        this.applyTheme();
        this.applyAccessibilitySettings();
        this.applyAppearanceSettings();
        this.setupNotifications();
        this.updateSettingsUI();
    }

    // Apply theme settings
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // Add smooth transition for theme change
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }

    // Apply accessibility settings
    applyAccessibilitySettings() {
        const root = document.documentElement;
        
        // High contrast
        root.classList.toggle('high-contrast', this.settings.accessibility.highContrast);
        
        // Reduced motion
        root.classList.toggle('reduced-motion', this.settings.accessibility.reducedMotion);
        
        // Font size
        root.style.fontSize = this.getFontSizeValue(this.settings.accessibility.fontSize);
        
        // Keyboard navigation
        if (this.settings.accessibility.keyboardNavigation) {
            this.enableKeyboardNavigation();
        } else {
            this.disableKeyboardNavigation();
        }
    }

    // Apply appearance settings
    applyAppearanceSettings() {
        const root = document.documentElement;
        
        // Compact mode
        root.classList.toggle('compact-mode', this.settings.appearance.compactMode);
        
        // Animations
        root.classList.toggle('animations-enabled', this.settings.appearance.showAnimations);
        
        // Task density
        root.setAttribute('data-density', this.settings.appearance.taskDensity);
    }

    // Get font size value from setting
    getFontSizeValue(size) {
        const sizes = {
            'small': '14px',
            'normal': '16px',
            'large': '18px',
            'x-large': '20px'
        };
        return sizes[size] || sizes.normal;
    }

    // Enable keyboard navigation
    enableKeyboardNavigation() {
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        this.addFocusStyles();
    }

    // Disable keyboard navigation
    disableKeyboardNavigation() {
        document.removeEventListener('keydown', this.handleKeyboardNavigation.bind(this));
        this.removeFocusStyles();
    }

    // Handle keyboard navigation
    handleKeyboardNavigation(e) {
        // Tab navigation
        if (e.key === 'Tab') {
            this.handleTabNavigation(e);
        }
        
        // Escape key
        if (e.key === 'Escape') {
            this.handleEscapeKey();
        }
        
        // Enter key for buttons
        if (e.key === 'Enter' && e.target.matches('button, [role="button"]')) {
            e.target.click();
        }
    }

    // Handle tab navigation
    handleTabNavigation(e) {
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        if (e.shiftKey) {
            // Shift + Tab: move backward
            if (currentIndex === 0) {
                focusableElements[focusableElements.length - 1].focus();
                e.preventDefault();
            }
        } else {
            // Tab: move forward
            if (currentIndex === focusableElements.length - 1) {
                focusableElements[0].focus();
                e.preventDefault();
            }
        }
    }

    // Handle escape key
    handleEscapeKey() {
        // Close any open modals or dropdowns
        const openModals = document.querySelectorAll('.modal.open, .dropdown.open');
        openModals.forEach(modal => {
            modal.classList.remove('open');
        });
        
        // Focus on first focusable element
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    // Get all focusable elements
    getFocusableElements() {
        return Array.from(document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && el.offsetParent !== null);
    }

    // Add focus styles for keyboard navigation
    addFocusStyles() {
        const style = document.createElement('style');
        style.id = 'keyboard-focus-styles';
        style.textContent = `
            *:focus-visible {
                outline: 2px solid #007bff;
                outline-offset: 2px;
            }
            
            .button:focus-visible,
            button:focus-visible {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    // Remove focus styles
    removeFocusStyles() {
        const style = document.getElementById('keyboard-focus-styles');
        if (style) {
            style.remove();
        }
    }

    // Setup notification system
    setupNotifications() {
        if (this.settings.notifications.enabled && 'Notification' in window) {
            this.requestNotificationPermission();
        }
    }

    // Request notification permission
    requestNotificationPermission() {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('Notifications enabled!', 'success');
                }
            });
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (!this.settings.notifications.enabled) return;

        if (Notification.permission === 'granted') {
            new Notification('Todo App', {
                body: message,
                icon: '/icon-192.png'
            });
        }
        
        // Fallback to in-app notification
        this.showInAppNotification(message, type);
    }

    // Show in-app notification
    showInAppNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `app-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }

    // Remove notification
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }

    // Setup settings event listeners
    setupSettingsListeners() {
        this.setupThemeSelector();
        this.setupAccessibilitySettings();
        this.setupNotificationSettings();
        this.setupAppearanceSettings();
        this.setupDataSettings();
        this.setupSaveButtons();
    }

    // Setup theme selector
    setupThemeSelector() {
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = this.settings.theme;
            themeSelector.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme();
                this.saveSettings();
            });
        }
    }

    // Setup accessibility settings
    setupAccessibilitySettings() {
        const accessibilitySettings = document.getElementById('accessibility-settings');
        if (!accessibilitySettings) return;

        // High contrast toggle
        const highContrast = accessibilitySettings.querySelector('[name="high-contrast"]');
        if (highContrast) {
            highContrast.checked = this.settings.accessibility.highContrast;
            highContrast.addEventListener('change', (e) => {
                this.settings.accessibility.highContrast = e.target.checked;
                this.applyAccessibilitySettings();
                this.saveSettings();
            });
        }

        // Reduced motion toggle
        const reducedMotion = accessibilitySettings.querySelector('[name="reduced-motion"]');
        if (reducedMotion) {
            reducedMotion.checked = this.settings.accessibility.reducedMotion;
            reducedMotion.addEventListener('change', (e) => {
                this.settings.accessibility.reducedMotion = e.target.checked;
                this.applyAccessibilitySettings();
                this.saveSettings();
            });
        }

        // Font size selector
        const fontSize = accessibilitySettings.querySelector('[name="font-size"]');
        if (fontSize) {
            fontSize.value = this.settings.accessibility.fontSize;
            fontSize.addEventListener('change', (e) => {
                this.settings.accessibility.fontSize = e.target.value;
                this.applyAccessibilitySettings();
                this.saveSettings();
            });
        }

        // Keyboard navigation toggle
        const keyboardNav = accessibilitySettings.querySelector('[name="keyboard-navigation"]');
        if (keyboardNav) {
            keyboardNav.checked = this.settings.accessibility.keyboardNavigation;
            keyboardNav.addEventListener('change', (e) => {
                this.settings.accessibility.keyboardNavigation = e.target.checked;
                this.applyAccessibilitySettings();
                this.saveSettings();
            });
        }
    }

    // Setup notification settings
    setupNotificationSettings() {
        const notificationSettings = document.getElementById('notification-settings');
        if (!notificationSettings) return;

        // Notification toggle
        const notifications = notificationSettings.querySelector('[name="notifications"]');
        if (notifications) {
            notifications.checked = this.settings.notifications.enabled;
            notifications.addEventListener('change', (e) => {
                this.settings.notifications.enabled = e.target.checked;
                this.setupNotifications();
                this.saveSettings();
            });
        }

        // Sound toggle
        const sound = notificationSettings.querySelector('[name="sound"]');
        if (sound) {
            sound.checked = this.settings.notifications.sound;
            sound.addEventListener('change', (e) => {
                this.settings.notifications.sound = e.target.checked;
                this.saveSettings();
            });
        }

        // Completion alerts toggle
        const completionAlerts = notificationSettings.querySelector('[name="completion-alerts"]');
        if (completionAlerts) {
            completionAlerts.checked = this.settings.notifications.completionAlerts;
            completionAlerts.addEventListener('change', (e) => {
                this.settings.notifications.completionAlerts = e.target.checked;
                this.saveSettings();
            });
        }

        // Reminder frequency
        const reminderFrequency = notificationSettings.querySelector('[name="reminder-frequency"]');
        if (reminderFrequency) {
            reminderFrequency.value = this.settings.notifications.reminderFrequency;
            reminderFrequency.addEventListener('change', (e) => {
                this.settings.notifications.reminderFrequency = e.target.value;
                this.saveSettings();
            });
        }
    }

    // Setup appearance settings
    setupAppearanceSettings() {
        const appearanceSettings = document.querySelector('.appearance-settings');
        if (!appearanceSettings) return;

        // Compact mode toggle
        const compactMode = appearanceSettings.querySelector('[name="compact-mode"]');
        if (compactMode) {
            compactMode.checked = this.settings.appearance.compactMode;
            compactMode.addEventListener('change', (e) => {
                this.settings.appearance.compactMode = e.target.checked;
                this.applyAppearanceSettings();
                this.saveSettings();
            });
        }

        // Animations toggle
        const animations = appearanceSettings.querySelector('[name="animations"]');
        if (animations) {
            animations.checked = this.settings.appearance.showAnimations;
            animations.addEventListener('change', (e) => {
                this.settings.appearance.showAnimations = e.target.checked;
                this.applyAppearanceSettings();
                this.saveSettings();
            });
        }

        // Task density selector
        const taskDensity = appearanceSettings.querySelector('[name="task-density"]');
        if (taskDensity) {
            taskDensity.value = this.settings.appearance.taskDensity;
            taskDensity.addEventListener('change', (e) => {
                this.settings.appearance.taskDensity = e.target.value;
                this.applyAppearanceSettings();
                this.saveSettings();
            });
        }
    }

    // Setup data settings
    setupDataSettings() {
        const dataSettings = document.querySelector('.data-settings');
        if (!dataSettings) return;

        // Auto backup toggle
        const autoBackup = dataSettings.querySelector('[name="auto-backup"]');
        if (autoBackup) {
            autoBackup.checked = this.settings.data.autoBackup;
            autoBackup.addEventListener('change', (e) => {
                this.settings.data.autoBackup = e.target.checked;
                this.saveSettings();
            });
        }

        // Backup frequency
        const backupFrequency = dataSettings.querySelector('[name="backup-frequency"]');
        if (backupFrequency) {
            backupFrequency.value = this.settings.data.backupFrequency;
            backupFrequency.addEventListener('change', (e) => {
                this.settings.data.backupFrequency = e.target.value;
                this.saveSettings();
            });
        }

        // Export format
        const exportFormat = dataSettings.querySelector('[name="export-format"]');
        if (exportFormat) {
            exportFormat.value = this.settings.data.exportFormat;
            exportFormat.addEventListener('change', (e) => {
                this.settings.data.exportFormat = e.target.value;
                this.saveSettings();
            });
        }
    }

    // Setup save buttons
    setupSaveButtons() {
        const saveSettingsBtn = document.getElementById('save-settings-button');
        const saveChangesBtn = document.getElementById('save-changes-button');
        
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
        
        if (saveChangesBtn) {
            saveChangesBtn.addEventListener('click', () => this.saveSettings());
        }
    }

    // Update settings UI to reflect current values
    updateSettingsUI() {
        this.updateThemeSelector();
        this.updateAccessibilityUI();
        this.updateNotificationUI();
        this.updateAppearanceUI();
        this.updateDataUI();
    }

    // Update theme selector UI
    updateThemeSelector() {
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = this.settings.theme;
        }
    }

    // Update accessibility UI
    updateAccessibilityUI() {
        const accessibilitySettings = document.getElementById('accessibility-settings');
        if (!accessibilitySettings) return;

        accessibilitySettings.querySelectorAll('input, select').forEach(input => {
            const name = input.name.replace('-', '');
            if (this.settings.accessibility[name]) {
                if (input.type === 'checkbox') {
                    input.checked = this.settings.accessibility[name];
                } else {
                    input.value = this.settings.accessibility[name];
                }
            }
        });
    }

    // Update notification UI
    updateNotificationUI() {
        const notificationSettings = document.getElementById('notification-settings');
        if (!notificationSettings) return;

        notificationSettings.querySelectorAll('input, select').forEach(input => {
            const name = input.name.replace('-', '');
            if (this.settings.notifications[name]) {
                if (input.type === 'checkbox') {
                    input.checked = this.settings.notifications[name];
                } else {
                    input.value = this.settings.notifications[name];
                }
            }
        });
    }

    // Update appearance UI
    updateAppearanceUI() {
        const appearanceSettings = document.querySelector('.appearance-settings');
        if (!appearanceSettings) return;

        appearanceSettings.querySelectorAll('input, select').forEach(input => {
            const name = input.name.replace('-', '');
            if (this.settings.appearance[name]) {
                if (input.type === 'checkbox') {
                    input.checked = this.settings.appearance[name];
                } else {
                    input.value = this.settings.appearance[name];
                }
            }
        });
    }

    // Update data UI
    updateDataUI() {
        const dataSettings = document.querySelector('.data-settings');
        if (!dataSettings) return;

        dataSettings.querySelectorAll('input, select').forEach(input => {
            const name = input.name.replace('-', '');
            if (this.settings.data[name]) {
                if (input.type === 'checkbox') {
                    input.checked = this.settings.data[name];
                } else {
                    input.value = this.settings.data[name];
                }
            }
        });
    }

    // Show save confirmation
    showSaveConfirmation() {
        this.showInAppNotification('Settings saved successfully!', 'success');
    }

    // Show save error
    showSaveError() {
        this.showInAppNotification('Failed to save settings', 'error');
    }

    // Export settings
    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'todo-app-settings.json';
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    // Import settings
    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    this.settings = { ...this.settings, ...importedSettings };
                    this.applySettings();
                    this.saveSettings();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('File reading error'));
            reader.readAsText(file);
        });
    }

    // Reset to default settings
    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            this.settings = new SettingsManager().settings;
            this.applySettings();
            this.saveSettings();
            this.showInAppNotification('Settings reset to defaults', 'success');
        }
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});