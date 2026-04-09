// forms.js - Form validation, submission handling, and progressive profiling system
// Handles all form-related functionality including validation, submission, and user experience

class FormHandler {
    constructor() {
        this.forms = new Map();
        this.currentStep = new Map();
        this.formData = new Map();
        this.validationRules = new Map();
        this.isSubmitting = false;
    }

    // Initialize form handling system
    init() {
        this.setupFormValidation();
        this.setupProgressiveProfiling();
        this.setupFormAnimations();
        this.setupAutoSave();
        this.setupFileUploads();
        this.setupFormEvents();
        
        console.log('Form handling system initialized');
    }

    // Setup form validation for all forms
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            this.initializeForm(form);
            this.setupValidationRules(form);
            this.setupRealTimeValidation(form);
        });
    }

    // Initialize individual form
    initializeForm(form) {
        const formId = form.id || `form-${Math.random().toString(36).substr(2, 9)}`;
        form.setAttribute('data-form-id', formId);
        
        this.forms.set(formId, form);
        this.currentStep.set(formId, 1);
        this.formData.set(formId, {});
        this.validationRules.set(formId, new Map());

        // Add loading state management
        form.classList.add('form-initialized');
    }

    // Setup validation rules for form fields
    setupValidationRules(form) {
        const formId = form.getAttribute('data-form-id');
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            const rules = this.getFieldValidationRules(field);
            this.validationRules.get(formId).set(field.name, rules);
            
            // Add ARIA attributes for accessibility
            this.setupAriaAttributes(field);
        });
    }

    // Get validation rules for a specific field
    getFieldValidationRules(field) {
        const rules = [];
        const type = field.type;
        const tagName = field.tagName.toLowerCase();

        // Required validation
        if (field.required) {
            rules.push({
                type: 'required',
                message: 'This field is required',
                validate: (value) => value && value.trim().length > 0
            });
        }

        // Email validation
        if (type === 'email' || field.getAttribute('data-validation') === 'email') {
            rules.push({
                type: 'email',
                message: 'Please enter a valid email address',
                validate: (value) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value);
                }
            });
        }

        // Phone validation
        if (type === 'tel' || field.getAttribute('data-validation') === 'phone') {
            rules.push({
                type: 'phone',
                message: 'Please enter a valid phone number',
                validate: (value) => {
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
                }
            });
        }

        // URL validation
        if (type === 'url' || field.getAttribute('data-validation') === 'url') {
            rules.push({
                type: 'url',
                message: 'Please enter a valid URL',
                validate: (value) => {
                    try {
                        new URL(value);
                        return true;
                    } catch {
                        return false;
                    }
                }
            });
        }

        // Min length validation
        const minLength = field.getAttribute('minlength');
        if (minLength) {
            rules.push({
                type: 'minlength',
                message: `Must be at least ${minLength} characters`,
                validate: (value) => value.length >= parseInt(minLength)
            });
        }

        // Max length validation
        const maxLength = field.getAttribute('maxlength');
        if (maxLength) {
            rules.push({
                type: 'maxlength',
                message: `Must be less than ${maxLength} characters`,
                validate: (value) => value.length <= parseInt(maxLength)
            });
        }

        // Pattern validation
        const pattern = field.getAttribute('pattern');
        if (pattern) {
            rules.push({
                type: 'pattern',
                message: 'Please match the requested format',
                validate: (value) => new RegExp(pattern).test(value)
            });
        }

        // Custom validation
        const customValidation = field.getAttribute('data-custom-validation');
        if (customValidation) {
            try {
                const customValidator = new Function('value', customValidation);
                rules.push({
                    type: 'custom',
                    message: field.getAttribute('data-custom-message') || 'Invalid value',
                    validate: customValidator
                });
            } catch (error) {
                console.warn('Invalid custom validation function:', error);
            }
        }

        return rules;
    }

    // Setup real-time validation
    setupRealTimeValidation(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Validate on blur
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            // Validate on input (for real-time feedback)
            field.addEventListener('input', this.debounce(() => {
                this.validateField(field, true);
            }, 300));

            // Clear errors on focus
            field.addEventListener('focus', () => {
                this.clearFieldError(field);
            });
        });
    }

    // Validate individual field
    validateField(field, isRealTime = false) {
        const form = field.closest('form');
        const formId = form.getAttribute('data-form-id');
        const rules = this.validationRules.get(formId).get(field.name);
        const value = field.value.trim();
        let isValid = true;

        if (!rules) return true;

        // Clear previous errors
        this.clearFieldError(field);

        // Validate against each rule
        for (const rule of rules) {
            if (!rule.validate(value)) {
                if (!isRealTime || (isRealTime && value.length > 0)) {
                    this.showFieldError(field, rule.message);
                }
                isValid = false;
                break; // Stop at first error
            }
        }

        // Update field state
        this.updateFieldState(field, isValid);

        return isValid;
    }

    // Show field error
    showFieldError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');

        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Animate error appearance
        this.animateError(errorElement);
    }

    // Clear field error
    clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');

        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    }

    // Update field visual state
    updateFieldState(field, isValid) {
        if (isValid && field.value.trim().length > 0) {
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
        }
    }

    // Animate error appearance
    animateError(errorElement) {
        errorElement.style.opacity = '0';
        errorElement.style.transform = 'translateY(-10px)';
        errorElement.style.display = 'block';

        requestAnimationFrame(() => {
            errorElement.style.transition = 'all 0.3s ease';
            errorElement.style.opacity = '1';
            errorElement.style.transform = 'translateY(0)';
        });
    }

    // Setup progressive profiling for multi-step forms
    setupProgressiveProfiling() {
        const progressiveForms = document.querySelectorAll('[data-progressive-form]');
        
        progressiveForms.forEach(form => {
            this.initializeProgressiveForm(form);
        });
    }

    // Initialize progressive form
    initializeProgressiveForm(form) {
        const steps = form.querySelectorAll('.form-step');
        const formId = form.getAttribute('data-form-id');
        
        // Hide all steps except first
        steps.forEach((step, index) => {
            if (index > 0) {
                step.style.display = 'none';
            }
            step.setAttribute('data-step', index + 1);
        });

        // Setup navigation between steps
        this.setupStepNavigation(form);
    }

    // Setup navigation between form steps
    setupStepNavigation(form) {
        const formId = form.getAttribute('data-form-id');
        const nextButtons = form.querySelectorAll('[data-next-step]');
        const prevButtons = form.querySelectorAll('[data-prev-step]');
        const progressBar = form.querySelector('.progress-bar');

        nextButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextStep(form);
            });
        });

        prevButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousStep(form);
            });
        });

        // Update progress bar
        if (progressBar) {
            this.updateProgressBar(form, 1);
        }
    }

    // Move to next form step
    nextStep(form) {
        const formId = form.getAttribute('data-form-id');
        const currentStep = this.currentStep.get(formId);
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const nextStep = currentStep + 1;
        const nextStepElement = form.querySelector(`[data-step="${nextStep}"]`);

        // Validate current step before proceeding
        if (!this.validateStep(currentStepElement)) {
            return;
        }

        // Save current step data
        this.saveStepData(form, currentStep);

        // Animate step transition
        this.animateStepTransition(currentStepElement, nextStepElement, 'next');

        this.currentStep.set(formId, nextStep);
        this.updateProgressBar(form, nextStep);
    }

    // Move to previous form step
    previousStep(form) {
        const formId = form.getAttribute('data-form-id');
        const currentStep = this.currentStep.get(formId);
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const prevStep = currentStep - 1;
        const prevStepElement = form.querySelector(`[data-step="${prevStep}"]`);

        if (prevStep < 1) return;

        this.animateStepTransition(currentStepElement, prevStepElement, 'prev');
        this.currentStep.set(formId, prevStep);
        this.updateProgressBar(form, prevStep);
    }

    // Validate all fields in a step
    validateStep(stepElement) {
        const fields = stepElement.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Save step data
    saveStepData(form, step) {
        const formId = form.getAttribute('data-form-id');
        const stepElement = form.querySelector(`[data-step="${step}"]`);
        const fields = stepElement.querySelectorAll('input, select, textarea');
        
        const stepData = {};
        fields.forEach(field => {
            if (field.name) {
                stepData[field.name] = field.value;
            }
        });

        this.formData.get(formId)[`step${step}`] = stepData;
    }

    // Animate step transition
    animateStepTransition(currentStep, nextStep, direction) {
        currentStep.style.transform = direction === 'next' ? 'translateX(-100%)' : 'translateX(100%)';
        currentStep.style.opacity = '0';
        currentStep.style.transition = 'all 0.4s ease';

        nextStep.style.display = 'block';
        nextStep.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)';
        nextStep.style.opacity = '0';

        requestAnimationFrame(() => {
            nextStep.style.transform = 'translateX(0)';
            nextStep.style.opacity = '1';
            nextStep.style.transition = 'all 0.4s ease';

            setTimeout(() => {
                currentStep.style.display = 'none';
                currentStep.style.transform = '';
                currentStep.style.opacity = '';
            }, 400);
        });
    }

    // Update progress bar
    updateProgressBar(form, currentStep) {
        const progressBar = form.querySelector('.progress-bar');
        if (!progressBar) return;

        const totalSteps = form.querySelectorAll('.form-step').length;
        const progress = (currentStep / totalSteps) * 100;

        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }

    // Setup form animations
    setupFormAnimations() {
        // Focus animations
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });

        // Form submission animations
        document.addEventListener('submit', (e) => {
            const form = e.target;
            this.animateFormSubmission(form);
        });
    }

    // Animate form submission
    animateFormSubmission(form) {
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span> Submitting...';
        submitButton.classList.add('submitting');

        // Animate form elements
        form.style.opacity = '0.7';
        form.style.transition = 'opacity 0.3s ease';
    }

    // Setup auto-save functionality
    setupAutoSave() {
        const autoSaveForms = document.querySelectorAll('[data-auto-save]');
        
        autoSaveForms.forEach(form => {
            const fields = form.querySelectorAll('input, select, textarea');
            
            fields.forEach(field => {
                field.addEventListener('input', this.debounce(() => {
                    this.autoSaveForm(form);
                }, 1000));
            });
        });
    }

    // Auto-save form data
    autoSaveForm(form) {
        const formId = form.getAttribute('data-form-id');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Save to localStorage
        localStorage.setItem(`form-auto-save-${formId}`, JSON.stringify(data));
        
        // Show auto-save indicator
        this.showAutoSaveIndicator(form);
    }

    // Show auto-save indicator
    showAutoSaveIndicator(form) {
        let indicator = form.querySelector('.auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'auto-save-indicator';
            form.appendChild(indicator);
        }

        indicator.textContent = 'Auto-saved';
        indicator.classList.add('visible');

        setTimeout(() => {
            indicator.classList.remove('visible');
        }, 2000);
    }

    // Setup file upload functionality
    setupFileUploads() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleFileUpload(e.target);
            });
        });
    }

    // Handle file upload
    handleFileUpload(input) {
        const files = Array.from(input.files);
        const previewContainer = input.parentNode.querySelector('.file-preview');
        
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        
        files.forEach(file => {
            const preview = document.createElement('div');
            preview.className = 'file-preview-item';
            preview.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <button type="button" class="remove-file">×</button>
            `;
            
            preview.querySelector('.remove-file').addEventListener('click', () => {
                preview.remove();
                input.value = '';
            });
            
            previewContainer.appendChild(preview);
        });
    }

    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Setup form events
    setupFormEvents() {
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    // Handle form submission
    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (this.isSubmitting) return;

        // Validate entire form
        if (!this.validateForm(form)) {
            return;
        }

        try {
            await this.submitForm(form);
        } catch (error) {
            this.handleFormError(form, error);
        }
    }

    // Validate entire form
    validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Submit form data
    async submitForm(form) {
        const formData = new FormData(form);
        const formId = form.getAttribute('data-form-id');
        
        // Show loading state
        this.showFormLoading(form);

        // Simulate API call (replace with actual endpoint)
        const response = await this.mockApiCall(formData);
        
        if (response.success) {
            this.handleFormSuccess(form, response);
        } else {
            throw new Error(response.message || 'Submission failed');
        }
    }

    // Mock API call (replace with actual implementation)
    async mockApiCall(formData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Form submitted successfully',
                    data: Object.fromEntries(formData)
                });
            }, 2000);
        });
    }

    // Handle form success
    handleFormSuccess(form, response) {
        this.showSuccessMessage(form, response.message);
        form.reset();
        this.clearFormData(form);
        this.hideFormLoading(form);
        this.isSubmitting = false;

        // Trigger success event
        const event = new CustomEvent('formSuccess', {
            detail: { form, response }
        });
        document.dispatchEvent(event);
    }

    // Handle form error
    handleFormError(form, error) {
        this.showErrorMessage(form, error.message);
        this.hideFormLoading(form);
        this.isSubmitting = false;
    }

    // Show form loading state
    showFormLoading(form) {
        form.classList.add('loading');
    }

    // Hide form loading state
    hideFormLoading(form) {
        form.classList.remove('loading');
    }

    // Show success message
    showSuccessMessage(form, message) {
        this.showMessage(form, message, 'success');
    }

    // Show error message
    showErrorMessage(form, message) {
        this.showMessage(form, message, 'error');
    }

    // Show message
    showMessage(form, message, type) {
        let messageElement = form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            form.appendChild(messageElement);
        }

        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

    // Clear form data
    clearFormData(form) {
        const formId = form.getAttribute('data-form-id');
        this.formData.delete(formId);
        localStorage.removeItem(`form-auto-save-${formId}`);
    }

    // Setup ARIA attributes for accessibility
    setupAriaAttributes(field) {
        if (!field.id) {
            field.id = `field-${field.name}-${Math.random().toString(36).substr(2, 9)}`;
        }

        const label = document.querySelector(`label[for="${field.name}"]`);
        if (label) {
            field.setAttribute('aria-labelledby', label.id);
        }

        field.setAttribute('aria-describedby', `${field.id}-description`);
    }

    // Utility: Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API methods
    validateFieldByName(formId, fieldName) {
        const form = this.forms.get(formId);
        const field = form.querySelector(`[name="${fieldName}"]`);
        return this.validateField(field);
    }

    getFormData(formId) {
        return this.formData.get(formId);
    }

    setFormData(formId, data) {
        this.formData.set(formId, data);
    }

    resetForm(formId) {
        const form = this.forms.get(formId);
        form.reset();
        this.formData.delete(formId);
        this.currentStep.set(formId, 1);
    }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const formHandler = new FormHandler();
    formHandler.init();
    
    // Make form handler available globally
    window.formHandler = formHandler;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}