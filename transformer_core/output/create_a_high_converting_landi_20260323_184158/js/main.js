// main.js - Core application logic, initialization, and shared utilities
// Handles application-wide functionality, animations, and component management

class App {
    constructor() {
        this.isInitialized = false;
        this.currentSection = '';
        this.scrollPosition = 0;
        this.userData = {};
        this.components = {};
    }

    // Initialize the application
    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.initComponents();
        this.setupSmoothScrolling();
        this.setupStickyNavigation();
        this.setupExitIntentPopup();
        this.setupAnimations();
        
        this.isInitialized = true;
        console.log('Application initialized successfully');
    }

    // Setup global event listeners
    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Scroll handler for various effects
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Click outside handlers for modals and dropdowns
        document.addEventListener('click', this.handleClickOutside.bind(this));
        
        // Form submission handler
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    // Initialize all interactive components
    initComponents() {
        this.components.navigation = this.initNavigation();
        this.components.forms = this.initForms();
        this.components.animations = this.initAnimations();
        this.components.modals = this.initModals();
    }

    // Smooth scrolling between sections
    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Sticky navigation with scroll effects
    setupStickyNavigation() {
        const header = document.querySelector('header');
        const scrollThreshold = 100;
        
        const toggleStickyHeader = () => {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        };
        
        window.addEventListener('scroll', toggleStickyHeader);
    }

    // Exit-intent popup functionality
    setupExitIntentPopup() {
        let mouseY = 0;
        
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 50) {
                this.showExitIntentPopup();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            mouseY = e.clientY;
        });
    }

    // Animation setup for various components
    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(el => observer.observe(el));
    }

    // Navigation component initialization
    initNavigation() {
        const nav = {
            toggleMobileMenu: () => {
                const menu = document.querySelector('.mobile-menu');
                const toggle = document.querySelector('.menu-toggle');
                
                if (toggle && menu) {
                    toggle.addEventListener('click', () => {
                        menu.classList.toggle('active');
                        toggle.classList.toggle('active');
                    });
                }
            },
            
            updateActiveSection: () => {
                const sections = document.querySelectorAll('section[id]');
                const navLinks = document.querySelectorAll('nav a[href^="#"]');
                
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const headerHeight = document.querySelector('header').offsetHeight;
                    
                    if (rect.top <= headerHeight + 100 && rect.bottom >= headerHeight + 100) {
                        const currentId = section.getAttribute('id');
                        
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${currentId}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                });
            }
        };
        
        nav.toggleMobileMenu();
        return nav;
    }

    // Form handling and validation
    initForms() {
        return {
            validateForm: (form) => {
                const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        this.showValidationError(input, 'This field is required');
                    } else {
                        this.clearValidationError(input);
                    }
                });
                
                return isValid;
            },
            
            showValidationError: (input, message) => {
                input.classList.add('error');
                let errorElement = input.parentNode.querySelector('.error-message');
                
                if (!errorElement) {
                    errorElement = document.createElement('div');
                    errorElement.className = 'error-message';
                    input.parentNode.appendChild(errorElement);
                }
                
                errorElement.textContent = message;
            },
            
            clearValidationError: (input) => {
                input.classList.remove('error');
                const errorElement = input.parentNode.querySelector('.error-message');
                if (errorElement) {
                    errorElement.remove();
                }
            },
            
            handleProgressiveProfiling: (form) => {
                const fields = form.querySelectorAll('[data-progressive]');
                
                fields.forEach(field => {
                    field.addEventListener('change', () => {
                        const nextField = field.getAttribute('data-next-field');
                        if (nextField) {
                            const nextElement = form.querySelector(`[name="${nextField}"]`);
                            if (nextElement) {
                                nextElement.closest('.form-group').style.display = 'block';
                            }
                        }
                    });
                });
            }
        };
    }

    // Animation utilities
    initAnimations() {
        return {
            fadeIn: (element, duration = 300) => {
                element.style.opacity = 0;
                element.style.display = 'block';
                
                let start = null;
                const animate = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const opacity = Math.min(progress / duration, 1);
                    
                    element.style.opacity = opacity;
                    
                    if (progress < duration) {
                        requestAnimationFrame(animate);
                    }
                };
                
                requestAnimationFrame(animate);
            },
            
            fadeOut: (element, duration = 300) => {
                let start = null;
                const initialOpacity = parseFloat(element.style.opacity) || 1;
                
                const animate = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const opacity = Math.max(initialOpacity - (progress / duration), 0);
                    
                    element.style.opacity = opacity;
                    
                    if (progress < duration) {
                        requestAnimationFrame(animate);
                    } else {
                        element.style.display = 'none';
                    }
                };
                
                requestAnimationFrame(animate);
            },
            
            slideToggle: (element, duration = 300) => {
                if (element.style.display === 'none') {
                    element.style.display = 'block';
                    const height = element.scrollHeight;
                    element.style.height = '0px';
                    element.style.overflow = 'hidden';
                    
                    setTimeout(() => {
                        element.style.height = height + 'px';
                    }, 10);
                    
                    setTimeout(() => {
                        element.style.height = '';
                        element.style.overflow = '';
                    }, duration);
                } else {
                    const height = element.scrollHeight;
                    element.style.height = height + 'px';
                    element.style.overflow = 'hidden';
                    
                    setTimeout(() => {
                        element.style.height = '0px';
                    }, 10);
                    
                    setTimeout(() => {
                        element.style.display = 'none';
                        element.style.height = '';
                        element.style.overflow = '';
                    }, duration);
                }
            }
        };
    }

    // Modal and popup management
    initModals() {
        return {
            openModal: (modalId) => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    this.components.animations.fadeIn(modal);
                }
            },
            
            closeModal: (modalId) => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    this.components.animations.fadeOut(modal, 200);
                    setTimeout(() => {
                        modal.style.display = 'none';
                        document.body.style.overflow = '';
                    }, 200);
                }
            },
            
            closeAllModals: () => {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    this.components.animations.fadeOut(modal, 200);
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 200);
                });
                document.body.style.overflow = '';
            }
        };
    }

    // Utility functions
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
    }

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

    // Event handlers
    handleResize() {
        this.debounce(() => {
            // Handle responsive adjustments
            if (typeof this.components.navigation?.updateMobileMenu === 'function') {
                this.components.navigation.updateMobileMenu();
            }
        }, 250)();
    }

    handleScroll() {
        this.throttle(() => {
            this.scrollPosition = window.scrollY;
            
            // Update active navigation section
            if (this.components.navigation?.updateActiveSection) {
                this.components.navigation.updateActiveSection();
            }
            
            // Parallax effects or other scroll-based animations
            this.updateScrollEffects();
        }, 100)();
    }

    handleClickOutside(e) {
        // Close dropdowns when clicking outside
        const dropdowns = document.querySelectorAll('.dropdown.active');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        // Close modals when clicking outside content
        const modals = document.querySelectorAll('.modal[style*="display: block"]');
        modals.forEach(modal => {
            if (e.target === modal) {
                this.components.modals.closeModal(modal.id);
            }
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (this.components.forms.validateForm(form)) {
            this.processFormSubmission(form);
        }
    }

    // Additional utility methods
    updateScrollEffects() {
        // Implement parallax or other scroll-based effects
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed')) || 0.5;
            const yPos = -(this.scrollPosition * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }

    showExitIntentPopup() {
        if (!this.userData.hasSeenExitPopup) {
            this.components.modals.openModal('exit-intent-popup');
            this.userData.hasSeenExitPopup = true;
        }
    }

    processFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        console.log('Form submitted:', data);
        
        // Show success message
        this.showSuccessMessage('Thank you for your submission!');
        
        // Reset form
        form.reset();
    }

    showSuccessMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'success-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    // Public API for other modules
    getComponent(name) {
        return this.components[name];
    }
    
    getUserData() {
        return this.userData;
    }
    
    setUserData(key, value) {
        this.userData[key] = value;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}