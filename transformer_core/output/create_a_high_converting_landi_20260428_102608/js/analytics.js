// analytics.js - Analytics tracking, event monitoring, and performance measurement

import { throttle } from './utils/throttle.js';
import { debounce } from './utils/debounce.js';

// Analytics configuration and state
const Analytics = {
    config: {
        trackingId: 'UA-XXXXX-Y', // Replace with actual tracking ID
        sampleRate: 100,
        sessionTimeout: 1800000, // 30 minutes
        pageViewDelay: 1000,
        eventDebounce: 300
    },
    session: {
        id: generateSessionId(),
        startTime: Date.now(),
        pageViews: 0,
        events: [],
        user: {}
    },
    page: {
        loadTime: 0,
        domReadyTime: 0,
        scrollDepth: 0,
        engagementTime: 0
    },
    isInitialized: false
};

// Initialize analytics system
function initAnalytics() {
    console.log('Initializing analytics...');
    
    // Load analytics scripts
    loadAnalyticsScripts();
    
    // Setup performance monitoring
    setupPerformanceMonitoring();
    
    // Setup event tracking
    setupEventTracking();
    
    // Setup user behavior tracking
    setupUserBehaviorTracking();
    
    // Setup conversion tracking
    setupConversionTracking();
    
    // Setup A/B testing tracking
    setupABTesting();
    
    Analytics.isInitialized = true;
    console.log('Analytics initialized successfully');
    
    // Track initial page view
    trackPageView();
}

// Load analytics scripts dynamically
function loadAnalyticsScripts() {
    // Google Analytics (replace with your actual tracking code)
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', Analytics.config.trackingId, {
        'sample_rate': Analytics.config.sampleRate
    });
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${Analytics.config.trackingId}`;
    document.head.appendChild(script);
}

// Setup performance monitoring
function setupPerformanceMonitoring() {
    // Track page load performance
    window.addEventListener('load', () => {
        Analytics.page.loadTime = performance.now();
        trackPerformance('page_load', Analytics.page.loadTime);
    });
    
    // Track DOM ready time
    document.addEventListener('DOMContentLoaded', () => {
        Analytics.page.domReadyTime = performance.now();
        trackPerformance('dom_ready', Analytics.page.domReadyTime);
    });
    
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
        setupCoreWebVitals();
    }
    
    // Track resource loading
    setupResourceTracking();
}

// Setup Core Web Vitals tracking
function setupCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        trackPerformance('lcp', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    
    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
            trackPerformance('fid', entry.processingStart - entry.startTime);
        });
    }).observe({ type: 'first-input', buffered: true });
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
                trackPerformance('cls', clsValue);
            }
        });
    }).observe({ type: 'layout-shift', buffered: true });
}

// Setup resource tracking
function setupResourceTracking() {
    new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
            if (entry.entryType === 'resource') {
                trackPerformance('resource_load', entry.duration, {
                    name: entry.name,
                    type: entry.initiatorType
                });
            }
        });
    }).observe({ entryTypes: ['resource'] });
}

// Setup event tracking
function setupEventTracking() {
    // Track clicks on important elements
    document.addEventListener('click', debounce((e) => {
        const target = e.target;
        trackClickEvents(target);
    }, Analytics.config.eventDebounce));
    
    // Track form interactions
    document.addEventListener('submit', (e) => {
        trackFormSubmission(e.target);
    });
    
    // Track video interactions
    setupVideoTracking();
    
    // Track social media interactions
    setupSocialTracking();
}

// Track click events
function trackClickEvents(element) {
    const clickable = element.closest('[data-track-click]');
    if (clickable) {
        const eventName = clickable.getAttribute('data-track-click') || 'click';
        const eventCategory = clickable.getAttribute('data-track-category') || 'engagement';
        const eventLabel = clickable.getAttribute('data-track-label') || element.textContent.trim();
        
        trackEvent(eventCategory, eventName, eventLabel);
    }
    
    // Track CTA clicks specifically
    if (element.closest('.cta-button, .btn-primary')) {
        trackEvent('conversion', 'cta_click', 'Primary CTA');
    }
    
    // Track navigation clicks
    if (element.closest('.nav-link')) {
        trackEvent('navigation', 'nav_click', element.textContent.trim());
    }
}

// Track form submissions
function trackFormSubmission(form) {
    const formType = form.getAttribute('data-form-type') || 'general';
    trackEvent('conversion', 'form_submission', formType);
    
    // Track form field interactions
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        if (field.value) {
            trackEvent('form', 'field_completion', field.name);
        }
    });
}

// Setup video tracking
function setupVideoTracking() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.addEventListener('play', () => {
            trackEvent('media', 'video_play', video.src);
        });
        
        video.addEventListener('pause', () => {
            trackEvent('media', 'video_pause', video.src);
        });
        
        video.addEventListener('ended', () => {
            trackEvent('media', 'video_complete', video.src);
        });
    });
}

// Setup social tracking
function setupSocialTracking() {
    const socialLinks = document.querySelectorAll('[data-social-share]');
    socialLinks.forEach(link => {
        link.addEventListener('click', () => {
            const platform = link.getAttribute('data-social-share');
            trackEvent('social', 'share', platform);
        });
    });
}

// Setup user behavior tracking
function setupUserBehaviorTracking() {
    // Track scroll depth
    window.addEventListener('scroll', throttle(() => {
        trackScrollDepth();
    }, 100));
    
    // Track time on page
    setupTimeTracking();
    
    // Track mouse movement and heatmaps
    setupHeatmapTracking();
    
    // Track session duration
    setupSessionTracking();
}

// Track scroll depth
function trackScrollDepth() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = (scrollY / (docHeight - winHeight)) * 100;
    
    if (scrollPercent > Analytics.page.scrollDepth) {
        Analytics.page.scrollDepth = Math.floor(scrollPercent);
        
        // Track milestone scroll depths
        const milestones = [25, 50, 75, 90, 100];
        milestones.forEach(milestone => {
            if (scrollPercent >= milestone && Analytics.page.scrollDepth < milestone) {
                trackEvent('engagement', 'scroll_depth', `${milestone}%`);
            }
        });
    }
}

// Setup time tracking
function setupTimeTracking() {
    let startTime = Date.now();
    let activeTime = 0;
    let lastActive = Date.now();
    
    // Track active time
    const activityEvents = ['mousemove', 'keypress', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
        document.addEventListener(event, () => {
            const now = Date.now();
            activeTime += now - lastActive;
            lastActive = now;
        });
    });
    
    // Update engagement time periodically
    setInterval(() => {
        Analytics.page.engagementTime = Math.floor(activeTime / 1000);
        trackEvent('engagement', 'time_on_page', `${Analytics.page.engagementTime}s`);
    }, 30000);
}

// Setup heatmap tracking
function setupHeatmapTracking() {
    // Basic heatmap tracking (simplified)
    document.addEventListener('mousemove', throttle((e) => {
        trackHeatmapData(e.clientX, e.clientY);
    }, 1000));
    
    // Track clicks for click maps
    document.addEventListener('click', (e) => {
        trackClickMapData(e.clientX, e.clientY, e.target);
    });
}

// Track heatmap data
function trackHeatmapData(x, y) {
    // Implement heatmap data collection
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const normalizedX = Math.floor((x / viewportWidth) * 100);
    const normalizedY = Math.floor((y / viewportHeight) * 100);
    
    trackEvent('heatmap', 'mouse_move', `${normalizedX},${normalizedY}`);
}

// Track click map data
function trackClickMapData(x, y, element) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const normalizedX = Math.floor((x / viewportWidth) * 100);
    const normalizedY = Math.floor((y / viewportHeight) * 100);
    const elementType = element.tagName.toLowerCase();
    
    trackEvent('heatmap', 'click', `${normalizedX},${normalizedY},${elementType}`);
}

// Setup session tracking
function setupSessionTracking() {
    // Check session timeout
    setInterval(() => {
        const now = Date.now();
        if (now - Analytics.session.startTime > Analytics.config.sessionTimeout) {
            endSession();
            startNewSession();
        }
    }, 60000);
    
    // Track session start
    trackEvent('session', 'start', Analytics.session.id);
}

// Setup conversion tracking
function setupConversionTracking() {
    // Track goal completions
    window.addEventListener('conversion', (e) => {
        trackConversion(e.detail);
    });
    
    // Track lead generation
    document.addEventListener('leadCaptured', (e) => {
        trackLeadGeneration(e.detail);
    });
    
    // Track revenue events
    document.addEventListener('purchase', (e) => {
        trackPurchase(e.detail);
    });
}

// Setup A/B testing tracking
function setupABTesting() {
    // Track A/B test variations
    document.addEventListener('abTestAssigned', (e) => {
        trackABTestAssignment(e.detail);
    });
    
    // Track test conversions
    document.addEventListener('abTestConversion', (e) => {
        trackABTestConversion(e.detail);
    });
}

// Track page view
function trackPageView() {
    Analytics.session.pageViews++;
    const pageTitle = document.title;
    const pagePath = window.location.pathname;
    
    if (typeof gtag === 'function') {
        gtag('config', Analytics.config.trackingId, {
            page_title: pageTitle,
            page_path: pagePath
        });
    }
    
    trackEvent('page', 'view', pagePath);
}

// Track custom event
function trackEvent(category, action, label, value = null) {
    const eventData = {
        category,
        action,
        label,
        value,
        timestamp: Date.now()
    };
    
    Analytics.session.events.push(eventData);
    
    if (typeof gtag === 'function') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    console.log('Event tracked:', eventData);
}

// Track performance metric
function trackPerformance(metric, value, additionalData = {}) {
    trackEvent('performance', metric, `${value}ms`, value, additionalData);
}

// Track conversion
function trackConversion(conversionData) {
    const { type, value, id } = conversionData;
    trackEvent('conversion', type, id, value);
}

// Track lead generation
function trackLeadGeneration(leadData) {
    const { source, value, id } = leadData;
    trackEvent('lead', 'generated', source, value);
    trackConversion({ type: 'lead', value, id });
}

// Track purchase
function trackPurchase(purchaseData) {
    const { amount, items, id } = purchaseData;
    trackEvent('revenue', 'purchase', id, amount);
    trackConversion({ type: 'purchase', value: amount, id });
}

// Track A/B test assignment
function trackABTestAssignment(testData) {
    const { testId, variation, userId } = testData;
    trackEvent('ab_test', 'assignment', `${testId}_${variation}`, null, { userId });
}

// Track A/B test conversion
function trackABTestConversion(testData) {
    const { testId, variation, conversionType, value } = testData;
    trackEvent('ab_test', 'conversion', `${testId}_${variation}_${conversionType}`, value);
}

// Generate unique session ID
function generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Start new session
function startNewSession() {
    Analytics.session = {
        id: generateSessionId(),
        startTime: Date.now(),
        pageViews: 0,
        events: [],
        user: Analytics.session.user // Preserve user data
    };
    trackEvent('session', 'start', Analytics.session.id);
}

// End current session
function endSession() {
    const duration = Date.now() - Analytics.session.startTime;
    trackEvent('session', 'end', `${Math.floor(duration / 1000)}s`);
}

// Get analytics data
export function getAnalyticsData() {
    return {
        session: Analytics.session,
        page: Analytics.page,
        config: Analytics.config
    };
}

// Reset analytics (for testing)
export function resetAnalytics() {
    Analytics.session = {
        id: generateSessionId(),
        startTime: Date.now(),
        pageViews: 0,
        events: [],
        user: {}
    };
    Analytics.page = {
        loadTime: 0,
        domReadyTime: 0,
        scrollDepth: 0,
        engagementTime: 0
    };
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', initAnalytics);

// Export analytics functions
export {
    initAnalytics,
    trackEvent,
    trackPageView,
    trackConversion,
    getAnalyticsData,
    resetAnalytics
};