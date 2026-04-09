// js/main.js - Core application logic, initialization, and shared utilities

// ============================================
// INITIALIZATION AND CORE APPLICATION LOGIC
// ============================================

// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application initialized');
    
    // Initialize core functionality
    initCoreFeatures();
    initSharedUtilities();
    setupEventListeners();
    
    // Check for PWA support and setup
    if ('serviceWorker' in navigator) {
        setupServiceWorker();
    }
    
    // Initialize SEO structured data
    generateStructuredData();
});

// ============================================
// CORE FEATURES INITIALIZATION
// ============================================

/**
 * Initialize all core application features
 */
function initCoreFeatures() {
    // Initialize smooth scrolling for table of contents and navigation
    initSmoothScrolling();
    
    // Initialize dynamic components
    initDynamicComponents();
    
    // Setup intersection observers for lazy loading and animations
    setupObservers();
    
    // Initialize PWA features if supported
    if ('serviceWorker' in navigator) {
        initPWAFeatures();
    }
}

/**
 * Initialize smooth scrolling for navigation elements
 */
function initSmoothScrolling() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize dynamic components that need runtime setup
 */
function initDynamicComponents() {
    // Initialize reading time indicators
    initReadingTime();
    
    // Initialize scroll progress bars
    initScrollProgress();
    
    // Initialize syntax highlighting if Prism is available
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
    
    // Initialize image lightboxes
    initImageLightboxes();
    
    // Initialize share buttons
    initShareButtons();
}

/**
 * Setup intersection observers for performance optimizations
 */
function setupObservers() {
    // Lazy load images
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    // Animate elements on scroll
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        animationObserver.observe(el);
    });
}

// ============================================
// SHARED UTILITIES
// ============================================

/**
 * Initialize shared utility functions
 */
function initSharedUtilities() {
    // Add utility methods to global scope
    window.AppUtils = {
        debounce,
        throttle,
        formatDate,
        truncateText,
        generateSlug,
        escapeHTML,
        getQueryParams,
        setQueryParam,
        removeQueryParam,
        copyToClipboard,
        isMobile,
        isTouchDevice,
        getScrollPosition,
        scrollToTop
    };
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function for scroll/resize events
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format date to readable string
 */
function formatDate(dateString, format = 'long') {
    const date = new Date(dateString);
    const options = format === 'short' 
        ? { year: 'numeric', month: 'short', day: 'numeric' }
        : { year: 'numeric', month: 'long', day: 'numeric' };
    
    return date.toLocaleDateString('en-US', options);
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Generate URL slug from text
 */
function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get query parameters from URL
 */
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    });
    
    return params;
}

/**
 * Set query parameter in URL
 */
function setQueryParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
}

/**
 * Remove query parameter from URL
 */
function removeQueryParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text:', err);
        return false;
    }
}

/**
 * Check if device is mobile
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Check if device supports touch
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get current scroll position
 */
function getScrollPosition() {
    return {
        x: window.pageXOffset,
        y: window.pageYOffset,
        maxY: document.documentElement.scrollHeight - window.innerHeight
    };
}

/**
 * Smooth scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Window resize handler (throttled for performance)
    window.addEventListener('resize', throttle(handleResize, 200));
    
    // Scroll handler (throttled for performance)
    window.addEventListener('scroll', throttle(handleScroll, 100));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Click outside handlers for dropdowns and modals
    document.addEventListener('click', handleClickOutside);
}

/**
 * Handle window resize events
 */
function handleResize() {
    // Update any responsive elements
    updateResponsiveElements();
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('app:resize'));
}

/**
 * Handle scroll events
 */
function handleScroll() {
    // Update scroll progress indicators
    updateScrollProgress();
    
    // Update table of contents highlighting
    updateTOCHighlighting();
    
    // Lazy load content when near bottom
    checkInfiniteScroll();
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    // Escape key closes modals and dropdowns
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // Ctrl/Cmd + F focuses search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) searchInput.focus();
    }
}

/**
 * Handle clicks outside of active elements
 */
function handleClickOutside(e) {
    // Close dropdowns when clicking outside
    document.querySelectorAll('.dropdown.active').forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Close modals when clicking on backdrop
    document.querySelectorAll('.modal.active').forEach(modal => {
        if (modal === e.target) {
            closeModal(modal);
        }
    });
}

// ============================================
// COMPONENT-SPECIFIC INITIALIZERS
// ============================================

/**
 * Initialize reading time indicators
 */
function initReadingTime() {
    const readingTimeElements = document.querySelectorAll('.reading-time');
    
    readingTimeElements.forEach(element => {
        const content = element.closest('article')?.querySelector('.post-content');
        if (content) {
            const text = content.textContent || '';
            const wordCount = text.trim().split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
            
            element.textContent = `${readingTime} min read`;
            element.setAttribute('aria-label', `Estimated reading time: ${readingTime} minutes`);
        }
    });
}

/**
 * Initialize scroll progress indicators
 */
function initScrollProgress() {
    const progressBars = document.querySelectorAll('.scroll-progress-bar');
    
    if (progressBars.length > 0) {
        updateScrollProgress();
    }
}

/**
 * Update scroll progress bars
 */
function updateScrollProgress() {
    const scrollPosition = getScrollPosition();
    const progress = (scrollPosition.y / scrollPosition.maxY) * 100;
    
    document.querySelectorAll('.scroll-progress-bar').forEach(bar => {
        bar.style.width = `${progress}%`;
        bar.setAttribute('aria-valuenow', Math.round(progress));
    });
}

/**
 * Initialize image lightboxes
 */
function initImageLightboxes() {
    const lightboxImages = document.querySelectorAll('img[data-lightbox]');
    
    lightboxImages.forEach(img => {
        img.addEventListener('click', () => {
            openLightbox(img);
        });
        
        // Make images keyboard accessible
        img.setAttribute('tabindex', '0');
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(img);
            }
        });
    });
}

/**
 * Open lightbox for image
 */
function openLightbox(img) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox active';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
            <button class="lightbox-prev" aria-label="Previous image">‹</button>
            <button class="lightbox-next" aria-label="Next image">›</button>
            <img src="${img.src}" alt="${img.alt || 'Enlarged image'}">
            <div class="lightbox-caption">${img.alt || ''}</div>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Add event listeners
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        closeLightbox(lightbox);
    });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox(lightbox);
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function handleLightboxKeys(e) {
        if (e.key === 'Escape') closeLightbox(lightbox);
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

/**
 * Close lightbox
 */
function closeLightbox(lightbox) {
    if (lightbox) {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightbox.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

/**
 * Initialize share buttons
 */
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-button');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = button.dataset.platform;
            const url = button.dataset.url || window.location.href;
            const title = button.dataset.title || document.title;
            
            shareContent(platform, url, title);
        });
    });
}

/**
 * Share content on social platforms
 */
function shareContent(platform, url, title) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
        reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
    };
    
    if (platform === 'copy') {
        copyToClipboard(url).then(success => {
            if (success) {
                showNotification('Link copied to clipboard!');
            }
        });
    } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
}

// ============================================
// PWA AND OFFLINE SUPPORT
// ============================================

/**
 * Setup service worker for PWA
 */
function setupServiceWorker() {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('ServiceWorker update found');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

/**
 * Initialize PWA features
 */
function initPWAFeatures() {
    // Add to home screen prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        showInstallPrompt();
    });
    
    // Track app launch mode
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        // Send analytics or update UI
    });
}

/**
 * Show PWA install prompt
 */
function showInstallPrompt() {
    const installButton = document.createElement('button');
    installButton.className = 'pwa-install-btn';
    installButton.textContent = 'Install App';
    installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
    `;
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
            installButton.remove();
        }
    });
    
    document.body.appendChild(installButton);
}

// ============================================
// SEO AND STRUCTURED DATA
// ============================================

/**
 * Generate JSON-LD structured data for SEO
 */
function generateStructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": document.title,
        "url": window.location.origin,
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${window.location.origin}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };
    
    // Add page-specific structured data
    if (document.body.classList.contains('single-post')) {
        addArticleStructuredData();
    } else if (document.body.classList.contains('author-page')) {
        addAuthorStructuredData();
    }
    
    // Insert structured data into page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

/**
 * Add article-specific structured data
 */
function addArticleStructuredData() {
    const article = document.querySelector('article');
    if (!article) return;
    
    const articleData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.querySelector('h1')?.textContent || document.title,
        "description": article.querySelector('meta[name="description"]')?.content || '',
        "image": article.querySelector('img')?.src || '',
        "datePublished": article.querySelector('time[datetime]')?.getAttribute('datetime') || '',
        "dateModified": article.querySelector('time[datetime]')?.getAttribute('datetime') || '',
        "author": {
            "@type": "Person",
            "name": article.querySelector('.author-name')?.textContent || ''
        },
        "publisher": {
            "@type": "Organization",
            "name": document.title.split(' - ')[0] || document.title,
            "logo": {
                "@type": "ImageObject",
                "url": window.location.origin + '/logo.png'
            }
        }
    };
    
    // Insert article structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(articleData);
    document.head.appendChild(script);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Close all active modals
 */
function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        closeModal(modal);
    });
}

/**
 * Close specific modal
 */
function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 300);
}

/**
 * Update responsive elements on resize
 */
function updateResponsiveElements() {
    // Update any elements that need responsive adjustments
    const isMobileView = isMobile();
    
    // Example: Toggle mobile menu visibility
    const navMenu = document.querySelector('.navigation-menu');
    if (navMenu) {
        if (isMobileView) {
            navMenu.classList.add('mobile-view');
        } else {
            navMenu.classList.remove('mobile-view');
        }
    }
}

/**
 * Update table of contents highlighting
 */
function updateTOCHighlighting() {
    const tocLinks = document.querySelectorAll('.table-of-contents a');
    const headings = document.querySelectorAll('h2, h3');
    
    let currentHeading = null;
    const scrollPosition = window.scrollY + 100;
    
    headings.forEach(heading => {
        if (heading.offsetTop <= scrollPosition) {
            currentHeading = heading;
        }
    });
    
    if (currentHeading) {
        const currentId = currentHeading.id;
        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    }
}

/**
 * Check for infinite scroll opportunity
 */
function checkInfiniteScroll() {
    const scrollPosition = getScrollPosition();
    const threshold = 100; // pixels from bottom
    
    if (scrollPosition.maxY - scrollPosition.y < threshold) {
        // Dispatch event for components to load more content
        window.dispatchEvent(new CustomEvent('app:infiniteScroll'));
    }
}

/**
 * Show update notification for service worker
 */
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <p>A new version is available!</p>
        <button class="btn-update">Update Now</button>
        <button class="btn-dismiss">Dismiss</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.btn-update').addEventListener('click', () => {
        window.location.reload();
    });
    
    notification.querySelector('.btn-dismiss').addEventListener('click', () => {
        notification.remove();
    });
}

// ============================================
// GLOBAL ERROR HANDLING
// ============================================

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Send error to analytics if available
    if (typeof gtag === 'function') {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// ============================================
// EXPORT UTILITIES FOR MODULE USE
// ============================================

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        formatDate,
        truncateText,
        generateSlug,
        escapeHTML,
        getQueryParams,
        setQueryParam,
        removeQueryParam,
        copyToClipboard,
        isMobile,
        isTouchDevice,
        getScrollPosition,
        scrollToTop,
        showNotification
    };
}