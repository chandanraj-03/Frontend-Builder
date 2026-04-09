// contact.js - Contact functionality for single-page portfolio

// Contact manager class
class ContactManager {
    constructor() {
        this.contactElements = new Map();
        this.copyTimeout = null;
        this.animationDuration = 300;
        this.init();
    }

    // Initialize contact functionality
    init() {
        this.cacheContactElements();
        this.setupEventListeners();
        this.setupContactAnimations();
        this.setupFormValidation();
    }

    // Cache contact-related DOM elements
    cacheContactElements() {
        // Contact information items
        this.contactElements.set('email', document.querySelector('.contact-email'));
        this.contactElements.set('phone', document.querySelector('.contact-phone'));
        this.contactElements.set('socialLinks', document.querySelectorAll('.social-link'));
        this.contactElements.set('contactForm', document.querySelector('.contact-form'));
        this.contactElements.set('contactSection', document.getElementById('contact-section'));
        
        // Feedback elements
        this.contactElements.set('copyFeedback', this.createCopyFeedbackElement());
    }

    // Create copy feedback element
    createCopyFeedbackElement() {
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(feedback);
        return feedback;
    }

    // Setup event listeners for contact functionality
    setupEventListeners() {
        // Click-to-copy for email
        const emailElement = this.contactElements.get('email');
        if (emailElement) {
            emailElement.addEventListener('click', (e) => this.handleContactCopy(e, 'email'));
            emailElement.style.cursor = 'pointer';
            emailElement.title = 'Click to copy email address';
        }

        // Click-to-copy for phone
        const phoneElement = this.contactElements.get('phone');
        if (phoneElement) {
            phoneElement.addEventListener('click', (e) => this.handleContactCopy(e, 'phone'));
            phoneElement.style.cursor = 'pointer';
            phoneElement.title = 'Click to copy phone number';
        }

        // Social link interactions
        const socialLinks = this.contactElements.get('socialLinks');
        if (socialLinks) {
            socialLinks.forEach(link => {
                link.addEventListener('click', (e) => this.handleSocialLinkClick(e));
                link.addEventListener('mouseenter', (e) => this.animateSocialLinkHover(e.currentTarget, true));
                link.addEventListener('mouseleave', (e) => this.animateSocialLinkHover(e.currentTarget, false));
            });
        }

        // Contact form submission
        const contactForm = this.contactElements.get('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Input focus/blur animations
        this.setupInputAnimations();
    }

    // Handle contact information copy
    async handleContactCopy(event, type) {
        event.preventDefault();
        
        const element = event.currentTarget;
        const valueToCopy = element.dataset.value || element.textContent.trim();
        
        try {
            await this.copyToClipboard(valueToCopy);
            this.showCopyFeedback(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`);
            this.animateCopySuccess(element);
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showCopyFeedback('Failed to copy. Please try again.', true);
        }
    }

    // Copy text to clipboard with modern API and fallback
    async copyToClipboard(text) {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        return new Promise((resolve, reject) => {
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Copy command failed'));
                }
            } catch (err) {
                document.body.removeChild(textArea);
                reject(err);
            }
        });
    }

    // Show copy feedback message
    showCopyFeedback(message, isError = false) {
        const feedback = this.contactElements.get('copyFeedback');
        if (!feedback) return;

        // Clear existing timeout
        if (this.copyTimeout) {
            clearTimeout(this.copyTimeout);
        }

        // Update feedback content and style
        feedback.textContent = message;
        feedback.style.background = isError ? '#f44336' : '#4CAF50';
        feedback.style.opacity = '1';
        feedback.style.transform = 'translateX(0)';

        // Auto-hide after delay
        this.copyTimeout = setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(100px)';
        }, 2000);
    }

    // Animate copy success
    animateCopySuccess(element) {
        element.style.transition = `transform ${this.animationDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55), 
                                  background-color ${this.animationDuration}ms ease`;
        element.style.transform = 'scale(1.1)';
        element.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.backgroundColor = '';
        }, this.animationDuration);
    }

    // Handle social link clicks
    handleSocialLinkClick(event) {
        event.preventDefault();
        const link = event.currentTarget;
        const url = link.href;
        
        // Animate click
        this.animateSocialLinkClick(link);
        
        // Open in new tab after animation
        setTimeout(() => {
            window.open(url, '_blank', 'noopener,noreferrer');
        }, this.animationDuration / 2);
    }

    // Animate social link hover
    animateSocialLinkHover(link, isHover) {
        link.style.transition = `transform ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1), 
                               color ${this.animationDuration}ms ease`;
        
        if (isHover) {
            link.style.transform = 'translateY(-2px) scale(1.1)';
            link.style.color = link.dataset.hoverColor || '#2196F3';
        } else {
            link.style.transform = 'translateY(0) scale(1)';
            link.style.color = '';
        }
    }

    // Animate social link click
    animateSocialLinkClick(link) {
        link.style.transition = `transform ${this.animationDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        link.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            link.style.transform = 'scale(1)';
        }, this.animationDuration);
    }

    // Setup contact form validation
    setupFormValidation() {
        const form = this.contactElements.get('contactForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearFieldError(e.target));
        });
    }

    // Validate individual form field
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                isValid = this.isValidEmail(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'text':
                if (field.name === 'name') {
                    isValid = value.length >= 2;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;
            case 'textarea':
                isValid = value.length >= 10;
                errorMessage = 'Message must be at least 10 characters';
                break;
        }

        if (!isValid && value) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    // Check if email is valid
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show field error
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#f44336';
        field.style.transition = 'border-color 0.3s ease';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #f44336;
            font-size: 12px;
            margin-top: 4px;
            animation: fadeIn 0.3s ease;
        `;
        
        field.parentNode.appendChild(errorElement);
    }

    // Clear field error
    clearFieldError(field) {
        field.style.borderColor = '';
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Handle form submission
    async handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        
        // Validate all fields
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.animateFormError(form);
            return;
        }

        // Simulate form submission
        await this.submitForm(form);
    }

    // Animate form error state
    animateFormError(form) {
        form.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        form.style.transform = 'translateX(-10px)';
        
        setTimeout(() => {
            form.style.transform = 'translateX(10px)';
            setTimeout(() => {
                form.style.transform = 'translateX(0)';
            }, 100);
        }, 100);
    }

    // Simulate form submission (replace with actual API call)
    async submitForm(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        submitButton.style.opacity = '0.7';
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            this.showFormSuccess(form);
            form.reset();
            
        } catch (error) {
            this.showFormError(form, 'Failed to send message. Please try again.');
        } finally {
            // Reset button state
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                submitButton.style.opacity = '1';
            }, 1000);
        }
    }

    // Show form success message
    showFormSuccess(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.textContent = 'Message sent successfully!';
        successMessage.style.cssText = `
            background: #4CAF50;
            color: white;
            padding: 12px;
            border-radius: 4px;
            margin-top: 16px;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;
        
        form.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.transition = 'opacity 0.3s ease';
            setTimeout(() => successMessage.remove(), 300);
        }, 3000);
    }

    // Show form error message
    showFormError(form, message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-error';
        errorMessage.textContent = message;
        errorMessage.style.cssText = `
            background: #f44336;
            color: white;
            padding: 12px;
            border-radius: 4px;
            margin-top: 16px;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;
        
        form.appendChild(errorMessage);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }

    // Setup input animations
    setupInputAnimations() {
        const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.transition = 'transform 0.3s ease';
            });
            
            input.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    e.target.parentElement.classList.remove('focused');
                }
                e.target.style.transform = 'translateY(0)';
            });
        });
    }

    // Setup contact section animations
    setupContactAnimations() {
        const contactSection = this.contactElements.get('contactSection');
        if (!contactSection) return;

        // Add intersection observer for contact section
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateContactSection(entry.target);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(contactSection);
    }

    // Animate contact section when it comes into view
    animateContactSection(section) {
        const elements = section.querySelectorAll('.contact-info, .contact-form');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = `opacity 0.6s ease ${index * 200}ms, transform 0.6s ease ${index * 200}ms`;
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Update contact information dynamically
    updateContactInfo(newInfo) {
        const emailElement = this.contactElements.get('email');
        const phoneElement = this.contactElements.get('phone');
        
        if (newInfo.email && emailElement) {
            emailElement.textContent = newInfo.email;
            emailElement.dataset.value = newInfo.email;
        }
        
        if (newInfo.phone && phoneElement) {
            phoneElement.textContent = newInfo.phone;
            phoneElement.dataset.value = newInfo.phone;
        }
    }
}

// Initialize contact manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const contactManager = new ContactManager();
    
    // Export for global access if needed
    window.contactManager = contactManager;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactManager;
}