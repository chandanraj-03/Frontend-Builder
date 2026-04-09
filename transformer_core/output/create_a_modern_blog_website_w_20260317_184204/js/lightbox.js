// js/lightbox.js - Lightbox gallery system for image viewing with navigation and zoom functionality

// ============================================
// LIGHTBOX MODULE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Lightbox module initialized');
    
    // Initialize lightbox functionality
    initLightboxSystem();
    setupLightboxListeners();
    
    // Preload lightbox assets
    preloadLightboxAssets();
});

// ============================================
// LIGHTBOX SYSTEM INITIALIZATION
// ============================================

/**
 * Initialize the complete lightbox system
 */
function initLightboxSystem() {
    // Create main lightbox container if it doesn't exist
    if (!document.querySelector('.lightbox-container')) {
        createLightboxContainer();
    }
    
    // Setup image lightbox triggers
    setupLightboxTriggers();
    
    // Setup gallery groupings if available
    setupGalleryGroups();
}

/**
 * Create main lightbox container structure
 */
function createLightboxContainer() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-container';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
    
    lightbox.innerHTML = `
        <div class="lightbox-content" style="position: relative; max-width: 90vw; max-height: 90vh;">
            <button class="lightbox-close" aria-label="Close lightbox" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                font-size: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10;
            ">&times;</button>
            
            <button class="lightbox-prev" aria-label="Previous image" style="
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                font-size: 24px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10;
            ">&#8249;</button>
            
            <button class="lightbox-next" aria-label="Next image" style="
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                font-size: 24px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10;
            ">&#8250;</button>
            
            <div class="lightbox-image-container" style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            ">
                <img class="lightbox-image" style="
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    transition: transform 0.3s ease;
                ">
            </div>
            
            <div class="lightbox-caption" style="
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                text-align: center;
                background: rgba(0, 0, 0, 0.7);
                padding: 10px 20px;
                border-radius: 4px;
                max-width: 80%;
            "></div>
            
            <div class="lightbox-counter" style="
                position: absolute;
                top: 20px;
                left: 20px;
                color: white;
                background: rgba(0, 0, 0, 0.7);
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 14px;
            "></div>
            
            <div class="lightbox-toolbar" style="
                position: absolute;
                top: 70px;
                right: 20px;
                display: flex;
                gap: 10px;
                z-index: 10;
            ">
                <button class="lightbox-zoom-in" aria-label="Zoom in" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                ">+</button>
                
                <button class="lightbox-zoom-out" aria-label="Zoom out" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                ">-</button>
                
                <button class="lightbox-reset" aria-label="Reset zoom" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                ">↺</button>
                
                <button class="lightbox-download" aria-label="Download image" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                ">⤓</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(lightbox);
}

/**
 * Setup lightbox triggers for all images
 */
function setupLightboxTriggers() {
    // Select all images that should trigger lightbox
    const lightboxImages = document.querySelectorAll('img[data-lightbox], .gallery img, .post-content img:not([data-no-lightbox])');
    
    lightboxImages.forEach((img, index) => {
        // Skip very small images
        if (img.width < 100 && img.height < 100) return;
        
        // Add lightbox attributes
        img.setAttribute('data-lightbox-index', index);
        img.style.cursor = 'zoom-in';
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', 'Click to enlarge image');
        img.setAttribute('tabindex', '0');
        
        // Add click event
        img.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(img);
        });
        
        // Add keyboard event
        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(img);
            }
        });
    });
}

/**
 * Setup gallery groupings for navigation
 */
function setupGalleryGroups() {
    const galleries = document.querySelectorAll('.gallery');
    
    galleries.forEach((gallery, galleryIndex) => {
        const galleryImages = gallery.querySelectorAll('img');
        galleryImages.forEach((img, imgIndex) => {
            img.setAttribute('data-gallery-index', galleryIndex);
            img.setAttribute('data-image-index', imgIndex);
        });
    });
}

// ============================================
// LIGHTBOX OPERATIONS
// ============================================

let currentLightboxIndex = 0;
let currentGalleryIndex = null;
let lightboxImages = [];
let currentZoomLevel = 1;
let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

/**
 * Open lightbox with specific image
 */
function openLightbox(triggerImage) {
    const lightbox = document.querySelector('.lightbox-container');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const caption = lightbox.querySelector('.lightbox-caption');
    const counter = lightbox.querySelector('.lightbox-counter');
    
    // Get all lightbox-enabled images
    lightboxImages = Array.from(document.querySelectorAll('img[data-lightbox], .gallery img, .post-content img:not([data-no-lightbox])'))
        .filter(img => img.width >= 100 || img.height >= 100);
    
    // Find current index
    currentLightboxIndex = lightboxImages.findIndex(img => img === triggerImage);
    if (currentLightboxIndex === -1) currentLightboxIndex = 0;
    
    // Check if image is part of a gallery
    currentGalleryIndex = triggerImage.getAttribute('data-gallery-index');
    
    // Load the image
    loadLightboxImage(lightboxImage, lightboxImages[currentLightboxIndex]);
    
    // Update caption
    const altText = triggerImage.alt || triggerImage.title || '';
    caption.textContent = altText;
    caption.style.display = altText ? 'block' : 'none';
    
    // Update counter
    updateLightboxCounter();
    
    // Reset zoom and position
    resetZoom();
    
    // Show lightbox
    lightbox.style.visibility = 'visible';
    lightbox.style.opacity = '1';
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleLightboxKeyboard);
    
    // Track lightbox open event
    trackLightboxEvent('open', triggerImage.src);
}

/**
 * Load image into lightbox with loading state
 */
function loadLightboxImage(lightboxImage, sourceImage) {
    // Show loading state
    lightboxImage.style.opacity = '0';
    
    // Set src (use high-res version if available)
    const highResSrc = sourceImage.getAttribute('data-highres') || sourceImage.src;
    lightboxImage.src = highResSrc;
    
    // Handle image load
    lightboxImage.onload = () => {
        lightboxImage.style.opacity = '1';
        lightboxImage.style.transform = 'scale(1) translate(0, 0)';
    };
    
    lightboxImage.onerror = () => {
        // Fallback to original src if high-res fails
        if (lightboxImage.src !== sourceImage.src) {
            lightboxImage.src = sourceImage.src;
        }
    };
}

/**
 * Close lightbox
 */
function closeLightbox() {
    const lightbox = document.querySelector('.lightbox-container');
    
    lightbox.style.opacity = '0';
    lightbox.style.visibility = 'hidden';
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove keyboard event listener
    document.removeEventListener('keydown', handleLightboxKeyboard);
    
    // Reset state
    currentZoomLevel = 1;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    
    // Track lightbox close event
    trackLightboxEvent('close');
}

/**
 * Navigate to next image
 */
function nextImage() {
    if (lightboxImages.length <= 1) return;
    
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxImages.length;
    showCurrentImage();
}

/**
 * Navigate to previous image
 */
function prevImage() {
    if (lightboxImages.length <= 1) return;
    
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    showCurrentImage();
}

/**
 * Show current image in lightbox
 */
function showCurrentImage() {
    const lightboxImage = document.querySelector('.lightbox-image');
    const caption = document.querySelector('.lightbox-caption');
    const currentImage = lightboxImages[currentLightboxIndex];
    
    // Load new image
    loadLightboxImage(lightboxImage, currentImage);
    
    // Update caption
    const altText = currentImage.alt || currentImage.title || '';
    caption.textContent = altText;
    caption.style.display = altText ? 'block' : 'none';
    
    // Update counter
    updateLightboxCounter();
    
    // Reset zoom and position
    resetZoom();
    
    // Track navigation event
    trackLightboxEvent('navigate', currentImage.src);
}

/**
 * Update lightbox counter display
 */
function updateLightboxCounter() {
    const counter = document.querySelector('.lightbox-counter');
    if (lightboxImages.length > 1) {
        counter.textContent = `${currentLightboxIndex + 1} / ${lightboxImages.length}`;
        counter.style.display = 'block';
    } else {
        counter.style.display = 'none';
    }
}

// ============================================
// ZOOM AND PAN FUNCTIONALITY
// ============================================

/**
 * Zoom in on image
 */
function zoomIn() {
    if (currentZoomLevel >= 5) return;
    
    currentZoomLevel += 0.5;
    applyZoom();
    trackLightboxEvent('zoom_in', currentZoomLevel);
}

/**
 * Zoom out of image
 */
function zoomOut() {
    if (currentZoomLevel <= 0.5) return;
    
    currentZoomLevel -= 0.5;
    applyZoom();
    trackLightboxEvent('zoom_out', currentZoomLevel);
}

/**
 * Reset zoom and position
 */
function resetZoom() {
    currentZoomLevel = 1;
    translateX = 0;
    translateY = 0;
    applyZoom();
    trackLightboxEvent('zoom_reset');
}

/**
 * Apply current zoom and translation
 */
function applyZoom() {
    const lightboxImage = document.querySelector('.lightbox-image');
    lightboxImage.style.transform = `scale(${currentZoomLevel}) translate(${translateX}px, ${translateY}px)`;
    
    // Show/hide reset button based on zoom level
    const resetButton = document.querySelector('.lightbox-reset');
    if (resetButton) {
        resetButton.style.display = currentZoomLevel !== 1 ? 'block' : 'none';
    }
}

/**
 * Start image dragging
 */
function startDrag(e) {
    if (currentZoomLevel <= 1) return;
    
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    
    const lightboxImage = document.querySelector('.lightbox-image');
    lightboxImage.style.cursor = 'grabbing';
}

/**
 * Drag image
 */
function dragImage(e) {
    if (!isDragging) return;
    
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyZoom();
}

/**
 * End image dragging
 */
function endDrag() {
    isDragging = false;
    const lightboxImage = document.querySelector('.lightbox-image');
    lightboxImage.style.cursor = currentZoomLevel > 1 ? 'grab' : 'zoom-in';
}

// ============================================
// DOWNLOAD FUNCTIONALITY
// ============================================

/**
 * Download current image
 */
function downloadImage() {
    const lightboxImage = document.querySelector('.lightbox-image');
    const currentImage = lightboxImages[currentLightboxIndex];
    
    try {
        // Create download link
        const link = document.createElement('a');
        link.href = currentImage.src;
        link.download = getDownloadFilename(currentImage);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        trackLightboxEvent('download', currentImage.src);
    } catch (error) {
        console.error('Download failed:', error);
        showLightboxNotification('Download failed. Please try again.', 'error');
    }
}

/**
 * Generate download filename
 */
function getDownloadFilename(image) {
    const altText = image.alt || image.title || 'image';
    const cleanName = altText.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    const extension = image.src.split('.').pop().toLowerCase();
    return `${cleanName}.${extension}`;
}

// ============================================
// KEYBOARD AND GESTURE HANDLING
// ============================================

/**
 * Handle keyboard events in lightbox
 */
function handleLightboxKeyboard(e) {
    switch (e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowRight':
            nextImage();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case '+':
        case '=':
            zoomIn();
            break;
        case '-':
            zoomOut();
            break;
        case '0':
            resetZoom();
            break;
        case 'd':
            downloadImage();
            break;
    }
}

/**
 * Handle touch gestures for mobile
 */
function handleTouchGestures() {
    const imageContainer = document.querySelector('.lightbox-image-container');
    if (!imageContainer) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    imageContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        } else if (e.touches.length === 2) {
            // Handle pinch zoom
            e.preventDefault();
        }
    });
    
    imageContainer.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;
            
            // Swipe detection
            if (deltaTime < 300) {
                if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
                    if (deltaX > 0) {
                        prevImage();
                    } else {
                        nextImage();
                    }
                } else if (Math.abs(deltaY) > 100 && currentZoomLevel === 1) {
                    // Quick swipe down to close
                    closeLightbox();
                }
            }
        }
    });
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

/**
 * Setup all lightbox event listeners
 */
function setupLightboxListeners() {
    const lightbox = document.querySelector('.lightbox-container');
    if (!lightbox) return;
    
    // Close button
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    
    // Navigation buttons
    lightbox.querySelector('.lightbox-next').addEventListener('click', nextImage);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', prevImage);
    
    // Zoom controls
    lightbox.querySelector('.lightbox-zoom-in').addEventListener('click', zoomIn);
    lightbox.querySelector('.lightbox-zoom-out').addEventListener('click', zoomOut);
    lightbox.querySelector('.lightbox-reset').addEventListener('click', resetZoom);
    
    // Download button
    lightbox.querySelector('.lightbox-download').addEventListener('click', downloadImage);
    
    // Image dragging
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    lightboxImage.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', dragImage);
    document.addEventListener('mouseup', endDrag);
    
    // Touch gestures
    handleTouchGestures();
    
    // Click outside to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

/**
 * Preload lightbox assets
 */
function preloadLightboxAssets() {
    // Preload close and navigation icons
    const icons = [
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTggNkw2IDE4TTYgNkwxOCAxOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUgMThsLTYtNiA2LTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+',
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOSAxOGw2LTYtNi02IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg=='
    ];
    
    icons.forEach(icon => {
        const img = new Image();
        img.src = icon;
    });
}

/**
 * Lazy load high-resolution images
 */
function lazyLoadHighResImages() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const highResSrc = img.getAttribute('data-highres');
                if (highResSrc && img.src !== highResSrc) {
                    img.src = highResSrc;
                }
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-highres]').forEach(img => {
        observer.observe(img);
    });
}

// ============================================
// ACCESSIBILITY FEATURES
// ============================================

/**
 * Enhance lightbox accessibility
 */
function enhanceAccessibility() {
    const lightbox = document.querySelector('.lightbox-container');
    
    // Add ARIA attributes
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image lightbox');
    
    // Trap focus within lightbox
    lightbox.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = lightbox.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// ============================================
// ANALYTICS AND TRACKING
// ============================================

/**
 * Track lightbox events
 */
function trackLightboxEvent(action, data = null) {
    console.log(`Lightbox ${action}:`, data);
    
    // Implement analytics tracking
    if (typeof gtag === 'function') {
        gtag('event', 'lightbox_interaction', {
            event_action: action,
            event_label: data,
            current_index: currentLightboxIndex,
            total_images: lightboxImages.length,
            zoom_level: currentZoomLevel
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show notification in lightbox
 */
function showLightboxNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `lightbox-notification lightbox-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Check if image is zoomable
 */
function isImageZoomable(img) {
    return img.naturalWidth > img.offsetWidth || img.naturalHeight > img.offsetHeight;
}

/**
 * Get image aspect ratio
 */
function getImageAspectRatio(img) {
    return img.naturalWidth / img.naturalHeight;
}

// ============================================
// EXPORT FOR GLOBAL USAGE
// ============================================

// Make lightbox functions available globally
window.Lightbox = {
    open: openLightbox,
    close: closeLightbox,
    next: nextImage,
    prev: prevImage,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
    reset: resetZoom,
    download: downloadImage
};

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initLightboxSystem();
    setupLightboxListeners();
});