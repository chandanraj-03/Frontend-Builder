// theme-toggle.js - Theme toggle functionality
// Handles light/dark theme switching with smooth transitions and user preference persistence

class ThemeToggle {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemPreference();
        this.toggleButton = document.getElementById('theme-toggle');
        this.init();
    }

    // Initialize theme toggle functionality
    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.updateToggleButton();
    }

    // Get stored theme preference from localStorage
    getStoredTheme() {
        return localStorage.getItem('portfolio-theme');
    }

    // Get system preference for dark/light mode
    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme to document
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('portfolio-theme', theme);
        
        // Dispatch custom event for other components to react to theme changes
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme }
        }));
    }

    // Toggle between light and dark themes
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.animateThemeTransition();
        this.updateToggleButton();
    }

    // Setup event listeners for theme toggle
    setupEventListeners() {
        // Toggle button click
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleTheme());
            this.toggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!this.getStoredTheme()) { // Only follow system if no user preference
                this.applyTheme(e.matches ? 'dark' : 'light');
                this.updateToggleButton();
            }
        });

        // Listen for reduced motion changes to adjust transition timing
        document.addEventListener('reducedMotionChanged', (e) => {
            this.adjustTransitionTiming(e.detail.reducedMotion);
        });
    }

    // Animate theme transition with smooth color changes
    animateThemeTransition() {
        const isReducedMotion = document.documentElement.classList.contains('reduced-motion');
        
        if (isReducedMotion) {
            return; // Skip animations if reduced motion is enabled
        }

        // Create overlay for smooth transition effect
        const transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'theme-transition-overlay';
        transitionOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${this.currentTheme === 'dark' ? '#000' : '#fff'};
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
            transition: opacity 0.3s ease-in-out;
        `;

        document.body.appendChild(transitionOverlay);

        // Animate overlay
        requestAnimationFrame(() => {
            transitionOverlay.style.opacity = '0.7';
            
            setTimeout(() => {
                transitionOverlay.style.opacity = '0';
                
                setTimeout(() => {
                    document.body.removeChild(transitionOverlay);
                }, 300);
            }, 150);
        });
    }

    // Update toggle button appearance and accessibility attributes
    updateToggleButton() {
        if (!this.toggleButton) return;

        const icon = this.toggleButton.querySelector('i') || this.toggleButton;
        const isDark = this.currentTheme === 'dark';

        // Update icon and text
        if (isDark) {
            icon.textContent = '☀️';
            icon.setAttribute('aria-label', 'Switch to light theme');
            this.toggleButton.setAttribute('title', 'Switch to light theme');
        } else {
            icon.textContent = '🌙';
            icon.setAttribute('aria-label', 'Switch to dark theme');
            this.toggleButton.setAttribute('title', 'Switch to dark theme');
        }

        // Update button state for accessibility
        this.toggleButton.setAttribute('aria-pressed', isDark.toString());
        this.toggleButton.setAttribute('data-theme', this.currentTheme);
    }

    // Adjust transition timing based on reduced motion preference
    adjustTransitionTiming(reducedMotion) {
        const root = document.documentElement;
        
        if (reducedMotion) {
            root.style.setProperty('--theme-transition-duration', '0.1s');
            root.style.setProperty('--theme-transition-timing', 'ease-out');
        } else {
            root.style.setProperty('--theme-transition-duration', '0.3s');
            root.style.setProperty('--theme-transition-timing', 'ease-in-out');
        }
    }

    // Get current theme for external use
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Set theme programmatically
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.applyTheme(theme);
            this.updateToggleButton();
        }
    }

    // Reset to system preference
    resetToSystemPreference() {
        const systemTheme = this.getSystemPreference();
        this.applyTheme(systemTheme);
        this.updateToggleButton();
        localStorage.removeItem('portfolio-theme'); // Clear stored preference
    }
}

// Initialize theme toggle when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeToggle;
}