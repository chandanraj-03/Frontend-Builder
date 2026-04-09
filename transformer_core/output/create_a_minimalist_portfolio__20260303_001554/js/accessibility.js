// accessibility.js - Accessibility features and inclusive design functionality
// Handles keyboard navigation, screen reader support, motion preferences, and WCAG compliance

class AccessibilityManager {
    constructor() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.currentFocusIndex = -1;
        this.focusableElements = [];
        this.init();
    }

    // Initialize accessibility features
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupReducedMotionToggle();
        this.setupAriaAttributes();
        this.setupHighContrastSupport();
        this.setupFontSizeAdjustment();
    }

    // Set up comprehensive keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Tab':
                    this.handleTabNavigation(e);
                    break;
                case 'Escape':
                    this.handleEscapeKey(e);
                    break;
                case 'Enter':
                case ' ':
                    this.handleEnterAndSpace(e);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    this.handleArrowNavigation(e);
                    break;
            }
        });

        // Ensure all interactive elements are keyboard accessible
        this.makeElementsKeyboardAccessible();
    }

    // Handle Tab key navigation with focus trapping
    handleTabNavigation(e) {
        this.updateFocusableElements();
        
        if (this.focusableElements.length === 0) return;

        if (e.shiftKey) {
            // Shift + Tab - move backwards
            if (this.currentFocusIndex <= 0) {
                this.currentFocusIndex = this.focusableElements.length - 1;
            } else {
                this.currentFocusIndex--;
            }
        } else {
            // Tab - move forwards
            if (this.currentFocusIndex >= this.focusableElements.length - 1) {
                this.currentFocusIndex = 0;
            } else {
                this.currentFocusIndex++;
            }
        }

        this.focusableElements[this.currentFocusIndex]?.focus();
        e.preventDefault();
    }

    // Handle Escape key for closing modals and menus
    handleEscapeKey(e) {
        const activeModal = document.querySelector('.modal.active, .navigation-menu.active');
        if (activeModal) {
            this.closeModalOrMenu(activeModal);
            e.preventDefault();
        }
    }

    // Handle Enter and Space keys for button interactions
    handleEnterAndSpace(e) {
        const activeElement = document.activeElement;
        
        if (activeElement && (activeElement.tagName === 'BUTTON' || activeElement.getAttribute('role') === 'button')) {
            if (e.key === ' ') {
                e.preventDefault(); // Prevent space from scrolling page
            }
            activeElement.click();
        }
    }

    // Handle arrow keys for custom components
    handleArrowNavigation(e) {
        const activeElement = document.activeElement;
        
        // Handle arrow navigation in custom dropdowns or lists
        if (activeElement.getAttribute('role') === 'listbox' || activeElement.closest('[role="listbox"]')) {
            this.handleListboxNavigation(e);
        }
    }

    // Update list of focusable elements
    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled && el.offsetParent !== null);
    }

    // Make all interactive elements properly accessible
    makeElementsKeyboardAccessible() {
        // Ensure custom buttons have proper roles
        document.querySelectorAll('[role="button"]').forEach(button => {
            button.setAttribute('tabindex', '0');
        });

        // Add keyboard support to project items
        document.querySelectorAll('.project-item').forEach(project => {
            project.setAttribute('tabindex', '0');
            project.setAttribute('role', 'button');
            project.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    project.click();
                    e.preventDefault();
                }
            });
        });
    }

    // Set up focus management for better navigation
    setupFocusManagement() {
        // Track focus for screen readers
        let previousActiveElement = null;

        document.addEventListener('focusin', (e) => {
            if (previousActiveElement !== e.target) {
                this.announceFocusChange(e.target);
                previousActiveElement = e.target;
            }
        });

        // Ensure focus remains within modal when open
        this.setupFocusTrapping();
    }

    // Announce focus changes for screen readers
    announceFocusChange(element) {
        const label = element.getAttribute('aria-label') || 
                     element.textContent?.trim() || 
                     element.getAttribute('alt') || 
                     element.getAttribute('title');
        
        if (label) {
            this.speakToScreenReader(`Focused on ${label}`);
        }
    }

    // Set up screen reader support and announcements
    setupScreenReaderSupport() {
        // Create live region for dynamic content updates
        this.createLiveRegion();
        
        // Add aria-labels to decorative images
        document.querySelectorAll('img:not([alt])').forEach(img => {
            if (!img.getAttribute('alt')) {
                img.setAttribute('alt', 'Decorative image');
            }
        });
    }

    // Create aria-live region for dynamic announcements
    createLiveRegion() {
        let liveRegion = document.getElementById('a11y-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'a11y-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
    }

    // Speak text to screen readers
    speakToScreenReader(text) {
        const liveRegion = document.getElementById('a11y-live-region');
        if (liveRegion) {
            liveRegion.textContent = text;
            
            // Clear after a delay to allow repeated announcements
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Set up reduced motion toggle functionality
    setupReducedMotionToggle() {
        const toggle = document.querySelector('.reduced-motion-toggle');
        if (toggle) {
            toggle.setAttribute('role', 'switch');
            toggle.setAttribute('aria-checked', this.isReducedMotion.toString());
            toggle.setAttribute('aria-label', 'Reduce animations');
            
            toggle.addEventListener('click', () => {
                this.toggleReducedMotion();
            });
            
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.toggleReducedMotion();
                    e.preventDefault();
                }
            });
        }

        // Listen for system preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            this.updateMotionPreferences();
        });
    }

    // Toggle reduced motion preference
    toggleReducedMotion() {
        this.isReducedMotion = !this.isReducedMotion;
        this.updateMotionPreferences();
        
        // Update toggle state
        const toggle = document.querySelector('.reduced-motion-toggle');
        if (toggle) {
            toggle.setAttribute('aria-checked', this.isReducedMotion.toString());
            this.speakToScreenReader(`Animations ${this.isReducedMotion ? 'reduced' : 'enabled'}`);
        }
        
        // Save preference
        localStorage.setItem('a11y-reduced-motion', this.isReducedMotion.toString());
    }

    // Update motion preferences across the application
    updateMotionPreferences() {
        document.documentElement.classList.toggle('reduced-motion', this.isReducedMotion);
        
        // Notify other components
        if (window.animationManager) {
            window.animationManager.updateReducedMotion(this.isReducedMotion);
        }
    }

    // Set up proper ARIA attributes for all components
    setupAriaAttributes() {
        // Navigation menu
        const navMenu = document.querySelector('.navigation-menu');
        if (navMenu) {
            navMenu.setAttribute('aria-label', 'Main navigation');
        }

        // Project showcase
        const projects = document.querySelector('.projects-showcase');
        if (projects) {
            projects.setAttribute('aria-label', 'Projects showcase');
            projects.querySelectorAll('.project-item').forEach((project, index) => {
                project.setAttribute('aria-labelledby', `project-title-${index}`);
            });
        }

        // Contact section
        const contactSection = document.querySelector('.contact-section');
        if (contactSection) {
            contactSection.setAttribute('aria-label', 'Contact information');
        }

        // Add skip to main content link
        this.addSkipLink();
    }

    // Add skip to main content link
    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Focus management for skip link
        skipLink.addEventListener('click', () => {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                setTimeout(() => mainContent.removeAttribute('tabindex'), 1000);
            }
        });
    }

    // Set up high contrast support
    setupHighContrastSupport() {
        // Detect high contrast mode
        const highContrastMedia = window.matchMedia('(prefers-contrast: high)');
        this.updateHighContrast(highContrastMedia.matches);
        
        highContrastMedia.addEventListener('change', (e) => {
            this.updateHighContrast(e.matches);
        });
    }

    // Update styles for high contrast mode
    updateHighContrast(isHighContrast) {
        document.documentElement.classList.toggle('high-contrast', isHighContrast);
    }

    // Set up font size adjustment support
    setupFontSizeAdjustment() {
        // Respect user's font size preferences
        const largeTextMedia = window.matchMedia('(prefers-reduced-transparency: reduce)');
        this.updateFontSize(largeTextMedia.matches);
        
        largeTextMedia.addEventListener('change', (e) => {
            this.updateFontSize(e.matches);
        });
    }

    // Update font sizes based on user preference
    updateFontSize(isLargeTextPreferred) {
        document.documentElement.classList.toggle('large-text', isLargeTextPreferred);
    }

    // Focus trapping for modals and dialogs
    setupFocusTrapping() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.trapFocus(e);
            }
        });
    }

    // Trap focus within modal or menu
    trapFocus(e) {
        const activeModal = document.querySelector('.modal.active, .navigation-menu.active');
        if (!activeModal) return;

        const focusableElements = activeModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }

    // Close modal or menu with proper focus management
    closeModalOrMenu(element) {
        element.classList.remove('active');
        
        // Return focus to the element that opened the modal
        const opener = document.querySelector('[aria-expanded="true"]');
        if (opener) {
            opener.setAttribute('aria-expanded', 'false');
            opener.focus();
        }
    }

    // Utility function to make element focusable
    makeFocusable(element) {
        element.setAttribute('tabindex', '0');
    }

    // Utility function to make element not focusable
    makeUnfocusable(element) {
        element.setAttribute('tabindex', '-1');
    }
}

// Initialize accessibility manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
});