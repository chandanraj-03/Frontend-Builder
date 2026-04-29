/**
 * helpers.js - Utility functions and helper methods for application-wide use
 * Provides reusable functionality for DOM manipulation, animations, and common operations
 */

// DOM manipulation utilities
const DOMHelpers = {
    // Create element with attributes and children
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'html') {
                element.innerHTML = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Append children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    // Toggle element visibility with animation
    toggleVisibility(element, show, duration = 300) {
        if (!element) return;
        
        if (show) {
            element.style.display = '';
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
            
            setTimeout(() => {
                element.style.transition = '';
            }, duration);
        } else {
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '0';
            });
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.transition = '';
            }, duration);
        }
    },
    
    // Smooth scroll to element
    smoothScrollTo(element, offset = 0) {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },
    
    // Debounce function for performance
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
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
    
    // Get computed style with fallback
    getComputedStyle(element, property, fallback = '') {
        if (!element) return fallback;
        return window.getComputedStyle(element).getPropertyValue(property) || fallback;
    },
    
    // Check if element is in viewport
    isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Add event listener with cleanup
    addEventListenerWithCleanup(element, event, handler) {
        element.addEventListener(event, handler);
        return () => element.removeEventListener(event, handler);
    }
};

// Animation utilities
const AnimationHelpers = {
    // Fade in element
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = '';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
        
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
    },
    
    // Fade out element
    fadeOut(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '1';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '0';
        });
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.transition = '';
        }, duration);
    },
    
    // Slide down element
    slideDown(element, duration = 300) {
        if (!element) return;
        
        element.style.display = '';
        const height = element.offsetHeight;
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.height = `${height}px`;
        });
        
        setTimeout(() => {
            element.style.height = '';
            element.style.overflow = '';
            element.style.transition = '';
        }, duration);
    },
    
    // Slide up element
    slideUp(element, duration = 300) {
        if (!element) return;
        
        const height = element.offsetHeight;
        element.style.height = `${height}px`;
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.height = '0px';
        });
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            element.style.transition = '';
        }, duration);
    },
    
    // Bounce animation
    bounce(element, intensity = 10, duration = 600) {
        if (!element) return;
        
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `translateY(${intensity}px)`;
        
        setTimeout(() => {
            element.style.transform = 'translateY(0px)';
        }, duration / 2);
        
        setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
        }, duration);
    },
    
    // Pulse animation
    pulse(element, scale = 1.1, duration = 600) {
        if (!element) return;
        
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `scale(${scale})`;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, duration / 2);
        
        setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
        }, duration);
    },
    
    // Shake animation
    shake(element, intensity = 10, duration = 600) {
        if (!element) return;
        
        const keyframes = [
            { transform: 'translateX(0)' },
            { transform: `translateX(-${intensity}px)` },
            { transform: `translateX(${intensity}px)` },
            { transform: `translateX(-${intensity}px)` },
            { transform: `translateX(${intensity}px)` },
            { transform: 'translateX(0)' }
        ];
        
        element.animate(keyframes, {
            duration: duration,
            easing: 'ease-in-out'
        });
    }
};

// String and text utilities
const StringHelpers = {
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Truncate text with ellipsis
    truncate(text, maxLength, ellipsis = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - ellipsis.length) + ellipsis;
    },
    
    // Capitalize first letter
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },
    
    // Convert to camelCase
    toCamelCase(text) {
        return text.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    },
    
    // Convert to kebab-case
    toKebabCase(text) {
        return text.replace(/([a-z])([A-Z])/g, '$1-$2')
                  .replace(/[\s_]+/g, '-')
                  .toLowerCase();
    },
    
    // Generate random string
    randomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Format number with commas
    formatNumber(number) {
        return new Intl.NumberFormat().format(number);
    },
    
    // Format date
    formatDate(date, format = 'medium') {
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            medium: { year: 'numeric', month: 'long', day: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        };
        
        return new Intl.DateTimeFormat('en-US', options[format] || options.medium).format(new Date(date));
    }
};

// Array and object utilities
const CollectionHelpers = {
    // Deep clone object or array
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },
    
    // Merge objects deeply
    deepMerge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
        
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return this.deepMerge(target, ...sources);
    },
    
    // Check if value is an object
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },
    
    // Remove duplicates from array
    removeDuplicates(array, key) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        }
        return [...new Set(array)];
    },
    
    // Group array by key
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = item[key];
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(item);
            return groups;
        }, {});
    },
    
    // Sort array by key
    sortBy(array, key, direction = 'asc') {
        return array.slice().sort((a, b) => {
            const aValue = a[key];
            const bValue = b[key];
            const modifier = direction === 'desc' ? -1 : 1;
            
            if (aValue < bValue) return -1 * modifier;
            if (aValue > bValue) return 1 * modifier;
            return 0;
        });
    },
    
    // Find object in array by key value
    findByKey(array, key, value) {
        return array.find(item => item[key] === value);
    },
    
    // Filter array by multiple criteria
    filterBy(array, criteria) {
        return array.filter(item => {
            return Object.entries(criteria).every(([key, value]) => {
                return item[key] === value;
            });
        });
    }
};

// Storage utilities
const StorageHelpers = {
    // Safe localStorage get
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    // Safe localStorage set
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    // Safe localStorage remove
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    // Clear all app-related storage
    clearAppStorage() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('todo'));
        keys.forEach(key => this.removeItem(key));
        return keys.length;
    },
    
    // Check storage quota
    getStorageUsage() {
        let total = 0;
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
};

// Event utilities
const EventHelpers = {
    // Trigger custom event
    triggerEvent(element, eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            detail: detail
        });
        element.dispatchEvent(event);
    },
    
    // Prevent default and stop propagation
    stopEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    },
    
    // Add one-time event listener
    once(element, event, handler) {
        const onceHandler = (e) => {
            handler(e);
            element.removeEventListener(event, onceHandler);
        };
        element.addEventListener(event, onceHandler);
    }
};

// Form utilities
const FormHelpers = {
    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate required fields
    validateRequired(fields) {
        return fields.every(field => {
            const value = field.value ? field.value.trim() : '';
            return value.length > 0;
        });
    },
    
    // Get form data as object
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    },
    
    // Reset form with animation
    resetForm(form) {
        form.reset();
        AnimationHelpers.shake(form);
    },
    
    // Show form validation errors
    showValidationErrors(errors) {
        Object.entries(errors).forEach(([fieldName, message]) => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.showFieldError(field, message);
            }
        });
    },
    
    // Show field-specific error
    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);
        
        // Add error class
        field.classList.add('error');
        
        // Create error message
        const errorElement = DOMHelpers.createElement('div', {
            className: 'error-message',
            textContent: message
        });
        
        // Insert after field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // Animate error
        AnimationHelpers.shake(field);
    },
    
    // Clear field error
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
};

// Export all helpers for global use
window.Helpers = {
    DOM: DOMHelpers,
    Animation: AnimationHelpers,
    String: StringHelpers,
    Collection: CollectionHelpers,
    Storage: StorageHelpers,
    Event: EventHelpers,
    Form: FormHelpers
};