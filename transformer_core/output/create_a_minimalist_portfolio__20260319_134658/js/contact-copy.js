// contact-copy.js - Click-to-copy functionality for contact details
// Handles copying contact information to clipboard with smooth feedback animations

class ContactCopy {
    constructor() {
        this.copyElements = [];
        this.feedbackDuration = 2000;
        this.init();
    }

    // Initialize click-to-copy functionality
    init() {
        this.findCopyElements();
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupStyles();
    }

    // Find all elements with copy functionality
    findCopyElements() {
        // Look for elements with data-copy attribute or specific classes
        this.copyElements = Array.from(document.querySelectorAll(
            '[data-copy], .contact-copy, [data-contact-copy]'
        ));

        // Also include common contact elements
        const contactSelectors = [
            '.email-address',
            '.phone-number',
            '.social-link[href^="mailto:"]',
            '.social-link[href^="tel:"]'
        ];

        contactSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!this.copyElements.includes(element)) {
                    this.copyElements.push(element);
                }
            });
        });
    }

    // Setup event listeners for copy elements
    setupEventListeners() {
        this.copyElements.forEach(element => {
            // Click event
            element.addEventListener('click', (e) => this.handleCopyClick(e, element));
            
            // Keyboard event for accessibility
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCopyClick(e, element);
                }
            });

            // Mouse enter/leave for hover effects
            element.addEventListener('mouseenter', () => this.handleMouseEnter(element));
            element.addEventListener('mouseleave', () => this.handleMouseLeave(element));
            
            // Focus/blur for keyboard navigation
            element.addEventListener('focus', () => this.handleFocus(element));
            element.addEventListener('blur', () => this.handleBlur(element));
        });
    }

    // Setup accessibility features
    setupAccessibility() {
        this.copyElements.forEach(element => {
            // Add ARIA attributes
            element.setAttribute('role', 'button');
            element.setAttribute('tabindex', '0');
            
            const label = this.getAccessibilityLabel(element);
            element.setAttribute('aria-label', label);
            
            // Add data attribute for original text
            if (!element.hasAttribute('data-original-text')) {
                element.setAttribute('data-original-text', this.getCopyText(element));
            }
        });
    }

    // Get accessibility label for element
    getAccessibilityLabel(element) {
        const text = this.getCopyText(element);
        const type = this.getContactType(element);
        return `Copy ${type} "${text}" to clipboard`;
    }

    // Get contact type for accessibility label
    getContactType(element) {
        if (element.classList.contains('email-address') || 
            element.href?.startsWith('mailto:')) {
            return 'email address';
        } else if (element.classList.contains('phone-number') || 
                  element.href?.startsWith('tel:')) {
            return 'phone number';
        } else if (element.classList.contains('social-link')) {
            return 'social media link';
        }
        return 'contact information';
    }

    // Handle copy click event
    async handleCopyClick(event, element) {
        event.preventDefault();
        event.stopPropagation();

        const textToCopy = this.getCopyText(element);
        
        try {
            await this.copyToClipboard(textToCopy);
            this.showCopyFeedback(element, true);
            this.logCopyAction(textToCopy);
        } catch (error) {
            this.showCopyFeedback(element, false);
            console.error('Copy failed:', error);
        }
    }

    // Get text to copy from element
    getCopyText(element) {
        // Check data attributes first
        if (element.hasAttribute('data-copy')) {
            return element.getAttribute('data-copy');
        }
        
        // Check for specific data attributes
        if (element.hasAttribute('data-email')) {
            return element.getAttribute('data-email');
        }
        
        if (element.hasAttribute('data-phone')) {
            return element.getAttribute('data-phone');
        }
        
        // Check href for mailto or tel links
        if (element.href) {
            if (element.href.startsWith('mailto:')) {
                return element.href.replace('mailto:', '');
            }
            if (element.href.startsWith('tel:')) {
                return element.href.replace('tel:', '');
            }
        }
        
        // Fallback to text content
        return element.textContent.trim();
    }

    // Copy text to clipboard
    async copyToClipboard(text) {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Fallback for older browsers or insecure contexts
        return this.fallbackCopyToClipboard(text);
    }

    // Fallback copy method
    fallbackCopyToClipboard(text) {
        return new Promise((resolve, reject) => {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // Make the textarea invisible
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            textArea.style.opacity = '0';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    resolve(true);
                } else {
                    reject(new Error('Copy command failed'));
                }
            } catch (err) {
                document.body.removeChild(textArea);
                reject(err);
            }
        });
    }

    // Show copy feedback with animation
    showCopyFeedback(element, success) {
        const originalText = element.getAttribute('data-original-text') || element.textContent;
        const isReducedMotion = document.documentElement.classList.contains('reduced-motion');
        
        // Store current styles
        const originalColor = element.style.color;
        const originalBgColor = element.style.backgroundColor;
        const originalTransform = element.style.transform;
        
        // Update element appearance
        if (success) {
            element.textContent = 'Copied!';
            element.style.color = 'var(--success-color, #28a745)';
            element.style.backgroundColor = 'var(--success-bg, rgba(40, 167, 69, 0.1)';
            
            // Add checkmark icon if supported
            if (this.supportsEmoji()) {
                element.textContent = '✓ Copied!';
            }
        } else {
            element.textContent = 'Failed to copy';
            element.style.color = 'var(--error-color, #dc3545)';
            element.style.backgroundColor = 'var(--error-bg, rgba(220, 53, 69, 0.1)';
            
            if (this.supportsEmoji()) {
                element.textContent = '✗ Failed';
            }
        }
        
        // Add animation if not reduced motion
        if (!isReducedMotion) {
            element.style.transform = 'scale(1.05)';
            element.style.transition = 'all 0.2s ease-in-out';
            
            setTimeout(() => {
                element.style.transform = originalTransform;
            }, 200);
        }
        
        // Add ARIA live region for screen readers
        this.announceCopyResult(success, originalText);
        
        // Restore original text after delay
        setTimeout(() => {
            element.textContent = originalText;
            element.style.color = originalColor;
            element.style.backgroundColor = originalBgColor;
            element.style.transform = originalTransform;
            element.style.transition = '';
        }, this.feedbackDuration);
    }

    // Announce copy result to screen readers
    announceCopyResult(success, text) {
        let announcement = document.getElementById('copy-announcement');
        
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'copy-announcement';
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            document.body.appendChild(announcement);
        }
        
        const message = success 
            ? `Copied "${text}" to clipboard`
            : `Failed to copy "${text}"`;
        
        announcement.textContent = message;
        
        // Clear announcement after a moment
        setTimeout(() => {
            announcement.textContent = '';
        }, 3000);
    }

    // Handle mouse enter for hover effects
    handleMouseEnter(element) {
        if (document.documentElement.classList.contains('reduced-motion')) return;
        
        element.style.transform = 'translateY(-2px)';
        element.style.transition = 'transform 0.2s ease-in-out';
        element.style.cursor = 'pointer';
    }

    // Handle mouse leave
    handleMouseLeave(element) {
        if (document.documentElement.classList.contains('reduced-motion')) return;
        
        element.style.transform = '';
        element.style.transition = 'transform 0.2s ease-in-out';
    }

    // Handle focus for keyboard navigation
    handleFocus(element) {
        element.style.outline = '2px solid var(--accent-color, #007bff)';
        element.style.outlineOffset = '2px';
    }

    // Handle blur
    handleBlur(element) {
        element.style.outline = '';
    }

    // Setup necessary styles
    setupStyles() {
        const styleId = 'contact-copy-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            [data-copy], .contact-copy {
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                position: relative;
            }
            
            [data-copy]:hover, .contact-copy:hover {
                opacity: 0.9;
            }
            
            [data-copy]:focus, .contact-copy:focus {
                outline: 2px solid var(--accent-color, #007bff);
                outline-offset: 2px;
            }
            
            .reduced-motion [data-copy],
            .reduced-motion .contact-copy {
                transition: none;
            }
            
            .copy-feedback {
                position: absolute;
                background: var(--bg-color, #fff);
                color: var(--text-color, #333);
                padding: 0.5rem 1rem;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                font-size: 0.875rem;
                z-index: 1000;
                animation: fadeInOut 2s ease-in-out;
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateY(10px); }
                10%, 90% { opacity: 1; transform: translateY(0); }
            }
            
            .reduced-motion .copy-feedback {
                animation: none;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Check if browser supports emoji
    supportsEmoji() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.fillText('😀', 0, 0);
            return ctx.getImageData(0, 0, 1, 1).data[3] > 0;
        } catch (e) {
            return false;
        }
    }

    // Log copy actions for analytics (optional)
    logCopyAction(text) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'copy_contact', {
                'event_category': 'engagement',
                'event_label': text
            });
        }
        
        // Custom event for other scripts
        document.dispatchEvent(new CustomEvent('contactCopied', {
            detail: { text: text, timestamp: new Date().toISOString() }
        }));
    }

    // Refresh copy elements (useful for dynamic content)
    refresh() {
        this.findCopyElements();
        this.setupEventListeners();
        this.setupAccessibility();
    }
}

// Initialize contact copy when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contactCopy = new ContactCopy();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactCopy;
}