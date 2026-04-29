// forms.js - Form validation, submission handling, and progressive profiling

import { validateEmail } from './utils/validation.js';
import { debounce } from './utils/debounce.js';

// Form handling configuration and state
const Forms = {
    config: {
        validationDelay: 300,
        animationDuration: 300,
        successMessageDuration: 5000,
        progressiveProfilingSteps: ['basic', 'professional', 'enterprise']
    },
    currentStep: 0,
    formData: {},
    userPreferences: {}
};

// Initialize form handling functionality
function initForms() {
    console.log('Initializing form handling...');
    
    // Setup form event listeners
    setupFormListeners();
    
    // Load saved user data for progressive profiling
    loadUserData();
    
    // Initialize form animations
    initFormAnimations();
    
    // Setup real-time validation
    setupRealTimeValidation();
    
    console.log('Form handling initialized successfully');
}

// Setup form event listeners
function setupFormListeners() {
    // Form submission handling
    document.addEventListener('submit', handleFormSubmission);
    
    // Input validation on blur
    document.addEventListener('blur', handleInputBlur, true);
    
    // Input validation on change for select and radio inputs
    document.addEventListener('change', handleInputChange);
    
    // Form reset handling
    document.addEventListener('reset', handleFormReset);
    
    // Progressive profiling step navigation
    document.addEventListener('click', handleStepNavigation);
}

// Handle form submission
function handleFormSubmission(e) {
    const form = e.target.closest('form');
    if (!form) return;
    
    e.preventDefault();
    
    // Validate the form
    if (validateForm(form)) {
        // Process form submission
        processFormSubmission(form);
    }
}

// Validate form inputs
function validateForm(form) {
    let isValid = true;
    const requiredInputs = form.querySelectorAll('[required]');
    const formType = form.getAttribute('data-form-type') || 'general';
    
    // Clear previous errors
    clearFormErrors(form);
    
    // Validate required fields
    requiredInputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
            showInputError(input, getValidationMessage(input));
        } else {
            hideInputError(input);
        }
    });
    
    // Form-specific validation
    if (formType === 'newsletter' && isValid) {
        isValid = validateNewsletterForm(form);
    } else if (formType === 'contact' && isValid) {
        isValid = validateContactForm(form);
    } else if (formType === 'enterprise' && isValid) {
        isValid = validateEnterpriseForm(form);
    }
    
    return isValid;
}

// Validate individual input
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const required = input.hasAttribute('required');
    
    if (required && !value) {
        return false;
    }
    
    switch (type) {
        case 'email':
            return validateEmail(value);
        case 'tel':
            return validatePhoneNumber(value);
        case 'url':
            return validateURL(value);
        case 'number':
            return validateNumber(input);
        case 'checkbox':
            return !required || input.checked;
        default:
            return true;
    }
}

// Get validation message for input
function getValidationMessage(input) {
    const type = input.type;
    const value = input.value.trim();
    
    if (!value && input.hasAttribute('required')) {
        return 'This field is required';
    }
    
    switch (type) {
        case 'email':
            return 'Please enter a valid email address';
        case 'tel':
            return 'Please enter a valid phone number';
        case 'url':
            return 'Please enter a valid URL';
        case 'number':
            if (input.hasAttribute('min') && Number(value) < Number(input.min)) {
                return `Value must be at least ${input.min}`;
            }
            if (input.hasAttribute('max') && Number(value) > Number(input.max)) {
                return `Value must be at most ${input.max}`;
            }
            return 'Please enter a valid number';
        default:
            return 'Please complete this field';
    }
}

// Show input error
function showInputError(input, message) {
    const errorId = `${input.id}-error` || `${input.name}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
        input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    input.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
    
    // Animate error appearance
    animateError(input);
}

// Hide input error
function hideInputError(input) {
    const errorId = `${input.id}-error` || `${input.name}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
}

// Clear all form errors
function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    const invalidInputs = form.querySelectorAll('.invalid');
    
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
    
    invalidInputs.forEach(input => {
        input.classList.remove('invalid');
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
    });
}

// Animate error appearance
function animateError(input) {
    input.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => {
        input.style.animation = '';
    }, 300);
}

// Handle input blur event
function handleInputBlur(e) {
    const input = e.target;
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
        validateInputOnBlur(input);
    }
}

// Validate input on blur
function validateInputOnBlur(input) {
    if (!validateInput(input)) {
        showInputError(input, getValidationMessage(input));
    } else {
        hideInputError(input);
    }
}

// Handle input change event
function handleInputChange(e) {
    const input = e.target;
    if (input.tagName === 'SELECT' || input.type === 'radio' || input.type === 'checkbox') {
        validateInputOnChange(input);
    }
}

// Validate input on change
function validateInputOnChange(input) {
    if (!validateInput(input)) {
        showInputError(input, getValidationMessage(input));
    } else {
        hideInputError(input);
    }
}

// Handle form reset
function handleFormReset(e) {
    const form = e.target;
    clearFormErrors(form);
    
    // Reset progressive profiling if applicable
    if (form.hasAttribute('data-progressive')) {
        resetProgressiveProfiling(form);
    }
}

// Process form submission
function processFormSubmission(form) {
    const formData = new FormData(form);
    const formType = form.getAttribute('data-form-type') || 'general';
    const isProgressive = form.hasAttribute('data-progressive');
    
    // Show loading state
    showLoadingState(form);
    
    // Store form data
    storeFormData(formData, formType);
    
    // Handle progressive profiling
    if (isProgressive) {
        handleProgressiveStep(form);
        return;
    }
    
    // Simulate API call (replace with actual API)
    setTimeout(() => {
        // Hide loading state
        hideLoadingState(form);
        
        // Show success message
        showSuccessMessage(form, getSuccessMessage(formType));
        
        // Reset form
        form.reset();
        
        // Track conversion
        trackFormConversion(formType);
    }, 1500);
}

// Show loading state
function showLoadingState(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    submitButton.setAttribute('data-original-text', originalText);
    
    // Add loading animation
    submitButton.classList.add('loading');
}

// Hide loading state
function hideLoadingState(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.getAttribute('data-original-text');
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    submitButton.classList.remove('loading');
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
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    form.appendChild(successElement);
    
    // Remove after duration
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.parentNode.removeChild(successElement);
        }
    }, Forms.config.successMessageDuration);
}

// Get success message based on form type
function getSuccessMessage(formType) {
    const messages = {
        newsletter: 'Thank you for subscribing to our newsletter!',
        contact: 'Thank you for your message! We\'ll get back to you soon.',
        enterprise: 'Thank you for your interest! Our team will contact you shortly.',
        lead: 'Thank you for your submission! We\'ll be in touch.',
        general: 'Thank you for your submission!'
    };
    
    return messages[formType] || messages.general;
}

// Store form data
function storeFormData(formData, formType) {
    const data = Object.fromEntries(formData);
    Forms.formData = { ...Forms.formData, ...data };
    
    // Save to localStorage for progressive profiling
    localStorage.setItem('formData', JSON.stringify(Forms.formData));
    localStorage.setItem('lastFormType', formType);
}

// Load user data for progressive profiling
function loadUserData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        try {
            Forms.formData = JSON.parse(savedData);
            populateSavedFormData();
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    }
}

// Populate saved form data
function populateSavedFormData() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const fieldName = input.name;
            if (fieldName && Forms.formData[fieldName]) {
                input.value = Forms.formData[fieldName];
            }
        });
    });
}

// Handle progressive profiling steps
function handleProgressiveStep(form) {
    Forms.currentStep++;
    
    if (Forms.currentStep >= Forms.config.progressiveProfilingSteps.length) {
        // Final submission
        completeProgressiveForm(form);
    } else {
        // Show next step
        showNextStep(form);
    }
}

// Show next progressive step
function showNextStep(form) {
    const currentStep = form.querySelector(`[data-step="${Forms.config.progressiveProfilingSteps[Forms.currentStep - 1]}"]`);
    const nextStep = form.querySelector(`[data-step="${Forms.config.progressiveProfilingSteps[Forms.currentStep]}"]`);
    
    if (currentStep && nextStep) {
        // Animate step transition
        animateStepTransition(currentStep, nextStep);
    }
}

// Animate step transition
function animateStepTransition(currentStep, nextStep) {
    currentStep.style.opacity = '0';
    currentStep.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        currentStep.style.display = 'none';
        nextStep.style.display = 'block';
        
        setTimeout(() => {
            nextStep.style.opacity = '1';
            nextStep.style.transform = 'translateX(0)';
        }, 50);
    }, Forms.config.animationDuration);
}

// Complete progressive form
function completeProgressiveForm(form) {
    // Hide loading state
    hideLoadingState(form);
    
    // Show success message
    showSuccessMessage(form, 'Thank you for completing your profile!');
    
    // Reset form and progressive state
    form.reset();
    Forms.currentStep = 0;
    
    // Clear progressive data
    localStorage.removeItem('formData');
}

// Reset progressive profiling
function resetProgressiveProfiling(form) {
    Forms.currentStep = 0;
    const steps = form.querySelectorAll('[data-step]');
    steps.forEach((step, index) => {
        step.style.display = index === 0 ? 'block' : 'none';
        step.style.opacity = index === 0 ? '1' : '0';
        step.style.transform = 'translateX(0)';
    });
}

// Setup real-time validation
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce((e) => {
            if (validateInput(input)) {
                hideInputError(input);
            }
        }, Forms.config.validationDelay));
    });
}

// Track form conversion
function trackFormConversion(formType) {
    console.log(`Form conversion tracked: ${formType}`);
    // Implement analytics tracking here
}

// Initialize form animations
function initFormAnimations() {
    // Add CSS animations for form elements
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .loading {
            position: relative;
            opacity: 0.7;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 16px;
            height: 16px;
            margin: -8px 0 0 -8px;
            border: 2px solid #fff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', initForms);

// Export form functions
export { 
    validateForm, 
    processFormSubmission, 
    showSuccessMessage,
    clearFormErrors,
    storeFormData
};