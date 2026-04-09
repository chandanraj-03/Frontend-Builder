// motion-toggle.js - Reduced motion toggle functionality
// Handles accessibility features for users with motion sensitivity, providing smooth transitions when enabled

class MotionToggle {
    constructor() {
        this.isReducedMotion = this.getStoredPreference() || this.getSystemPreference();
        this.toggleButton = document.getElementById('motion-toggle');
        this.init();
    }

    // Initialize motion toggle functionality
    init() {
        this.applyMotionPreference(this.isReducedMotion);
        this.setupEventListeners();
        this.updateToggleButton();
        this.setupCSSVariables();
    }

    // Get stored motion preference from localStorage
    getStoredPreference() {
        const stored = localStorage.getItem('portfolio-reduced-motion');
        return stored !== null ? JSON.parse(stored) : null;
    }

    // Get system preference for reduced motion
    getSystemPreference() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Apply motion preference to document
    applyMotionPreference(reducedMotion) {
        this.isReducedMotion = reducedMotion;
        
        if (reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
        
        localStorage.setItem('portfolio-reduced-motion', JSON.stringify(reducedMotion));
        
        // Dispatch custom event for other components to react to motion changes
        document.dispatchEvent(new CustomEvent('reducedMotionChanged', { 
            detail: { reducedMotion: reducedMotion }
        }));
    }

    // Toggle reduced motion preference
    toggleMotion() {
        const newPreference = !this.isReducedMotion;
        this.applyMotionPreference(newPreference);
        this.animateToggleFeedback();
        this.updateToggleButton();
        this.updateAnimations();
    }

    // Setup event listeners for motion toggle
    setupEventListeners() {
        // Toggle button click
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleMotion());
            this.toggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMotion();
                }
            });
        }

        // Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', (e) => {
            if (!this.getStoredPreference()) { // Only follow system if no user preference
                this.applyMotionPreference(e.matches);
                this.updateToggleButton();
                this.updateAnimations();
            }
        });
    }

    // Animate toggle feedback with subtle transition
    animateToggleFeedback() {
        if (this.isReducedMotion) return; // Skip animation if reducing motion

        const button = this.toggleButton;
        if (!button) return;

        // Add pulse animation
        button.style.transform = 'scale(1.1)';
        button.style.transition = 'transform 0.2s ease-in-out';

        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);

        // Remove transition after animation completes
        setTimeout(() => {
            button.style.transition = '';
        }, 400);
    }

    // Update toggle button appearance and accessibility attributes
    updateToggleButton() {
        if (!this.toggleButton) return;

        const icon = this.toggleButton.querySelector('i') || this.toggleButton;
        const isReduced = this.isReducedMotion;

        // Update icon and text based on state
        if (isReduced) {
            icon.textContent = '🚶';
            icon.setAttribute('aria-label', 'Enable animations');
            this.toggleButton.setAttribute('title', 'Enable animations');
            this.toggleButton.setAttribute('data-tooltip', 'Motion effects disabled');
        } else {
            icon.textContent = '🏃';
            icon.setAttribute('aria-label', 'Reduce animations');
            this.toggleButton.setAttribute('title', 'Reduce animations');
            this.toggleButton.setAttribute('data-tooltip', 'Motion effects enabled');
        }

        // Update button state for accessibility
        this.toggleButton.setAttribute('aria-pressed', isReduced.toString());
        this.toggleButton.setAttribute('data-motion-state', isReduced ? 'reduced' : 'normal');
    }

    // Setup CSS variables for consistent animation timing
    setupCSSVariables() {
        const root = document.documentElement;
        
        if (this.isReducedMotion) {
            root.style.setProperty('--animation-duration', '0.1s');
            root.style.setProperty('--transition-duration', '0.1s');
            root.style.setProperty('--hover-transition', '0.1s ease-out');
        } else {
            root.style.setProperty('--animation-duration', '0.3s');
            root.style.setProperty('--transition-duration', '0.3s');
            root.style.setProperty('--hover-transition', '0.2s ease-in-out');
        }
    }

    // Update all animations on the page based on current preference
    updateAnimations() {
        this.updateCSSAnimations();
        this.updateJavaScriptAnimations();
        this.updateScrollBehavior();
    }

    // Update CSS animations and transitions
    updateCSSAnimations() {
        const styleId = 'motion-toggle-styles';
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        if (this.isReducedMotion) {
            styleElement.textContent = `
                * {
                    animation-duration: 0.1s !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.1s !important;
                }
                
                .reduced-motion {
                    scroll-behavior: auto !important;
                }
                
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.1s !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.1s !important;
                    }
                }
            `;
        } else {
            styleElement.textContent = '';
        }
    }

    // Update JavaScript-controlled animations
    updateJavaScriptAnimations() {
        // Notify all animation controllers about the change
        document.querySelectorAll('[data-animated]').forEach(element => {
            const event = new CustomEvent('motionPreferenceChanged', {
                detail: { reducedMotion: this.isReducedMotion }
            });
            element.dispatchEvent(event);
        });
    }

    // Update scroll behavior
    updateScrollBehavior() {
        if (this.isReducedMotion) {
            document.documentElement.style.scrollBehavior = 'auto';
        } else {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    // Get current motion state for external use
    getMotionState() {
        return this.isReducedMotion ? 'reduced' : 'normal';
    }

    // Set motion preference programmatically
    setMotionPreference(reducedMotion) {
        if (typeof reducedMotion === 'boolean') {
            this.applyMotionPreference(reducedMotion);
            this.updateToggleButton();
            this.updateAnimations();
        }
    }

    // Reset to system preference
    resetToSystemPreference() {
        const systemPreference = this.getSystemPreference();
        this.applyMotionPreference(systemPreference);
        this.updateToggleButton();
        this.updateAnimations();
        localStorage.removeItem('portfolio-reduced-motion'); // Clear stored preference
    }

    // Check if reduced motion is currently enabled
    isMotionReduced() {
        return this.isReducedMotion;
    }

    // Utility method to conditionally apply animations
    applyConditionalAnimation(element, animationClass) {
        if (this.isReducedMotion) {
            element.classList.remove(animationClass);
        } else {
            element.classList.add(animationClass);
        }
    }
}

// Initialize motion toggle when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.motionToggle = new MotionToggle();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MotionToggle;
}