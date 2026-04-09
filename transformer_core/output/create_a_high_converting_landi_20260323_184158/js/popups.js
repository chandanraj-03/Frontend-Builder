// popups.js - Popup and modal management system including exit-intent, notifications, and overlays
// Handles all popup-related functionality with smooth animations and user experience

class PopupManager {
    constructor() {
        this.popups = new Map();
        this.activePopups = new Set();
        this.popupQueue = [];
        this.isProcessingQueue = false;
        this.exitIntentTriggered = false;
        this.mousePosition = { x: 0, y: 0 };
        this.scrollPosition = 0;
        this.userPreferences = this.loadUserPreferences();
        this.animationSystem = null;
    }

    // Initialize popup management system
    init() {
        this.cachePopups();
        this.setupEventListeners();
        this.setupExitIntentDetection();
        this.setupScrollTriggers();
        this.setupTimeBasedPopups();
        this.setupAnimationSystem();
        this.setupAccessibility();
        
        console.log('Popup management system initialized');
    }

    // Cache all popup elements
    cachePopups() {
        const popupElements = document.querySelectorAll('.popup, .modal, [data-popup]');
        
        popupElements.forEach(popup => {
            const popupId = popup.id || `popup-${Math.random().toString(36).substr(2, 9)}`;
            popup.setAttribute('data-popup-id', popupId);
            
            this.popups.set(popupId, {
                element: popup,
                config: this.parsePopupConfig(popup),
                state: 'hidden',
                triggers: this.parseTriggers(popup),
                shownCount: 0
            });
            
            // Initialize popup structure
            this.initializePopup(popup);
        });
    }

    // Parse popup configuration from data attributes
    parsePopupConfig(popup) {
        return {
            type: popup.getAttribute('data-popup-type') || 'modal',
            trigger: popup.getAttribute('data-trigger') || 'manual',
            delay: parseInt(popup.getAttribute('data-delay')) || 0,
            frequency: popup.getAttribute('data-frequency') || 'once',
            scrollPercentage: parseInt(popup.getAttribute('data-scroll-percentage')) || 50,
            timeOnPage: parseInt(popup.getAttribute('data-time-on-page')) || 30,
            maxShows: parseInt(popup.getAttribute('data-max-shows')) || 3,
            animation: popup.getAttribute('data-animation') || 'fade',
            closeOnOutsideClick: popup.getAttribute('data-close-outside') !== 'false',
            closeOnEsc: popup.getAttribute('data-close-esc') !== 'false',
            autoClose: parseInt(popup.getAttribute('data-auto-close')) || 0
        };
    }

    // Parse trigger conditions
    parseTriggers(popup) {
        const triggers = [];
        const triggerAttr = popup.getAttribute('data-trigger');
        
        if (triggerAttr) {
            triggerAttr.split(',').forEach(trigger => {
                triggers.push(trigger.trim());
            });
        }
        
        return triggers;
    }

    // Initialize individual popup structure
    initializePopup(popup) {
        // Ensure proper structure
        if (!popup.querySelector('.popup-content')) {
            const content = document.createElement('div');
            content.className = 'popup-content';
            while (popup.firstChild) {
                content.appendChild(popup.firstChild);
            }
            popup.appendChild(content);
        }
        
        // Add close button if not present
        if (!popup.querySelector('.popup-close')) {
            const closeButton = document.createElement('button');
            closeButton.className = 'popup-close';
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('aria-label', 'Close popup');
            closeButton.addEventListener('click', () => this.closePopup(popup.id));
            popup.appendChild(closeButton);
        }
        
        // Add overlay if not present
        if (!popup.classList.contains('has-overlay') && !popup.parentElement.classList.contains('popup-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
            popup.parentNode.insertBefore(overlay, popup);
            overlay.appendChild(popup);
        }
        
        // Set initial state
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-modal', 'true');
    }

    // Setup event listeners for popup triggers
    setupEventListeners() {
        // Close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup-close') || e.target.closest('.popup-close')) {
                const popup = e.target.closest('.popup, .modal');
                if (popup) {
                    this.closePopup(popup.id);
                }
            }
        });
        
        // Outside click to close
        document.addEventListener('click', (e) => {
            this.activePopups.forEach(popupId => {
                const popup = this.popups.get(popupId);
                if (popup && popup.config.closeOnOutsideClick) {
                    const isClickInside = popup.element.contains(e.target);
                    const isPopup = e.target.classList.contains('popup') || e.target.classList.contains('modal');
                    
                    if (!isClickInside && isPopup) {
                        this.closePopup(popupId);
                    }
                }
            });
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.activePopups.forEach(popupId => {
                    const popup = this.popups.get(popupId);
                    if (popup && popup.config.closeOnEsc) {
                        this.closePopup(popupId);
                    }
                });
            }
            
            // Trap focus within popup
            if (e.key === 'Tab' && this.activePopups.size > 0) {
                this.trapFocus(e);
            }
        });
        
        // Trigger buttons
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-popup-trigger]');
            if (trigger) {
                const popupId = trigger.getAttribute('data-popup-trigger');
                this.showPopup(popupId);
            }
        });
    }

    // Setup exit-intent detection
    setupExitIntentDetection() {
        let mouseY = 0;
        
        document.addEventListener('mouseleave', (e) => {
            // Check if mouse is leaving towards the top
            if (e.clientY < 50 && !this.exitIntentTriggered) {
                this.triggerExitIntentPopups();
            }
        });
        
        // Track mouse movement for exit intent
        document.addEventListener('mousemove', (e) => {
            this.mousePosition = { x: e.clientX, y: e.clientY };
            
            // Detect rapid movement toward top (exit intent)
            if (e.clientY < 100 && mouseY > 200 && !this.exitIntentTriggered) {
                this.triggerExitIntentPopups();
            }
            
            mouseY = e.clientY;
        });
    }

    // Trigger exit-intent popups
    triggerExitIntentPopups() {
        this.exitIntentTriggered = true;
        
        // Find exit-intent popups
        this.popups.forEach((popup, popupId) => {
            if (popup.triggers.includes('exit-intent')) {
                // Check if should show based on frequency
                if (this.shouldShowPopup(popupId)) {
                    this.queuePopup(popupId);
                }
            }
        });
    }

    // Setup scroll-based triggers
    setupScrollTriggers() {
        let scrollTimeout;
        
        const checkScrollTriggers = () => {
            const scrollPercent = this.getScrollPercentage();
            this.scrollPosition = window.scrollY;
            
            this.popups.forEach((popup, popupId) => {
                if (popup.triggers.includes('scroll')) {
                    const triggerPercent = popup.config.scrollPercentage;
                    
                    if (scrollPercent >= triggerPercent && !popup.shownCount) {
                        if (this.shouldShowPopup(popupId)) {
                            this.queuePopup(popupId);
                        }
                    }
                }
            });
        };
        
        // Throttle scroll events
        const throttledCheck = this.throttle(checkScrollTriggers, 100);
        window.addEventListener('scroll', throttledCheck);
    }

    // Setup time-based popups
    setupTimeBasedPopups() {
        this.popups.forEach((popup, popupId) => {
            if (popup.triggers.includes('time')) {
                const delay = popup.config.timeOnPage * 1000;
                
                setTimeout(() => {
                    if (this.shouldShowPopup(popupId)) {
                        this.queuePopup(popupId);
                    }
                }, delay);
            }
        });
    }

    // Setup animation system for popups
    setupAnimationSystem() {
        this.animationSystem = {
            fadeIn: (element, duration = 300) => {
                element.style.opacity = '0';
                element.style.display = 'block';
                
                requestAnimationFrame(() => {
                    element.style.transition = `opacity ${duration}ms ease`;
                    element.style.opacity = '1';
                });
                
                return duration;
            },
            
            fadeOut: (element, duration = 300) => {
                element.style.opacity = '1';
                
                requestAnimationFrame(() => {
                    element.style.transition = `opacity ${duration}ms ease`;
                    element.style.opacity = '0';
                });
                
                return new Promise(resolve => {
                    setTimeout(() => {
                        element.style.display = 'none';
                        resolve();
                    }, duration);
                });
            },
            
            slideIn: (element, direction = 'bottom', duration = 300) => {
                const transforms = {
                    'top': 'translateY(-100%)',
                    'bottom': 'translateY(100%)',
                    'left': 'translateX(-100%)',
                    'right': 'translateX(100%)',
                    'center': 'scale(0.8)'
                };
                
                element.style.transform = transforms[direction] || transforms['bottom'];
                element.style.opacity = '0';
                element.style.display = 'block';
                
                requestAnimationFrame(() => {
                    element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                    element.style.transform = 'translate(0, 0) scale(1)';
                    element.style.opacity = '1';
                });
                
                return duration;
            },
            
            slideOut: (element, direction = 'bottom', duration = 300) => {
                const transforms = {
                    'top': 'translateY(-100%)',
                    'bottom': 'translateY(100%)',
                    'left': 'translateX(-100%)',
                    'right': 'translateX(100%)',
                    'center': 'scale(0.8)'
                };
                
                return new Promise(resolve => {
                    requestAnimationFrame(() => {
                        element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                        element.style.transform = transforms[direction] || transforms['bottom'];
                        element.style.opacity = '0';
                    });
                    
                    setTimeout(() => {
                        element.style.display = 'none';
                        resolve();
                    }, duration);
                });
            }
        };
    }

    // Setup accessibility features
    setupAccessibility() {
        // Ensure focus management
        document.addEventListener('focusin', (e) => {
            if (this.activePopups.size > 0) {
                const activePopupId = Array.from(this.activePopups)[this.activePopups.size - 1];
                const activePopup = this.popups.get(activePopupId);
                
                if (activePopup && !activePopup.element.contains(e.target)) {
                    this.setFocusToPopup(activePopupId);
                }
            }
        });
    }

    // Show specific popup
    showPopup(popupId) {
        const popup = this.popups.get(popupId);
        if (!popup || popup.state === 'showing' || popup.state === 'visible') return;
        
        // Check if should show based on frequency and max shows
        if (!this.shouldShowPopup(popupId)) return;
        
        popup.state = 'showing';
        popup.shownCount++;
        
        // Add to active popups
        this.activePopups.add(popupId);
        
        // Update user preferences
        this.updateUserPreferences(popupId);
        
        // Show overlay
        this.showOverlay(popupId);
        
        // Show popup with animation
        const popupElement = popup.element;
        popupElement.style.display = 'block';
        popupElement.setAttribute('aria-hidden', 'false');
        
        // Apply animation
        const animation = popup.config.animation;
        const animationDuration = this.animatePopupIn(popupElement, animation);
        
        // Set focus to popup
        setTimeout(() => {
            this.setFocusToPopup(popupId);
            popup.state = 'visible';
            
            // Setup auto-close if configured
            if (popup.config.autoClose > 0) {
                setTimeout(() => {
                    this.closePopup(popupId);
                }, popup.config.autoClose * 1000);
            }
        }, animationDuration);
        
        // Dispatch custom event
        const event = new CustomEvent('popupShown', {
            detail: { popupId, popup }
        });
        document.dispatchEvent(event);
        
        console.log(`Popup ${popupId} shown`);
    }

    // Close specific popup
    closePopup(popupId) {
        const popup = this.popups.get(popupId);
        if (!popup || popup.state === 'hidden') return;
        
        popup.state = 'hiding';
        
        // Animate popup out
        const animation = popup.config.animation;
        this.animatePopupOut(popup.element, animation).then(() => {
            popup.element.style.display = 'none';
            popup.element.setAttribute('aria-hidden', 'true');
            popup.state = 'hidden';
            
            // Remove from active popups
            this.activePopups.delete(popupId);
            
            // Hide overlay if no more popups
            if (this.activePopups.size === 0) {
                this.hideOverlay();
            }
            
            // Restore focus to previous element
            this.restoreFocus();
            
            // Dispatch custom event
            const event = new CustomEvent('popupClosed', {
                detail: { popupId, popup }
            });
            document.dispatchEvent(event);
            
            console.log(`Popup ${popupId} closed`);
        });
    }

    // Close all popups
    closeAllPopups() {
        this.activePopups.forEach(popupId => {
            this.closePopup(popupId);
        });
    }

    // Animate popup in
    animatePopupIn(element, animationType) {
        switch (animationType) {
            case 'slide-top':
                return this.animationSystem.slideIn(element, 'top');
            case 'slide-bottom':
                return this.animationSystem.slideIn(element, 'bottom');
            case 'slide-left':
                return this.animationSystem.slideIn(element, 'left');
            case 'slide-right':
                return this.animationSystem.slideIn(element, 'right');
            case 'zoom':
                return this.animationSystem.slideIn(element, 'center');
            default:
                return this.animationSystem.fadeIn(element);
        }
    }

    // Animate popup out
    animatePopupOut(element, animationType) {
        switch (animationType) {
            case 'slide-top':
                return this.animationSystem.slideOut(element, 'top');
            case 'slide-bottom':
                return this.animationSystem.slideOut(element, 'bottom');
            case 'slide-left':
                return this.animationSystem.slideOut(element, 'left');
            case 'slide-right':
                return this.animationSystem.slideOut(element, 'right');
            case 'zoom':
                return this.animationSystem.slideOut(element, 'center');
            default:
                return this.animationSystem.fadeOut(element);
        }
    }

    // Show overlay for popup
    showOverlay(popupId) {
        const popup = this.popups.get(popupId);
        if (!popup) return;
        
        let overlay = popup.element.parentElement.classList.contains('popup-overlay') 
            ? popup.element.parentElement 
            : document.querySelector('.popup-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
            document.body.appendChild(overlay);
        }
        
        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }

    // Hide overlay
    hideOverlay() {
        const overlays = document.querySelectorAll('.popup-overlay');
        overlays.forEach(overlay => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        });
    }

    // Queue popup for display
    queuePopup(popupId) {
        this.popupQueue.push(popupId);
        
        if (!this.isProcessingQueue) {
            this.processPopupQueue();
        }
    }

    // Process popup queue
    processPopupQueue() {
        if (this.popupQueue.length === 0 || this.isProcessingQueue) return;
        
        this.isProcessingQueue = true;
        
        const processNext = () => {
            if (this.popupQueue.length === 0) {
                this.isProcessingQueue = false;
                return;
            }
            
            const popupId = this.popupQueue.shift();
            const popup = this.popups.get(popupId);
            
            if (popup && this.shouldShowPopup(popupId)) {
                // Check if any popup is currently visible
                if (this.activePopups.size === 0) {
                    this.showPopup(popupId);
                    setTimeout(processNext, 1000); // Wait before showing next
                } else {
                    // Re-queue if popup is currently visible
                    this.popupQueue.unshift(popupId);
                    setTimeout(processNext, 500);
                }
            } else {
                processNext();
            }
        };
        
        processNext();
    }

    // Check if popup should be shown
    shouldShowPopup(popupId) {
        const popup = this.popups.get(popupId);
        if (!popup) return false;
        
        // Check max shows
        if (popup.config.maxShows > 0 && popup.shownCount >= popup.config.maxShows) {
            return false;
        }
        
        // Check frequency
        switch (popup.config.frequency) {
            case 'once':
                return popup.shownCount === 0;
            case 'session':
                return !this.userPreferences.seenPopups[popupId];
            case 'always':
                return true;
            default:
                return true;
        }
    }

    // Set focus to popup
    setFocusToPopup(popupId) {
        const popup = this.popups.get(popupId);
        if (!popup) return;
        
        // Find focusable elements
        const focusableElements = popup.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            popup.element.setAttribute('tabindex', '-1');
            popup.element.focus();
        }
    }

    // Trap focus within popup
    trapFocus(e) {
        const activePopupId = Array.from(this.activePopups)[this.activePopups.size - 1];
        const activePopup = this.popups.get(activePopupId);
        if (!activePopup) return;
        
        const focusableElements = activePopup.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Restore focus to previous element
    restoreFocus() {
        const previousActiveElement = document.querySelector('[data-previous-focus]');
        if (previousActiveElement) {
            previousActiveElement.focus();
            previousActiveElement.removeAttribute('data-previous-focus');
        }
    }

    // Get scroll percentage
    getScrollPercentage() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        
        return (scrollTop / (documentHeight - windowHeight)) * 100;
    }

    // Load user preferences from localStorage
    loadUserPreferences() {
        const preferences = localStorage.getItem('popupPreferences');
        return preferences ? JSON.parse(preferences) : {
            seenPopups: {},
            disabledPopups: []
        };
    }

    // Update user preferences
    updateUserPreferences(popupId) {
        this.userPreferences.seenPopups[popupId] = true;
        localStorage.setItem('popupPreferences', JSON.stringify(this.userPreferences));
    }

    // Utility: Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Public API methods
    getPopup(popupId) {
        return this.popups.get(popupId);
    }
    
    isPopupVisible(popupId) {
        const popup = this.popups.get(popupId);
        return popup ? popup.state === 'visible' : false;
    }
    
    getVisiblePopups() {
        return Array.from(this.activePopups);
    }
    
    disablePopup(popupId) {
        this.userPreferences.disabledPopups.push(popupId);
        localStorage.setItem('popupPreferences', JSON.stringify(this.userPreferences));
    }
    
    enablePopup(popupId) {
        this.userPreferences.disabledPopups = this.userPreferences.disabledPopups.filter(id => id !== popupId);
        localStorage.setItem('popupPreferences', JSON.stringify(this.userPreferences));
    }
    
    resetPopupCount(popupId) {
        const popup = this.popups.get(popupId);
        if (popup) {
            popup.shownCount = 0;
        }
    }
}

// Initialize popup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const popupManager = new PopupManager();
    popupManager.init();
    
    // Make popup manager available globally
    window.popupManager = popupManager;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PopupManager;
}