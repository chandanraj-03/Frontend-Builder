// main.js - Core application logic, initialization, and shared utilities
// Handles application setup, theme management, accessibility features, and shared functionality

class PortfolioApp {
    constructor() {
        this.currentTheme = 'light';
        this.isReducedMotion = false;
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.setupAccessibility();
        this.initializeComponents();
        this.setupSmoothScrolling();
        this.checkReducedMotionPreference();
    }

    // Set up global event listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Reduced motion toggle
        const motionToggle = document.getElementById('motion-toggle');
        if (motionToggle) {
            motionToggle.addEventListener('click', () => this.toggleReducedMotion());
        }

        // Navigation smooth scrolling
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Back to top button
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', () => this.scrollToTop());
        }

        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Load event for initial setup
        window.addEventListener('load', () => this.onPageLoad());
    }

    // Initialize all interactive components
    initializeComponents() {
        this.initClickToCopy();
        this.initImageGallery();
        this.initProjectShowcase();
        this.initContactForm();
        this.initNavigation();
    }

    // Setup accessibility features
    setupAccessibility() {
        // Add skip to content link functionality
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Focus management for modals and overlays
        this.setupFocusManagement();
    }

    // Handle navigation clicks with smooth scrolling
    handleNavClick(event) {
        event.preventDefault();
        const targetId = event.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            this.scrollToElement(targetElement);
        }
    }

    // Smooth scroll to element
    scrollToElement(element) {
        const offset = 80; // Account for fixed header
        const elementPosition = element.offsetTop - offset;
        
        window.scrollTo({
            top: elementPosition,
            behavior: this.isReducedMotion ? 'auto' : 'smooth'
        });
    }

    // Scroll to top of page
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: this.isReducedMotion ? 'auto' : 'smooth'
        });
    }

    // Toggle between light and dark themes
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('portfolio-theme', this.currentTheme);
        
        // Update theme toggle button text/icon
        this.updateThemeToggle();
    }

    // Update theme toggle button state
    updateThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i') || themeToggle;
            if (this.currentTheme === 'dark') {
                icon.textContent = '☀️';
                icon.setAttribute('aria-label', 'Switch to light theme');
            } else {
                icon.textContent = '🌙';
                icon.setAttribute('aria-label', 'Switch to dark theme');
            }
        }
    }

    // Toggle reduced motion preference
    toggleReducedMotion() {
        this.isReducedMotion = !this.isReducedMotion;
        document.documentElement.classList.toggle('reduced-motion', this.isReducedMotion);
        localStorage.setItem('portfolio-reduced-motion', this.isReducedMotion);
        
        // Update motion toggle button
        this.updateMotionToggle();
    }

    // Update reduced motion toggle button
    updateMotionToggle() {
        const motionToggle = document.getElementById('motion-toggle');
        if (motionToggle) {
            const icon = motionToggle.querySelector('i') || motionToggle;
            if (this.isReducedMotion) {
                icon.textContent = '🚶';
                icon.setAttribute('aria-label', 'Enable animations');
            } else {
                icon.textContent = '🏃';
                icon.setAttribute('aria-label', 'Reduce animations');
            }
        }
    }

    // Check user's reduced motion preference
    checkReducedMotionPreference() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const savedPreference = localStorage.getItem('portfolio-reduced-motion');
        
        if (savedPreference !== null) {
            this.isReducedMotion = savedPreference === 'true';
        } else {
            this.isReducedMotion = prefersReducedMotion;
        }
        
        if (this.isReducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        }
    }

    // Setup smooth scrolling behavior
    setupSmoothScrolling() {
        // Add CSS for smooth scrolling
        const style = document.createElement('style');
        style.textContent = `
            html {
                scroll-behavior: smooth;
            }
            html.reduced-motion {
                scroll-behavior: auto;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize click-to-copy functionality
    initClickToCopy() {
        const copyElements = document.querySelectorAll('[data-copy-text]');
        
        copyElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const textToCopy = element.getAttribute('data-copy-text') || element.textContent;
                this.copyToClipboard(textToCopy);
                
                // Show feedback
                this.showCopyFeedback(element);
            });
            
            // Add accessibility attributes
            element.setAttribute('role', 'button');
            element.setAttribute('tabindex', '0');
            element.setAttribute('aria-label', `Copy ${element.textContent} to clipboard`);
        });
    }

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    // Show copy feedback animation
    showCopyFeedback(element) {
        const originalText = element.textContent;
        element.textContent = 'Copied!';
        element.style.color = 'var(--accent-color, #007bff)';
        
        setTimeout(() => {
            element.textContent = originalText;
            element.style.color = '';
        }, 2000);
    }

    // Initialize image gallery functionality
    initImageGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            item.addEventListener('click', () => this.openImageModal(item));
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    this.openImageModal(item);
                }
            });
        });
    }

    // Open image modal
    openImageModal(item) {
        // Implementation for image modal
        console.log('Opening image modal for:', item);
    }

    // Initialize project showcase interactions
    initProjectShowcase() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.showProjectDetails(card));
            card.addEventListener('mouseleave', () => this.hideProjectDetails(card));
            card.addEventListener('focus', () => this.showProjectDetails(card));
            card.addEventListener('blur', () => this.hideProjectDetails(card));
        });
    }

    // Show project details on hover/focus
    showProjectDetails(card) {
        if (this.isReducedMotion) return;
        
        const details = card.querySelector('.project-details');
        if (details) {
            details.style.opacity = '1';
            details.style.transform = 'translateY(0)';
        }
    }

    // Hide project details
    hideProjectDetails(card) {
        if (this.isReducedMotion) return;
        
        const details = card.querySelector('.project-details');
        if (details) {
            details.style.opacity = '0';
            details.style.transform = 'translateY(10px)';
        }
    }

    // Initialize contact form handling
    initContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
    }

    // Handle contact form submission
    async handleContactSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        // Basic validation
        if (!this.validateContactForm(formData)) {
            return;
        }
        
        // Show loading state
        this.setFormLoadingState(form, true);
        
        try {
            // Simulate form submission
            await this.submitContactForm(formData);
            this.showFormSuccess(form);
        } catch (error) {
            this.showFormError(form, error.message);
        } finally {
            this.setFormLoadingState(form, false);
        }
    }

    // Validate contact form
    validateContactForm(formData) {
        const email = formData.get('email');
        const message = formData.get('message');
        
        if (!email || !message) {
            this.showFormError(null, 'Please fill in all required fields');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showFormError(null, 'Please enter a valid email address');
            return false;
        }
        
        return true;
    }

    // Check if email is valid
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Set form loading state
    setFormLoadingState(form, isLoading) {
        const submitButton = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, textarea');
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            inputs.forEach(input => input.disabled = true);
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            inputs.forEach(input => input.disabled = false);
        }
    }

    // Simulate form submission
    async submitContactForm(formData) {
        // In a real application, this would be an API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure for demo
                Math.random() > 0.1 ? resolve() : reject(new Error('Network error. Please try again.'));
            }, 1500);
        });
    }

    // Show form success message
    showFormSuccess(form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.textContent = 'Message sent successfully!';
        successMessage.setAttribute('role', 'alert');
        
        form.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.remove();
            form.reset();
        }, 3000);
    }

    // Show form error message
    showFormError(form, message) {
        let errorElement = form ? form.querySelector('.form-error') : document.getElementById('form-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.setAttribute('role', 'alert');
            
            if (form) {
                form.insertBefore(errorElement, form.firstChild);
            } else {
                document.body.appendChild(errorElement);
            }
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    // Initialize navigation functionality
    initNavigation() {
        this.setupMobileNavigation();
        this.setupActiveNavHighlight();
    }

    // Setup mobile navigation
    setupMobileNavigation() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const navMenu = document.querySelector('nav ul');
        
        if (mobileMenuButton && navMenu) {
            mobileMenuButton.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuButton.setAttribute('aria-expanded', 
                    navMenu.classList.contains('active').toString());
            });
        }
    }

    // Setup active navigation highlighting
    setupActiveNavHighlight() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.5
        });
        
        sections.forEach(section => observer.observe(section));
    }

    // Setup focus management for accessibility
    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && document.querySelector('.modal.open')) {
                this.trapFocus(e);
            }
        });
    }

    // Trap focus within modal
    trapFocus(event) {
        // Implementation for focus trapping in modals
    }

    // Handle window resize
    handleResize() {
        // Adjust layout for mobile/desktop
        this.adjustLayout();
    }

    // Adjust layout based on screen size
    adjustLayout() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('mobile', isMobile);
    }

    // Page load completion handler
    onPageLoad() {
        // Restore user preferences
        const savedTheme = localStorage.getItem('portfolio-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', this.currentTheme);
            this.updateThemeToggle();
        }
        
        // Initialize animations after load
        this.initializeAnimations();
        
        // Adjust layout
        this.adjustLayout();
    }

    // Initialize entrance animations
    initializeAnimations() {
        if (this.isReducedMotion) return;
        
        const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
        
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('animate');
        });
    }
}

// Utility functions
const Utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Generate unique ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioApp, Utils };
}