// a-b-testing.js - A/B testing and experimentation system for optimizing user experience
// Handles test allocation, variant management, tracking, and analytics for A/B testing

class ABTesting {
    constructor() {
        this.tests = new Map();
        this.activeTests = new Set();
        this.userVariants = new Map();
        this.analytics = {
            impressions: new Map(),
            conversions: new Map(),
            clicks: new Map(),
            events: new Map()
        };
        this.currentUser = this.getOrCreateUserId();
        this.isInitialized = false;
        this.storageKey = 'ab_testing_data';
        this.cookieExpiryDays = 30;
    }

    // Initialize A/B testing system
    init() {
        if (this.isInitialized) return;
        
        this.loadFromStorage();
        this.setupTests();
        this.setupEventTracking();
        this.setupAnalytics();
        this.setupMutationObserver();
        this.setupPerformanceTracking();
        
        this.isInitialized = true;
        console.log('A/B testing system initialized');
    }

    // Get or create unique user ID
    getOrCreateUserId() {
        let userId = localStorage.getItem('ab_user_id');
        
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('ab_user_id', userId);
        }
        
        return userId;
    }

    // Load test data from storage
    loadFromStorage() {
        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.tests = new Map(data.tests || []);
                this.userVariants = new Map(data.userVariants || []);
                this.analytics = data.analytics || this.analytics;
            } catch (error) {
                console.warn('Failed to load A/B testing data from storage:', error);
            }
        }
    }

    // Save test data to storage
    saveToStorage() {
        const data = {
            tests: Array.from(this.tests.entries()),
            userVariants: Array.from(this.userVariants.entries()),
            analytics: this.analytics
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Setup defined tests
    setupTests() {
        // Define A/B tests
        this.defineTests();
        
        // Allocate variants for current user
        this.allocateVariants();
        
        // Apply variants to the page
        this.applyVariants();
    }

    // Define available A/B tests
    defineTests() {
        // Test 1: Hero CTA Button Text
        this.registerTest('hero_cta_text', {
            name: 'Hero CTA Button Text',
            description: 'Test different CTA button texts in hero section',
            variants: [
                { id: 'A', name: 'Control', weight: 0.5, config: { text: 'Get Started Free' } },
                { id: 'B', name: 'Variant B', weight: 0.25, config: { text: 'Start Free Trial' } },
                { id: 'C', name: 'Variant C', weight: 0.25, config: { text: 'Try It Free' } }
            ],
            targetSelector: '.hero-cta',
            type: 'text',
            startDate: new Date(),
            endDate: null,
            isActive: true,
            sampleSize: 1000,
            confidenceLevel: 0.95
        });

        // Test 2: Pricing Table Layout
        this.registerTest('pricing_layout', {
            name: 'Pricing Table Layout',
            description: 'Test different pricing table layouts',
            variants: [
                { id: 'A', name: 'Control', weight: 0.5, config: { layout: 'horizontal' } },
                { id: 'B', name: 'Vertical Layout', weight: 0.5, config: { layout: 'vertical' } }
            ],
            targetSelector: '.pricing-table',
            type: 'layout',
            startDate: new Date(),
            endDate: null,
            isActive: true,
            sampleSize: 500,
            confidenceLevel: 0.9
        });

        // Test 3: Form Field Count
        this.registerTest('form_fields', {
            name: 'Lead Form Field Count',
            description: 'Test different numbers of form fields',
            variants: [
                { id: 'A', name: 'Control', weight: 0.34, config: { fields: 3 } },
                { id: 'B', name: 'Minimal', weight: 0.33, config: { fields: 1 } },
                { id: 'C', name: 'Detailed', weight: 0.33, config: { fields: 5 } }
            ],
            targetSelector: '.lead-form',
            type: 'form',
            startDate: new Date(),
            endDate: null,
            isActive: true,
            sampleSize: 750,
            confidenceLevel: 0.95
        });

        // Test 4: Social Proof Display
        this.registerTest('social_proof', {
            name: 'Social Proof Display',
            description: 'Test different social proof display methods',
            variants: [
                { id: 'A', name: 'Control', weight: 0.5, config: { type: 'logos' } },
                { id: 'B', name: 'Testimonials', weight: 0.5, config: { type: 'testimonials' } }
            ],
            targetSelector: '.social-proof',
            type: 'content',
            startDate: new Date(),
            endDate: null,
            isActive: true,
            sampleSize: 600,
            confidenceLevel: 0.9
        });

        // Test 5: CTA Button Color
        this.registerTest('cta_color', {
            name: 'CTA Button Color',
            description: 'Test different CTA button colors',
            variants: [
                { id: 'A', name: 'Control', weight: 0.25, config: { color: '#4CAF50' } },
                { id: 'B', name: 'Blue', weight: 0.25, config: { color: '#2196F3' } },
                { id: 'C', name: 'Orange', weight: 0.25, config: { color: '#FF9800' } },
                { id: 'D', name: 'Purple', weight: 0.25, config: { color: '#9C27B0' } }
            ],
            targetSelector: '.primary-cta',
            type: 'style',
            startDate: new Date(),
            endDate: null,
            isActive: true,
            sampleSize: 800,
            confidenceLevel: 0.95
        });
    }

    // Register a new test
    registerTest(testId, config) {
        this.tests.set(testId, {
            ...config,
            id: testId,
            createdAt: new Date(),
            updatedAt: new Date(),
            participants: 0,
            conversions: 0,
            stats: {
                impressions: 0,
                clicks: 0,
                conversions: 0,
                conversionRate: 0
            }
        });
        
        this.saveToStorage();
    }

    // Allocate variants for current user
    allocateVariants() {
        this.tests.forEach((test, testId) => {
            if (test.isActive && !this.userVariants.has(testId)) {
                const variant = this.selectVariant(test);
                this.userVariants.set(testId, variant);
                
                // Track allocation
                this.trackEvent(testId, 'allocated', variant.id);
            }
        });
        
        this.saveToStorage();
    }

    // Select variant based on weights
    selectVariant(test) {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (const variant of test.variants) {
            cumulativeWeight += variant.weight;
            if (random <= cumulativeWeight) {
                return variant;
            }
        }
        
        // Fallback to first variant
        return test.variants[0];
    }

    // Apply variants to the page
    applyVariants() {
        this.userVariants.forEach((variant, testId) => {
            const test = this.tests.get(testId);
            if (test && test.isActive) {
                this.applyVariant(test, variant);
                
                // Track impression
                this.trackImpression(testId, variant.id);
            }
        });
    }

    // Apply specific variant to page
    applyVariant(test, variant) {
        const elements = document.querySelectorAll(test.targetSelector);
        
        elements.forEach(element => {
            this.applyVariantToElement(element, test, variant);
        });
    }

    // Apply variant to specific element
    applyVariantToElement(element, test, variant) {
        switch (test.type) {
            case 'text':
                this.applyTextVariant(element, variant);
                break;
            case 'style':
                this.applyStyleVariant(element, variant);
                break;
            case 'layout':
                this.applyLayoutVariant(element, variant);
                break;
            case 'content':
                this.applyContentVariant(element, variant);
                break;
            case 'form':
                this.applyFormVariant(element, variant);
                break;
            default:
                console.warn(`Unknown test type: ${test.type}`);
        }
        
        // Add data attributes for tracking
        element.setAttribute('data-test-id', test.id);
        element.setAttribute('data-variant-id', variant.id);
        
        // Add animation for smooth transition
        this.animateVariantChange(element);
    }

    // Apply text variant
    applyTextVariant(element, variant) {
        if (variant.config.text) {
            element.textContent = variant.config.text;
        }
    }

    // Apply style variant
    applyStyleVariant(element, variant) {
        if (variant.config.color) {
            element.style.backgroundColor = variant.config.color;
        }
        
        if (variant.config.size) {
            element.style.fontSize = variant.config.size;
        }
    }

    // Apply layout variant
    applyLayoutVariant(element, variant) {
        if (variant.config.layout === 'vertical') {
            element.classList.add('vertical-layout');
            element.classList.remove('horizontal-layout');
        } else {
            element.classList.add('horizontal-layout');
            element.classList.remove('vertical-layout');
        }
    }

    // Apply content variant
    applyContentVariant(element, variant) {
        if (variant.config.type === 'testimonials') {
            element.innerHTML = `
                <div class="testimonial-slider">
                    <div class="testimonial">"Great product!" - User A</div>
                    <div class="testimonial">"Highly recommended!" - User B</div>
                </div>
            `;
        } else {
            element.innerHTML = `
                <div class="client-logos">
                    <img src="/logos/company1.png" alt="Company 1">
                    <img src="/logos/company2.png" alt="Company 2">
                </div>
            `;
        }
    }

    // Apply form variant
    applyFormVariant(element, variant) {
        const fieldCount = variant.config.fields || 3;
        const form = element.querySelector('form') || element;
        
        // Hide/show fields based on variant
        const fields = form.querySelectorAll('.form-field');
        fields.forEach((field, index) => {
            if (index < fieldCount) {
                field.style.display = 'block';
            } else {
                field.style.display = 'none';
            }
        });
    }

    // Animate variant change
    animateVariantChange(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    // Setup event tracking
    setupEventTracking() {
        // Track clicks on test elements
        document.addEventListener('click', (e) => {
            const testElement = e.target.closest('[data-test-id]');
            if (testElement) {
                const testId = testElement.getAttribute('data-test-id');
                const variantId = testElement.getAttribute('data-variant-id');
                
                this.trackClick(testId, variantId);
                
                // Check if this is a conversion
                if (testElement.classList.contains('conversion-element')) {
                    this.trackConversion(testId, variantId);
                }
            }
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const testElement = form.closest('[data-test-id]');
            
            if (testElement) {
                const testId = testElement.getAttribute('data-test-id');
                const variantId = testElement.getAttribute('data-variant-id');
                
                this.trackConversion(testId, variantId, 'form_submission');
            }
        });

        // Track scroll depth
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollPercent = this.getScrollPercentage();
                this.trackEvent('page', 'scroll_depth', Math.round(scrollPercent));
            }, 100);
        });

        // Track time on page
        let pageLoadTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - pageLoadTime) / 1000);
            this.trackEvent('page', 'time_spent', timeSpent);
        });
    }

    // Track impression
    trackImpression(testId, variantId) {
        const key = `${testId}_${variantId}`;
        this.analytics.impressions.set(key, (this.analytics.impressions.get(key) || 0) + 1);
        
        // Update test stats
        const test = this.tests.get(testId);
        if (test) {
            test.stats.impressions++;
            test.updatedAt = new Date();
        }
        
        this.saveToStorage();
    }

    // Track click
    trackClick(testId, variantId) {
        const key = `${testId}_${variantId}`;
        this.analytics.clicks.set(key, (this.analytics.clicks.get(key) || 0) + 1);
        
        // Update test stats
        const test = this.tests.get(testId);
        if (test) {
            test.stats.clicks++;
            test.updatedAt = new Date();
        }
        
        this.saveToStorage();
    }

    // Track conversion
    trackConversion(testId, variantId, type = 'click') {
        const key = `${testId}_${variantId}`;
        this.analytics.conversions.set(key, (this.analytics.conversions.get(key) || 0) + 1);
        
        // Update test stats
        const test = this.tests.get(testId);
        if (test) {
            test.stats.conversions++;
            test.stats.conversionRate = (test.stats.conversions / test.stats.impressions) * 100;
            test.updatedAt = new Date();
        }
        
        // Send to analytics
        this.sendAnalyticsEvent('conversion', {
            testId,
            variantId,
            type,
            userId: this.currentUser,
            timestamp: new Date().toISOString()
        });
        
        this.saveToStorage();
    }

    // Track generic event
    trackEvent(testId, eventName, value = null) {
        const key = `${testId}_${eventName}`;
        this.analytics.events.set(key, (this.analytics.events.get(key) || 0) + 1);
        
        this.sendAnalyticsEvent(eventName, {
            testId,
            value,
            userId: this.currentUser,
            timestamp: new Date().toISOString()
        });
        
        this.saveToStorage();
    }

    // Setup analytics reporting
    setupAnalytics() {
        // Send pageview
        this.sendAnalyticsEvent('pageview', {
            url: window.location.href,
            userId: this.currentUser,
            timestamp: new Date().toISOString()
        });

        // Periodic sync
        setInterval(() => {
            this.syncAnalytics();
        }, 30000); // Every 30 seconds
    }

    // Send analytics event
    sendAnalyticsEvent(eventName, data) {
        // In production, this would send to your analytics service
        // For now, we'll log to console and store locally
        console.log(`Analytics Event: ${eventName}`, data);
        
        // Store locally for debugging
        const events = JSON.parse(localStorage.getItem('ab_analytics_events') || '[]');
        events.push({ eventName, data, timestamp: new Date().toISOString() });
        localStorage.setItem('ab_analytics_events', JSON.stringify(events.slice(-1000))); // Keep last 1000 events
    }

    // Sync analytics data
    syncAnalytics() {
        // This would sync with your backend in production
        console.log('Syncing analytics data...');
    }

    // Setup mutation observer for dynamic content
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            this.checkForTestElements(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Check for test elements in new content
    checkForTestElements(element) {
        this.tests.forEach((test, testId) => {
            if (test.isActive) {
                const variant = this.userVariants.get(testId);
                if (variant) {
                    const elements = element.querySelectorAll ? 
                        element.querySelectorAll(test.targetSelector) : [];
                    
                    elements.forEach(el => {
                        this.applyVariantToElement(el, test, variant);
                        this.trackImpression(testId, variant.id);
                    });
                }
            }
        });
    }

    // Setup performance tracking
    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                this.trackEvent('performance', 'page_load', {
                    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart
                });
            }
        });

        // Track CLS (Cumulative Layout Shift)
        let clsValue = 0;
        let clsEntries = [];

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    clsEntries.push(entry);
                }
            }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        // Report CLS on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.trackEvent('performance', 'cls', clsValue);
            }
        });
    }

    // Get scroll percentage
    getScrollPercentage() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        
        return (scrollTop / (documentHeight - windowHeight)) * 100;
    }

    // Calculate statistical significance
    calculateSignificance(testId) {
        const test = this.tests.get(testId);
        if (!test) return null;
        
        const results = [];
        
        test.variants.forEach(variant => {
            const key = `${testId}_${variant.id}`;
            const impressions = this.analytics.impressions.get(key) || 0;
            const conversions = this.analytics.conversions.get(key) || 0;
            const rate = impressions > 0 ? (conversions / impressions) : 0;
            
            results.push({
                variant: variant.id,
                impressions,
                conversions,
                conversionRate: rate
            });
        });
        
        // Simple significance calculation (in production, use proper statistical methods)
        if (results.length >= 2) {
            const control = results.find(r => r.variant === 'A') || results[0];
            const bestVariant = results.reduce((best, current) => 
                current.conversionRate > best.conversionRate ? current : best
            );
            
            const improvement = ((bestVariant.conversionRate - control.conversionRate) / control.conversionRate) * 100;
            
            return {
                isSignificant: bestVariant.impressions >= test.sampleSize,
                bestVariant: bestVariant.variant,
                improvement: improvement.toFixed(2) + '%',
                confidence: test.confidenceLevel
            };
        }
        
        return null;
    }

    // Get test results
    getTestResults(testId) {
        const test = this.tests.get(testId);
        if (!test) return null;
        
        const variantsData = test.variants.map(variant => {
            const key = `${testId}_${variant.id}`;
            return {
                ...variant,
                impressions: this.analytics.impressions.get(key) || 0,
                clicks: this.analytics.clicks.get(key) || 0,
                conversions: this.analytics.conversions.get(key) || 0,
                conversionRate: ((this.analytics.conversions.get(key) || 0) / (this.analytics.impressions.get(key) || 1)) * 100
            };
        });
        
        const significance = this.calculateSignificance(testId);
        
        return {
            test: {
                ...test,
                participants: Array.from(this.userVariants.keys()).filter(id => id === testId).length
            },
            variants: variantsData,
            significance,
            totalImpressions: variantsData.reduce((sum, v) => sum + v.impressions, 0),
            totalConversions: variantsData.reduce((sum, v) => sum + v.conversions, 0)
        };
    }

    // Get all test results
    getAllTestResults() {
        const results = {};
        this.tests.forEach((test, testId) => {
            results[testId] = this.getTestResults(testId);
        });
        return results;
    }

    // Public API methods
    getCurrentVariants() {
        return Object.fromEntries(this.userVariants);
    }
    
    getTest(testId) {
        return this.tests.get(testId);
    }
    
    createTest(config) {
        const testId = config.id || `test_${Date.now()}`;
        this.registerTest(testId, config);
        return testId;
    }
    
    endTest(testId) {
        const test = this.tests.get(testId);
        if (test) {
            test.isActive = false;
            test.endDate = new Date();
            this.saveToStorage();
        }
    }
    
    resetTest(testId) {
        // Remove user allocations for this test
        this.userVariants.delete(testId);
        
        // Reset analytics for this test
        const test = this.tests.get(testId);
        if (test) {
            test.stats = { impressions: 0, clicks: 0, conversions: 0, conversionRate: 0 };
        }
        
        // Clear analytics entries
        const prefix = `${testId}_`;
        this.analytics.impressions.forEach((value, key) => {
            if (key.startsWith(prefix)) this.analytics.impressions.delete(key);
        });
        this.analytics.clicks.forEach((value, key) => {
            if (key.startsWith(prefix)) this.analytics.clicks.delete(key);
        });
        this.analytics.conversions.forEach((value, key) => {
            if (key.startsWith(prefix)) this.analytics.conversions.delete(key);
        });
        
        this.saveToStorage();
    }
    
    exportData() {
        return {
            userId: this.currentUser,
            tests: Array.from(this.tests.entries()),
            userVariants: Array.from(this.userVariants.entries()),
            analytics: {
                impressions: Array.from(this.analytics.impressions.entries()),
                clicks: Array.from(this.analytics.clicks.entries()),
                conversions: Array.from(this.analytics.conversions.entries()),
                events: Array.from(this.analytics.events.entries())
            }
        };
    }
}

// Initialize A/B testing when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const abTesting = new ABTesting();
    abTesting.init();
    
    // Make A/B testing available globally
    window.abTesting = abTesting;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ABTesting;
}