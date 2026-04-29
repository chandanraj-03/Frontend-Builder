// navigation.js - Navigation menu, mobile menu toggle, and routing functionality

import { smoothScrollToSection } from './main.js';

// Navigation state and configuration
const Navigation = {
    isMobileMenuOpen: false,
    currentPage: 'home',
    navigationItems: [],
    config: {
        mobileBreakpoint: 768,
        scrollOffset: 80,
        animationDuration: 300,
        menuTransition: 'transform 0.3s ease-in-out'
    }
};

// Initialize navigation functionality
function initNavigation() {
    console.log('Initializing navigation...');
    
    // Cache navigation elements
    cacheNavigationElements();
    
    // Setup event listeners
    setupNavigationListeners();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Handle initial page state
    handleInitialPageState();
    
    // Setup smooth scrolling for navigation links
    setupSmoothScrolling();
    
    console.log('Navigation initialized successfully');
}

// Cache navigation elements for performance
function cacheNavigationElements() {
    Navigation.elements = {
        mainNav: document.querySelector('.main-nav'),
        mobileToggle: document.querySelector('.mobile-menu-toggle'),
        navLinks: document.querySelectorAll('.nav-link'),
        logo: document.querySelector('.nav-logo'),
        stickyNav: document.querySelector('.sticky-nav'),
        overlay: document.querySelector('.nav-overlay'),
        closeButton: document.querySelector('.nav-close'),
        searchToggle: document.querySelector('.search-toggle'),
        searchForm: document.querySelector('.nav-search-form')
    };
}

// Setup navigation event listeners
function setupNavigationListeners() {
    const { mobileToggle, overlay, closeButton, searchToggle, searchForm } = Navigation.elements;
    
    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Overlay click to close menu
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close button
    if (closeButton) {
        closeButton.addEventListener('click', closeMobileMenu);
    }
    
    // Search toggle
    if (searchToggle && searchForm) {
        searchToggle.addEventListener('click', toggleSearch);
    }
    
    // Window resize handler for responsive behavior
    window.addEventListener('resize', handleNavigationResize);
    
    // Scroll handler for sticky navigation
    window.addEventListener('scroll', handleNavigationScroll);
    
    // Keyboard navigation support
    document.addEventListener('keydown', handleNavigationKeyboard);
}

// Initialize mobile menu functionality
function initMobileMenu() {
    const { mainNav } = Navigation.elements;
    
    if (mainNav) {
        // Set initial state based on screen size
        if (window.innerWidth < Navigation.config.mobileBreakpoint) {
            mainNav.style.transform = 'translateX(-100%)';
            mainNav.style.transition = Navigation.config.menuTransition;
        }
        
        // Add touch events for mobile swipe
        if ('ontouchstart' in window) {
            setupTouchNavigation();
        }
    }
}

// Setup touch navigation for mobile devices
function setupTouchNavigation() {
    const { mainNav, overlay } = Navigation.elements;
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture(touchStartX, touchEndX);
    });
    
    function handleSwipeGesture(startX, endX) {
        const swipeDistance = Math.abs(startX - endX);
        const isLeftSwipe = startX > endX;
        
        if (swipeDistance > 50) {
            if (isLeftSwipe && !Navigation.isMobileMenuOpen && window.innerWidth < Navigation.config.mobileBreakpoint) {
                openMobileMenu();
            } else if (!isLeftSwipe && Navigation.isMobileMenuOpen) {
                closeMobileMenu();
            }
        }
    }
}

// Toggle mobile menu open/close
function toggleMobileMenu() {
    if (Navigation.isMobileMenuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

// Open mobile menu with animation
function openMobileMenu() {
    const { mainNav, overlay } = Navigation.elements;
    
    if (mainNav && overlay) {
        mainNav.style.transform = 'translateX(0)';
        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        Navigation.isMobileMenuOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Focus on first navigation item for accessibility
        const firstNavItem = mainNav.querySelector('a');
        if (firstNavItem) {
            firstNavItem.focus();
        }
    }
}

// Close mobile menu with animation
function closeMobileMenu() {
    const { mainNav, overlay } = Navigation.elements;
    
    if (mainNav && overlay) {
        mainNav.style.transform = 'translateX(-100%)';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
        
        Navigation.isMobileMenuOpen = false;
        document.body.style.overflow = '';
        
        // Return focus to menu toggle
        const { mobileToggle } = Navigation.elements;
        if (mobileToggle) {
            mobileToggle.focus();
        }
    }
}

// Toggle search functionality
function toggleSearch() {
    const { searchForm } = Navigation.elements;
    
    if (searchForm) {
        searchForm.classList.toggle('active');
        
        if (searchForm.classList.contains('active')) {
            const searchInput = searchForm.querySelector('input[type="search"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }
}

// Handle navigation resize events
function handleNavigationResize() {
    const { mainNav, overlay } = Navigation.elements;
    const isMobile = window.innerWidth < Navigation.config.mobileBreakpoint;
    
    if (mainNav) {
        if (isMobile && Navigation.isMobileMenuOpen) {
            mainNav.style.transform = 'translateX(0)';
        } else if (isMobile) {
            mainNav.style.transform = 'translateX(-100%)';
        } else {
            mainNav.style.transform = 'translateX(0)';
            if (overlay) {
                overlay.style.display = 'none';
            }
            Navigation.isMobileMenuOpen = false;
            document.body.style.overflow = '';
        }
    }
}

// Handle navigation scroll events
function handleNavigationScroll() {
    const { stickyNav } = Navigation.elements;
    const scrollY = window.scrollY;
    
    if (stickyNav) {
        if (scrollY > 100) {
            stickyNav.classList.add('scrolled');
        } else {
            stickyNav.classList.remove('scrolled');
        }
    }
    
    // Update active navigation item based on scroll position
    updateActiveNavigationOnScroll();
}

// Update active navigation item based on scroll position
function updateActiveNavigationOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + Navigation.config.scrollOffset;
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.id;
        }
    });
    
    if (currentSection) {
        setActiveNavigationItem(currentSection);
    }
}

// Set active navigation item
function setActiveNavigationItem(sectionId) {
    const { navLinks } = Navigation.elements;
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${sectionId}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    const { navLinks } = Navigation.elements;
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                
                // Close mobile menu if open
                if (Navigation.isMobileMenuOpen) {
                    closeMobileMenu();
                }
                
                // Smooth scroll to section
                smoothScrollToSection(targetId);
                
                // Update active navigation item
                setActiveNavigationItem(targetId);
            }
        });
    });
}

// Handle navigation keyboard events
function handleNavigationKeyboard(e) {
    const { mainNav } = Navigation.elements;
    
    // Escape key closes mobile menu
    if (e.key === 'Escape' && Navigation.isMobileMenuOpen) {
        closeMobileMenu();
        e.preventDefault();
    }
    
    // Tab key navigation within mobile menu
    if (Navigation.isMobileMenuOpen && mainNav) {
        handleMenuKeyboardNavigation(e, mainNav);
    }
}

// Handle keyboard navigation within mobile menu
function handleMenuKeyboardNavigation(e, menu) {
    const focusableElements = menu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
}

// Handle initial page state and routing
function handleInitialPageState() {
    // Check for hash in URL and scroll to section
    const hash = window.location.hash;
    if (hash) {
        const targetId = hash.substring(1);
        setTimeout(() => {
            smoothScrollToSection(targetId);
            setActiveNavigationItem(targetId);
        }, 100);
    }
    
    // Set initial active navigation item
    updateActiveNavigationOnScroll();
}

// Public method to navigate to specific section
export function navigateTo(sectionId) {
    smoothScrollToSection(sectionId);
    setActiveNavigationItem(sectionId);
    
    // Update URL hash without scrolling
    history.pushState(null, null, `#${sectionId}`);
}

// Public method to get current navigation state
export function getNavigationState() {
    return {
        isMobileMenuOpen: Navigation.isMobileMenuOpen,
        currentPage: Navigation.currentPage
    };
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', initNavigation);

// Export navigation functions
export { 
    initNavigation, 
    toggleMobileMenu, 
    closeMobileMenu, 
    navigateTo,
    getNavigationState
};