// main.js - Core application logic, initialization, and shared utilities for SaaS website

import { smoothScroll } from './utils/smoothScroll.js';
import { debounce } from './utils/debounce.js';
import { throttle } from './utils/throttle.js';
import { validateEmail } from './utils/validation.js';

// Global application state and configuration
const App = {
    isMobile: window.innerWidth < 768,
    isScrolled: false,
    currentSection: 'hero',
    userData: {},
    config: {
        scrollOffset: 80,
        animationDuration: 300,
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        }
    }
};

// Initialize all components and event listeners
function initApp() {
    console.log('Initializing application...');
    
    // Set up global event listeners
    setupEventListeners();
    
    // Initialize responsive behavior
    initResponsiveDesign();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize scroll-based animations
    initScrollAnimations();
    
    // Initialize exit intent detection
    initExitIntent();
    
    // Load user preferences if available
    loadUserPreferences();
    
    console.log('Application initialized successfully');
}

// Set up global event listeners
function setupEventListeners() {
    // Window resize handler
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Scroll handler
    window.addEventListener('scroll', throttle(handleScroll, 100));
    
    // Click handler for smooth navigation
    document.addEventListener('click', handleNavigationClicks);
    
    // Form submission handler
    document.addEventListener('submit', handleFormSubmissions);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Handle window resize with debouncing
function handleResize() {
    App.isMobile = window.innerWidth < App.config.breakpoints.mobile;
    updateResponsiveElements();
    checkViewportChanges();
}

// Handle scroll events with throttling
function handleScroll() {
    const scrollPosition = window.scrollY;
    App.isScrolled = scrollPosition > 100;
    
    updateStickyNavigation();
    updateScrollProgress();
    triggerScrollAnimations(scrollPosition);
    trackSectionVisibility(scrollPosition);
}

// Handle navigation clicks for smooth scrolling
function handleNavigationClicks(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        smoothScrollToSection(targetId);
    }
}

// Handle form submissions with validation
function handleFormSubmissions(e) {
    const form = e.target.closest('form');
    if (form) {
        e.preventDefault();
        
        if (validateForm(form)) {
            processFormSubmission(form);
        }
    }
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
    // Escape key closes modals and popups
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // Tab key navigation enhancement
    if (e.key === 'Tab') {
        enhanceTabNavigation(e);
    }
}

// Initialize responsive design behaviors
function initResponsiveDesign() {
    updateResponsiveElements();
    setupMobileNavigation();
    optimizeTouchInteractions();
}

// Initialize smooth scrolling functionality
function initSmoothScroll() {
    smoothScroll.init({
        offset: App.config.scrollOffset,
        duration: App.config.animationDuration
    });
}

// Initialize scroll-based animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity ${App.config.animationDuration}ms ease, transform ${App.config.animationDuration}ms ease`;
    });
}

// Initialize exit intent detection
function initExitIntent() {
    document.addEventListener('mouseleave', debounce((e) => {
        if (e.clientY < 50 && !localStorage.getItem('exitIntentShown')) {
            showExitIntentPopup();
            localStorage.setItem('exitIntentShown', 'true');
        }
    }, 100));
}

// Smooth scroll to specific section
function smoothScrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        smoothScroll.toElement(targetElement);
        updateActiveNavigation(sectionId);
    }
}

// Validate form inputs
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && !validateEmail(input.value)) {
            markInvalid(input, 'Please enter a valid email address');
            isValid = false;
        } else {
            markValid(input);
        }
    });
    
    return isValid;
}

// Mark input as invalid
function markInvalid(input, message) {
    input.classList.add('invalid');
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
    }
}

// Mark input as valid
function markValid(input) {
    input.classList.remove('invalid');
    const errorElement = input.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
    }
}

// Process form submission
function processFormSubmission(form) {
    const formData = new FormData(form);
    const formType = form.getAttribute('data-form-type') || 'general';
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        // Store form data in user profile
        updateUserProfile(formData, formType);
        
        // Show success message
        showSuccessMessage(form, 'Thank you for your submission!');
        
        // Reset form and button
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Trigger conversion event
        trackConversion(formType);
    }, 1500);
}

// Update user profile with form data
function updateUserProfile(formData, formType) {
    const data = Object.fromEntries(formData);
    App.userData = { ...App.userData, ...data, lastSubmission: new Date().toISOString() };
    
    // Save to localStorage for progressive profiling
    localStorage.setItem('userProfile', JSON.stringify(App.userData));
}

// Track conversion event
function trackConversion(formType) {
    // Implement analytics tracking here
    console.log(`Conversion tracked: ${formType}`);
    
    // Trigger CTA animation if this is a primary conversion
    if (formType === 'lead-capture' || formType === 'newsletter') {
        animateCTASuccess();
    }
}

// Show success message
function showSuccessMessage(form, message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.cssText = `
        background: #d4edda;
        color: #155724;
        padding: 12px;
        border-radius: 4px;
        margin-top: 16px;
        border: 1px solid #c3e6cb;
    `;
    
    form.appendChild(successElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.parentNode.removeChild(successElement);
        }
    }, 5000);
}

// Update responsive elements based on screen size
function updateResponsiveElements() {
    const elements = document.querySelectorAll('[data-responsive]');
    elements.forEach(element => {
        const mobileContent = element.getAttribute('data-mobile');
        const desktopContent = element.getAttribute('data-desktop');
        
        if (App.isMobile && mobileContent) {
            element.textContent = mobileContent;
        } else if (!App.isMobile && desktopContent) {
            element.textContent = desktopContent;
        }
    });
}

// Setup mobile navigation
function setupMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Optimize touch interactions for mobile
function optimizeTouchInteractions() {
    if (App.isMobile) {
        // Add touch-specific event listeners
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd);
    }
}

// Handle touch events
function handleTouchStart(e) {
    // Implement touch-specific logic
}

function handleTouchMove(e) {
    // Implement touch-specific logic
}

function handleTouchEnd(e) {
    // Implement touch-specific logic
}

// Update sticky navigation based on scroll
function updateStickyNavigation() {
    const nav = document.querySelector('.sticky-nav');
    if (nav) {
        if (App.isScrolled) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
}

// Update scroll progress indicator
function updateScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        progressBar.style.width = `${scrollPercent}%`;
    }
}

// Trigger animations when elements come into view
function triggerScrollAnimations(scrollPosition) {
    const animatedElements = document.querySelectorAll('[data-animate]');
    const windowHeight = window.innerHeight;
    
    animatedElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < windowHeight * 0.8 && elementBottom > 0) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Track which section is currently visible
function trackSectionVisibility(scrollPosition) {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = 'hero';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - App.config.scrollOffset;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = section.id;
        }
    });
    
    if (currentSection !== App.currentSection) {
        App.currentSection = currentSection;
        updateActiveNavigation(currentSection);
    }
}

// Update active navigation item
function updateActiveNavigation(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${sectionId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Show exit intent popup
function showExitIntentPopup() {
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
        popup.classList.add('active');
        
        // Add event listener to close popup
        const closeButton = popup.querySelector('.close-popup');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                popup.classList.remove('active');
            });
        }
    }
}

// Close all modals and popups
function closeAllModals() {
    const modals = document.querySelectorAll('.modal, .popup');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
}

// Enhance tab navigation for accessibility
function enhanceTabNavigation(e) {
    // Implement keyboard navigation enhancements
}

// Check for viewport changes and adjust layout
function checkViewportChanges() {
    // Handle specific layout changes based on viewport size
}

// Load user preferences from localStorage
function loadUserPreferences() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        try {
            App.userData = JSON.parse(savedProfile);
            populateSavedData();
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
}

// Populate forms with saved user data
function populateSavedData() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            const fieldName = input.name;
            if (fieldName && App.userData[fieldName]) {
                input.value = App.userData[fieldName];
            }
        });
    });
}

// Animate CTA success
function animateCTASuccess() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    ctaButtons.forEach(button => {
        button.classList.add('success');
        setTimeout(() => {
            button.classList.remove('success');
        }, 3000);
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export utility functions for use in other modules
export { 
    App, 
    smoothScrollToSection, 
    validateForm, 
    processFormSubmission,
    updateUserProfile,
    trackConversion
};