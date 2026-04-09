// utils.js - Utility functions and helper methods for Table Tennis Statistics Dashboard

// Utility functions namespace
const Utils = {
    // DOM manipulation utilities
    dom: {
        // Create element with attributes and content
        createElement(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            
            // Set attributes
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'htmlFor') {
                    element.htmlFor = attributes[key];
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });
            
            // Set content
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof Node) {
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(child => {
                    if (child instanceof Node) {
                        element.appendChild(child);
                    }
                });
            }
            
            return element;
        },
        
        // Get element by selector with optional parent
        get(selector, parent = document) {
            return parent.querySelector(selector);
        },
        
        // Get all elements by selector with optional parent
        getAll(selector, parent = document) {
            return Array.from(parent.querySelectorAll(selector));
        },
        
        // Add event listener with delegation support
        on(event, selector, handler, options = {}) {
            if (typeof selector === 'function') {
                // Direct event binding
                document.addEventListener(event, selector, options);
            } else {
                // Event delegation
                document.addEventListener(event, (e) => {
                    if (e.target.matches(selector) || e.target.closest(selector)) {
                        handler(e);
                    }
                }, options);
            }
        },
        
        // Remove event listener
        off(event, handler, options = {}) {
            document.removeEventListener(event, handler, options);
        },
        
        // Toggle class on element
        toggleClass(element, className, force) {
            if (Array.isArray(element)) {
                element.forEach(el => el.classList.toggle(className, force));
            } else {
                element.classList.toggle(className, force);
            }
        },
        
        // Show element with animation
        show(element, duration = 300) {
            if (Array.isArray(element)) {
                element.forEach(el => this.showElement(el, duration));
            } else {
                this.showElement(element, duration);
            }
        },
        
        // Hide element with animation
        hide(element, duration = 300) {
            if (Array.isArray(element)) {
                element.forEach(el => this.hideElement(el, duration));
            } else {
                this.hideElement(element, duration);
            }
        },
        
        // Show single element with animation
        showElement(element, duration = 300) {
            if (!element) return;
            
            element.style.display = 'block';
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
            
            setTimeout(() => {
                element.style.transition = '';
            }, duration);
        },
        
        // Hide single element with animation
        hideElement(element, duration = 300) {
            if (!element) return;
            
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.transition = '';
            }, duration);
        },
        
        // Fade in element
        fadeIn(element, duration = 300, callback) {
            if (!element) return;
            
            element.style.display = 'block';
            element.style.opacity = '0';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.min(progress / duration, 1);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.opacity = '1';
                    if (callback) callback();
                }
            };
            
            requestAnimationFrame(animate);
        },
        
        // Fade out element
        fadeOut(element, duration = 300, callback) {
            if (!element) return;
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.max(1 - progress / duration, 0);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    element.style.opacity = '0';
                    if (callback) callback();
                }
            };
            
            requestAnimationFrame(animate);
        },
        
        // Slide down element
        slideDown(element, duration = 300, callback) {
            if (!element) return;
            
            element.style.display = 'block';
            const height = element.scrollHeight;
            element.style.height = '0px';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.height = `${height}px`;
            });
            
            setTimeout(() => {
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
                if (callback) callback();
            }, duration);
        },
        
        // Slide up element
        slideUp(element, duration = 300, callback) {
            if (!element) return;
            
            const height = element.scrollHeight;
            element.style.height = `${height}px`;
            element.style.overflow = 'hidden';
            element.style.transition = `height ${duration}ms ease-in-out`;
            
            requestAnimationFrame(() => {
                element.style.height = '0px';
            });
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
                if (callback) callback();
            }, duration);
        },
        
        // Toggle slide animation
        slideToggle(element, duration = 300) {
            if (!element) return;
            
            if (element.style.display === 'none') {
                this.slideDown(element, duration);
            } else {
                this.slideUp(element, duration);
            }
        },
        
        // Animate number counting
        animateNumber(element, start, end, duration = 1000, format = null) {
            if (!element) return;
            
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const value = Math.floor(progress * (end - start) + start);
                
                if (format) {
                    element.textContent = format(value);
                } else {
                    element.textContent = value.toLocaleString();
                }
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            };
            
            requestAnimationFrame(step);
        },
        
        // Debounce function execution
        debounce(func, wait, immediate = false) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },
        
        // Throttle function execution
        throttle(func, limit) {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
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
        
        // Scroll to element smoothly
        scrollToElement(element, offset = 0, duration = 500) {
            if (!element) return;
            
            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset + offset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;
            
            const animation = (currentTime) => {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
                
                window.scrollTo(0, startPosition + distance * ease);
                
                if (timeElapsed < duration) {
                    requestAnimationFrame(animation);
                }
            };
            
            requestAnimationFrame(animation);
        },
        
        // Load script dynamically
        loadScript(src, attributes = {}) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                
                Object.keys(attributes).forEach(key => {
                    script.setAttribute(key, attributes[key]);
                });
                
                script.onload = resolve;
                script.onerror = reject;
                
                document.head.appendChild(script);
            });
        },
        
        // Load CSS dynamically
        loadCSS(href, attributes = {}) {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                
                Object.keys(attributes).forEach(key => {
                    link.setAttribute(key, attributes[key]);
                });
                
                link.onload = resolve;
                link.onerror = reject;
                
                document.head.appendChild(link);
            });
        }
    },
    
    // Data manipulation utilities
    data: {
        // Deep clone object or array
        clone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.clone(item));
            
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.clone(obj[key]);
            });
            return cloned;
        },
        
        // Merge objects deeply
        merge(target, ...sources) {
            if (!sources.length) return target;
            const source = sources.shift();
            
            if (this.isObject(target) && this.isObject(source)) {
                Object.keys(source).forEach(key => {
                    if (this.isObject(source[key])) {
                        if (!target[key]) Object.assign(target, { [key]: {} });
                        this.merge(target[key], source[key]);
                    } else {
                        Object.assign(target, { [key]: source[key] });
                    }
                });
            }
            
            return this.merge(target, ...sources);
        },
        
        // Check if value is an object
        isObject(item) {
            return item && typeof item === 'object' && !Array.isArray(item);
        },
        
        // Filter object by keys
        pick(obj, keys) {
            return keys.reduce((result, key) => {
                if (obj.hasOwnProperty(key)) {
                    result[key] = obj[key];
                }
                return result;
            }, {});
        },
        
        // Omit keys from object
        omit(obj, keys) {
            const result = { ...obj };
            keys.forEach(key => delete result[key]);
            return result;
        },
        
        // Group array by key
        groupBy(array, key) {
            return array.reduce((groups, item) => {
                const group = item[key];
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
            }, {});
        },
        
        // Sort array by key
        sortBy(array, key, order = 'asc') {
            return array.sort((a, b) => {
                let aVal = a[key];
                let bVal = b[key];
                
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
                
                if (aVal < bVal) return order === 'asc' ? -1 : 1;
                if (aVal > bVal) return order === 'asc' ? 1 : -1;
                return 0;
            });
        },
        
        // Remove duplicates from array
        unique(array, key = null) {
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
        
        // Flatten nested array
        flatten(array) {
            return array.reduce((flat, item) => {
                return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
            }, []);
        },
        
        // Chunk array into smaller arrays
        chunk(array, size) {
            const chunks = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        },
        
        // Calculate average of array values
        average(array) {
            if (array.length === 0) return 0;
            return array.reduce((sum, val) => sum + val, 0) / array.length;
        },
        
        // Calculate median of array values
        median(array) {
            if (array.length === 0) return 0;
            
            const sorted = [...array].sort((a, b) => a - b);
            const middle = Math.floor(sorted.length / 2);
            
            if (sorted.length % 2 === 0) {
                return (sorted[middle - 1] + sorted[middle]) / 2;
            }
            
            return sorted[middle];
        },
        
        // Calculate standard deviation
        standardDeviation(array) {
            if (array.length === 0) return 0;
            
            const avg = this.average(array);
            const squareDiffs = array.map(value => Math.pow(value - avg, 2));
            const avgSquareDiff = this.average(squareDiffs);
            return Math.sqrt(avgSquareDiff);
        },
        
        // Format number with commas
        formatNumber(num, decimals = 0) {
            return num.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        },
        
        // Format percentage
        formatPercent(num, decimals = 1) {
            return `${(num * 100).toFixed(decimals)}%`;
        },
        
        // Format file size
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        // Format date
        formatDate(date, format = 'medium') {
            const d = new Date(date);
            const options = {
                short: { year: 'numeric', month: 'short', day: 'numeric' },
                medium: { year: 'numeric', month: 'long', day: 'numeric' },
                long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                time: { hour: '2-digit', minute: '2-digit' }
            };
            
            return d.toLocaleDateString(undefined, options[format] || options.medium);
        },
        
        // Generate unique ID
        generateId(prefix = '') {
            return prefix + Math.random().toString(36).substr(2, 9);
        },
        
        // Validate email address
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        // Validate URL
        isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        
        // Validate phone number
        isValidPhone(phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
        },
        
        // Sanitize HTML
        sanitizeHtml(html) {
            const temp = document.createElement('div');
            temp.textContent = html;
            return temp.innerHTML;
        },
        
        // Parse CSV string
        parseCSV(csvText, delimiter = ',') {
            const lines = csvText.split('\n').filter(line => line.trim());
            if (lines.length === 0) return [];
            
            const headers = lines[0].split(delimiter).map(h => h.trim());
            const data = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(delimiter).map(v => v.trim());
                if (values.length !== headers.length) continue;
                
                const record = {};
                headers.forEach((header, index) => {
                    record[header] = values[index];
                });
                data.push(record);
            }
            
            return data;
        },
        
        // Convert array to CSV
        toCSV(data, headers = null) {
            if (data.length === 0) return '';
            
            const actualHeaders = headers || Object.keys(data[0]);
            const csvRows = [
                actualHeaders.join(','),
                ...data.map(row => actualHeaders.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
                }).join(','))
            ];
            
            return csvRows.join('\n');
        }
    },
    
    // Storage utilities
    storage: {
        // Set item with expiration
        set(key, value, expirationMinutes = null) {
            const item = {
                value: value,
                timestamp: Date.now(),
                expiration: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
            };
            
            localStorage.setItem(key, JSON.stringify(item));
        },
        
        // Get item with expiration check
        get(key, defaultValue = null) {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return defaultValue;
            
            try {
                const item = JSON.parse(itemStr);
                
                // Check expiration
                if (item.expiration && Date.now() > item.expiration) {
                    localStorage.removeItem(key);
                    return defaultValue;
                }
                
                return item.value;
            } catch {
                return defaultValue;
            }
        },
        
        // Remove item
        remove(key) {
            localStorage.removeItem(key);
        },
        
        // Clear all items
        clear() {
            localStorage.clear();
        },
        
        // Get all keys
        keys() {
            return Object.keys(localStorage);
        },
        
        // Check if key exists
        has(key) {
            return localStorage.getItem(key) !== null;
        },
        
        // Get storage usage information
        getUsage() {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length;
                }
            }
            return total;
        }
    },
    
    // Date and time utilities
    date: {
        // Get current timestamp
        now() {
            return Date.now();
        },
        
        // Format date relative to now
        timeAgo(date) {
            const now = new Date();
            const diffMs = now - new Date(date);
            const diffSecs = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffSecs / 60);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffSecs < 60) return 'just now';
            if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            
            return this.formatDate(date);
        },
        
        // Add days to date
        addDays(date, days) {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },
        
        // Add months to date
        addMonths(date, months) {
            const result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result;
        },
        
        // Add years to date
        addYears(date, years) {
            const result = new Date(date);
            result.setFullYear(result.getFullYear() + years);
            return result;
        },
        
        // Get difference between two dates in days
        diffInDays(date1, date2) {
            const timeDiff = Math.abs(new Date(date2) - new Date(date1));
            return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        },
        
        // Check if date is today
        isToday(date) {
            const today = new Date();
            const checkDate = new Date(date);
            return today.toDateString() === checkDate.toDateString();
        },
        
        // Check if date is in the past
        isPast(date) {
            return new Date(date) < new Date();
        },
        
        // Check if date is in the future
        isFuture(date) {
            return new Date(date) > new Date();
        },
        
        // Get start of day
        startOfDay(date) {
            const result = new Date(date);
            result.setHours(0, 0, 0, 0);
            return result;
        },
        
        // Get end of day
        endOfDay(date) {
            const result = new Date(date);
            result.setHours(23, 59, 59, 999);
            return result;
        },
        
        // Get week number
        getWeekNumber(date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
            return weekNo;
        }
    },
    
    // Math utilities
    math: {
        // Clamp number between min and max
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        
        // Linear interpolation
        lerp(start, end, factor) {
            return start + (end - start) * factor;
        },
        
        // Map value from one range to another
        map(value, inMin, inMax, outMin, outMax) {
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        },
        
        // Random number between min and max
        random(min, max) {
            return Math.random() * (max - min) + min;
        },
        
        // Random integer between min and max
        randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        
        // Round to specified decimal places
        round(value, decimals = 0) {
            const factor = Math.pow(10, decimals);
            return Math.round(value * factor) / factor;
        },
        
        // Calculate percentage
        percentage(part, total) {
            return total === 0 ? 0 : (part / total) * 100;
        },
        
        // Calculate percentage change
        percentageChange(oldValue, newValue) {
            return oldValue === 0 ? 0 : ((newValue - oldValue) / oldValue) * 100;
        },
        
        // Calculate compound annual growth rate
        cagr(startValue, endValue, years) {
            return Math.pow(endValue / startValue, 1 / years) - 1;
        }
    },
    
    // String utilities
    string: {
        // Capitalize first letter
        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        
        // Convert to camel case
        camelCase(str) {
            return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
        },
        
        // Convert to kebab case
        kebabCase(str) {
            return str.replace(/([a-z])([A-Z])/g, '$1-$2')
                     .replace(/[\s_]+/g, '-')
                     .toLowerCase();
        },
        
        // Convert to snake case
        snakeCase(str) {
            return str.replace(/([a-z])([A-Z])/g, '$1_$2')
                     .replace(/[\s-]+/g, '_')
                     .toLowerCase();
        },
        
        // Truncate string with ellipsis
        truncate(str, length, ellipsis = '...') {
            if (str.length <= length) return str;
            return str.substr(0, length - ellipsis.length) + ellipsis;
        },
        
        // Strip HTML tags
        stripTags(str) {
            return str.replace(/<[^>]*>/g, '');
        },
        
        // Escape HTML
        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        
        // Unescape HTML
        unescapeHtml(str) {
            const div = document.createElement('div');
            div.innerHTML = str;
            return div.textContent;
        },
        
        // Generate random string
        randomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },
        
        // Pad string with characters
        pad(str, length, char = ' ', direction = 'left') {
            const padding = char.repeat(Math.max(0, length - str.length));
            return direction === 'left' ? padding + str : str + padding;
        },
        
        // Check if string contains substring
        contains(str, substring, caseSensitive = true) {
            if (!caseSensitive) {
                str = str.toLowerCase();
                substring = substring.toLowerCase();
            }
            return str.includes(substring);
        }
    },
    
    // Validation utilities
    validation: {
        // Check if value is empty
        isEmpty(value) {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string') return value.trim() === '';
            if (Array.isArray(value)) return value.length === 0;
            if (typeof value === 'object') return Object.keys(value).length === 0;
            return false;
        },
        
        // Check if value is a number
        isNumber(value) {
            return typeof value === 'number' && !isNaN(value);
        },
        
        // Check if value is an integer
        isInteger(value) {
            return Number.isInteger(value);
        },
        
        // Check if value is a float
        isFloat(value) {
            return typeof value === 'number' && !isNaN(value) && !Number.isInteger(value);
        },
        
        // Check if value is within range
        isInRange(value, min, max) {
            return value >= min && value <= max;
        },
        
        // Validate required fields
        validateRequired(fields, data) {
            const errors = {};
            fields.forEach(field => {
                if (this.isEmpty(data[field])) {
                    errors[field] = `${field} is required`;
                }
            });
            return errors;
        },
        
        // Validate email format
        validateEmail(email) {
            if (!this.isEmpty(email) && !Utils.data.isValidEmail(email)) {
                return 'Please enter a valid email address';
            }
            return null;
        },
        
        // Validate phone format
        validatePhone(phone) {
            if (!this.isEmpty(phone) && !Utils.data.isValidPhone(phone)) {
                return 'Please enter a valid phone number';
            }
            return null;
        },
        
        // Validate URL format
        validateUrl(url) {
            if (!this.isEmpty(url) && !Utils.data.isValidUrl(url)) {
                return 'Please enter a valid URL';
            }
            return null;
        },
        
        // Validate minimum length
        validateMinLength(value, minLength) {
            if (!this.isEmpty(value) && value.length < minLength) {
                return `Must be at least ${minLength} characters`;
            }
            return null;
        },
        
        // Validate maximum length
        validateMaxLength(value, maxLength) {
            if (!this.isEmpty(value) && value.length > maxLength) {
                return `Must be no more than ${maxLength} characters`;
            }
            return null;
        }
    },
    
    // Network utilities
    network: {
        // Simple fetch wrapper with timeout
        async fetch(url, options = {}, timeout = 10000) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return await response.json();
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        },
        
        // Check if online
        isOnline() {
            return navigator.onLine;
        },
        
        // Get network type
        getNetworkType() {
            return navigator.connection ? navigator.connection.effectiveType : 'unknown';
        },
        
        // Get network speed
        getNetworkSpeed() {
            return navigator.connection ? navigator.connection.downlink : null;
        }
    },
    
    // Performance utilities
    performance: {
        // Measure function execution time
        measure(fn, ...args) {
            const start = performance.now();
            const result = fn(...args);
            const end = performance.now();
            
            return {
                result,
                duration: end - start
            };
        },
        
        // Debounce with leading and trailing options
        advancedDebounce(func, wait, options = {}) {
            let timeout;
            let lastArgs;
            let lastThis;
            let result;
            
            const later = () => {
                timeout = null;
                if (options.trailing && lastArgs) {
                    result = func.apply(lastThis, lastArgs);
                }
            };
            
            return function debounced(...args) {
                const callNow = options.leading && !timeout;
                
                clearTimeout(timeout);
                lastArgs = args;
                lastThis = this;
                
                timeout = setTimeout(later, wait);
                
                if (callNow) {
                    result = func.apply(lastThis, lastArgs);
                }
                
                return result;
            };
        },
        
        // Throttle with leading and trailing options
        advancedThrottle(func, limit, options = {}) {
            let timeout;
            let lastArgs;
            let lastThis;
            let result;
            let lastCallTime = 0;
            
            const later = () => {
                lastCallTime = options.leading === false ? 0 : Date.now();
                timeout = null;
                if (options.trailing && lastArgs) {
                    result = func.apply(lastThis, lastArgs);
                }
            };
            
            return function throttled(...args) {
                const now = Date.now();
                
                if (!lastCallTime && options.leading === false) {
                    lastCallTime = now;
                }
                
                const remaining = limit - (now - lastCallTime);
                
                lastArgs = args;
                lastThis = this;
                
                if (remaining <= 0 || remaining > limit) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    lastCallTime = now;
                    result = func.apply(lastThis, lastArgs);
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                
                return result;
            };
        }
    },
    
    // Table tennis specific utilities
    tableTennis: {
        // Calculate serve type distribution
        calculateServeDistribution(data) {
            const serveTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
            return serveTypes.map(type => {
                const count = data.filter(record => record.serveType === type).length;
                const percentage = data.length > 0 ? (count / data.length) * 100 : 0;
                return {
                    type,
                    count,
                    percentage: Math.round(percentage)
                };
            });
        },
        
        // Calculate stroke type distribution
        calculateStrokeDistribution(data) {
            const strokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
            return strokeTypes.map(type => {
                const count = data.filter(record => record.strokeType === type).length;
                const percentage = data.length > 0 ? (count / data.length) * 100 : 0;
                return {
                    type,
                    count,
                    percentage: Math.round(percentage)
                };
            });
        },
        
        // Calculate focus distribution
        calculateFocusDistribution(data) {
            const focusTypes = ['Right', 'Left'];
            return focusTypes.map(type => {
                const count = data.filter(record => record.focus === type).length;
                const percentage = data.length > 0 ? (count / data.length) * 100 : 0;
                return {
                    type,
                    count,
                    percentage: Math.round(percentage)
                };
            });
        },
        
        // Calculate average success rate
        calculateAverageSuccessRate(data) {
            if (data.length === 0) return 0;
            const total = data.reduce((sum, record) => sum + record.successRate, 0);
            return Math.round(total / data.length);
        },
        
        // Calculate total points
        calculateTotalPoints(data) {
            return data.reduce((sum, record) => sum + record.points, 0);
        },
        
        // Get most common serve type
        getMostCommonServe(data) {
            const distribution = this.calculateServeDistribution(data);
            return distribution.reduce((max, item) => 
                item.count > max.count ? item : max, { count: 0, type: 'None' }
            );
        },
        
        // Get most common stroke type
        getMostCommonStroke(data) {
            const distribution = this.calculateStrokeDistribution(data);
            return distribution.reduce((max, item) => 
                item.count > max.count ? item : max, { count: 0, type: 'None' }
            );
        },
        
        // Calculate performance trend
        calculatePerformanceTrend(data, period = 'weekly') {
            const groupedData = Utils.data.groupBy(data, 'date');
            const dates = Object.keys(groupedData).sort();
            
            if (dates.length < 2) return 'insufficient data';
            
            const firstDate = dates[0];
            const lastDate = dates[dates.length - 1];
            
            const firstAvg = this.calculateAverageSuccessRate(groupedData[firstDate]);
            const lastAvg = this.calculateAverageSuccessRate(groupedData[lastDate]);
            
            const difference = lastAvg - firstAvg;
            
            if (difference > 5) return 'strongly improving';
            if (difference > 2) return 'improving';
            if (difference > -2) return 'stable';
            if (difference > -5) return 'declining';
            return 'strongly declining';
        },
        
        // Validate table tennis record
        validateRecord(record) {
            const errors = [];
            
            if (!record.date) errors.push('Date is required');
            if (!record.serveType) errors.push('Serve type is required');
            if (!record.strokeType) errors.push('Stroke type is required');
            if (!record.focus) errors.push('Focus is required');
            if (record.successRate === undefined || record.successRate === null) errors.push('Success rate is required');
            if (record.points === undefined || record.points === null) errors.push('Points are required');
            
            if (record.successRate < 0 || record.successRate > 100) {
                errors.push('Success rate must be between 0 and 100');
            }
            
            if (record.points < 0) {
                errors.push('Points must be a positive number');
            }
            
            const validServeTypes = ['Pendulum', 'Chop', 'Tomahawk', 'Forehand'];
            if (!validServeTypes.includes(record.serveType)) {
                errors.push(`Serve type must be one of: ${validServeTypes.join(', ')}`);
            }
            
            const validStrokeTypes = ['Backhand loop', 'Forehand loop', 'Backhand Serve', 'Forehand Serve'];
            if (!validStrokeTypes.includes(record.strokeType)) {
                errors.push(`Stroke type must be one of: ${validStrokeTypes.join(', ')}`);
            }
            
            if (!['Right', 'Left'].includes(record.focus)) {
                errors.push('Focus must be "Right" or "Left"');
            }
            
            return errors;
        }
    },
    
    // Export utilities
    export: {
        // Export data as JSON file
        exportJSON(data, filename = 'data.json') {
            const dataStr = JSON.stringify(data, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            this.downloadFile(dataUri, filename);
        },
        
        // Export data as CSV file
        exportCSV(data, filename = 'data.csv') {
            const csvStr = Utils.data.toCSV(data);
            const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvStr);
            
            this.downloadFile(dataUri, filename);
        },
        
        // Download file from data URI
        downloadFile(dataUri, filename) {
            const link = document.createElement('a');
            link.setAttribute('href', dataUri);
            link.setAttribute('download', filename);
            link.click();
        },
        
        // Print element content
        printElement(element) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            @media print { body { margin: 0; } }
                        </style>
                    </head>
                    <body>
                        ${element.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    },
    
    // Initialize utility functions when DOM is ready
    init() {
        console.log('Utils module initialized');
        
        // Add global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });
        
        // Add unhandled rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }
};

// Initialize utils when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Utils.init();
});

// Make utils available globally
window.Utils = Utils;