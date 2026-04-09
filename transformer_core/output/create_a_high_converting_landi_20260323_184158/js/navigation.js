// navigation.js - Navigation menu, mobile menu toggle, and routing functionality
// Handles all navigation-related interactions, mobile responsiveness, and routing

class Navigation {
    constructor() {
        this.nav = null;
        this.mobileMenu = null;
        this.menuToggle = null;
        this.navLinks = [];
        this.isMobileMenuOpen = false;
        this.isSticky = false;
        this.lastScrollPosition = 0;
        this.scrollThreshold = 100;
        this.headerHeight = 0;
        this.currentPage = '';
        this.routes = {};
    }

    // Initialize navigation system
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupStickyNavigation();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupRouting();
        this.updateActiveNavigation();
        
        console.log('Navigation system initialized');
    }

    // Cache DOM elements for better performance
    cacheElements() {
        this.nav = document.querySelector('nav, header');
        this.mobileMenu = document.querySelector('.mobile-menu, .nav-menu');
        this.menuToggle = document.querySelector('.menu-toggle, .hamburger');
        this.navLinks = document.querySelectorAll('nav a, .nav-link');
        this.headerHeight = this.nav ? this.nav.offsetHeight : 0;
        this.currentPage = this.getCurrentPage();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Mobile menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', this.handleClickOutside.bind(this));

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        // Window resize handling
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // Setup sticky navigation with scroll effects
    setupStickyNavigation() {
        if (!this.nav) return;

        const updateStickyState = () => {
            const scrollPosition = window.scrollY;
            
            // Add/remove sticky class based on scroll position
            if (scrollPosition > this.scrollThreshold) {
                if (!this.isSticky) {
                    this.nav.classList.add('sticky');
                    this.isSticky = true;
                    this.animateStickyTransition();
                }
            } else {
                if (this.isSticky) {
                    this.nav.classList.remove('sticky');
                    this.isSticky = false;
                }
            }

            // Add/remove scroll-up class for hide/show effect
            if (scrollPosition > this.lastScrollPosition && scrollPosition > this.headerHeight) {
                this.nav.classList.add('nav-hide');
            } else {
                this.nav.classList.remove('nav-hide');
            }

            this.lastScrollPosition = scrollPosition;
        };

        // Throttle scroll events for performance
        const throttledUpdate = this.throttle(updateStickyState, 100);
        window.addEventListener('scroll', throttledUpdate.bind(this));
    }

    // Mobile menu functionality
    setupMobileMenu() {
        if (!this.mobileMenu || !this.menuToggle) return;

        // Add animation classes
        this.mobileMenu.classList.add('mobile-menu-transition');
        
        // Handle submenu toggles if they exist
        const submenuToggles = this.mobileMenu.querySelectorAll('.has-submenu');
        submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const submenu = toggle.querySelector('.submenu');
                if (submenu) {
                    this.toggleSubmenu(submenu);
                }
            });
        });
    }

    // Toggle mobile menu open/close
    toggleMobileMenu() {
        if (!this.mobileMenu || !this.menuToggle) return;

        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        
        if (this.isMobileMenuOpen) {
            this.openMobileMenu();
        } else {
            this.closeMobileMenu();
        }
    }

    // Open mobile menu with animation
    openMobileMenu() {
        this.mobileMenu.classList.add('active');
        this.menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate menu items sequentially
        const menuItems = this.mobileMenu.querySelectorAll('li');
        menuItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('slide-in');
        });
    }

    // Close mobile menu with animation
    closeMobileMenu() {
        this.mobileMenu.classList.remove('active');
        this.menuToggle.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset animations
        const menuItems = this.mobileMenu.querySelectorAll('li');
        menuItems.forEach(item => {
            item.classList.remove('slide-in');
            item.style.animationDelay = '';
        });
        
        this.isMobileMenuOpen = false;
    }

    // Toggle submenu visibility
    toggleSubmenu(submenu) {
        const isExpanded = submenu.classList.contains('expanded');
        
        if (isExpanded) {
            this.collapseSubmenu(submenu);
        } else {
            this.expandSubmenu(submenu);
        }
    }

    // Expand submenu with animation
    expandSubmenu(submenu) {
        submenu.style.height = '0';
        submenu.style.overflow = 'hidden';
        submenu.classList.add('expanded');
        
        // Calculate actual height
        const height = submenu.scrollHeight;
        
        // Animate height expansion
        requestAnimationFrame(() => {
            submenu.style.height = `${height}px`;
            
            // Reset height after animation
            setTimeout(() => {
                submenu.style.height = '';
                submenu.style.overflow = '';
            }, 300);
        });
    }

    // Collapse submenu with animation
    collapseSubmenu(submenu) {
        const height = submenu.scrollHeight;
        submenu.style.height = `${height}px`;
        submenu.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
            submenu.style.height = '0';
            submenu.classList.remove('expanded');
            
            // Reset after animation
            setTimeout(() => {
                submenu.style.height = '';
                submenu.style.overflow = '';
            }, 300);
        });
    }

    // Setup smooth scrolling for anchor links
    setupSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;
                
                e.preventDefault();
                this.scrollToSection(href.substring(1));
            });
        });
    }

    // Scroll to specific section with offset
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const offset = this.calculateScrollOffset();
        const targetPosition = section.offsetTop - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Update URL hash without scrolling
        history.pushState(null, null, `#${sectionId}`);
    }

    // Calculate scroll offset based on header state
    calculateScrollOffset() {
        let offset = this.headerHeight + 20; // Base offset
        
        // Adjust for sticky header
        if (this.isSticky) {
            offset = this.nav.offsetHeight + 20;
        }
        
        // Adjust for mobile menu
        if (window.innerWidth < 768 && this.isMobileMenuOpen) {
            offset += 50; // Extra offset for mobile
        }
        
        return offset;
    }

    // Setup client-side routing
    setupRouting() {
        // Define routes for multi-page navigation
        this.routes = {
            '/': 'home',
            '/features': 'features',
            '/pricing': 'pricing',
            '/testimonials': 'testimonials',
            '/faq': 'faq',
            '/contact': 'contact'
        };

        // Handle browser navigation
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        // Handle internal link clicks
        document.addEventListener('click', this.handleInternalLink.bind(this));
    }

    // Handle internal link clicks for SPA-like navigation
    handleInternalLink(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        
        // Check if it's an internal route
        if (href && this.routes[href]) {
            e.preventDefault();
            this.navigateTo(href);
        }
    }

    // Navigate to specific route
    navigateTo(route) {
        if (!this.routes[route]) return;

        // Update current page
        this.currentPage = this.routes[route];
        
        // Update URL
        history.pushState({ page: this.currentPage }, '', route);
        
        // Load page content
        this.loadPageContent(route);
        
        // Update navigation state
        this.updateActiveNavigation();
        
        // Close mobile menu if open
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    // Load page content (simulated for multi-page app)
    loadPageContent(route) {
        // In a real application, this would fetch the page content
        // For this example, we'll just scroll to top and update active nav
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Dispatch custom event for other components to react
        const event = new CustomEvent('pageChanged', {
            detail: { page: this.routes[route], route: route }
        });
        document.dispatchEvent(event);
    }

    // Handle browser back/forward navigation
    handlePopState() {
        const route = window.location.pathname;
        if (this.routes[route]) {
            this.currentPage = this.routes[route];
            this.updateActiveNavigation();
            this.loadPageContent(route);
        }
    }

    // Update active navigation link based on current page/section
    updateActiveNavigation() {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.parentElement.classList.remove('active');
        });

        // Add active class to current page link
        const currentLink = document.querySelector(`a[href="${window.location.pathname}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
            currentLink.parentElement.classList.add('active');
        }

        // Also update based on scroll position for anchor links
        this.updateActiveSection();
    }

    // Update active section based on scroll position
    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + this.calculateScrollOffset();
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            
            if (scrollPosition >= top && scrollPosition < bottom) {
                // Update anchor links
                const correspondingLink = document.querySelector(`a[href="#${id}"]`);
                if (correspondingLink) {
                    // Remove active from all anchor links
                    this.navLinks.forEach(link => {
                        if (link.getAttribute('href').startsWith('#')) {
                            link.classList.remove('active');
                        }
                    });
                    
                    // Add active to current section link
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    // Handle click outside mobile menu
    handleClickOutside(e) {
        if (!this.isMobileMenuOpen) return;
        
        const isClickInsideMenu = this.mobileMenu.contains(e.target);
        const isClickOnToggle = this.menuToggle.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnToggle) {
            this.closeMobileMenu();
        }
    }

    // Handle keyboard navigation
    handleKeyboardNavigation(e) {
        // Close mobile menu on Escape
        if (e.key === 'Escape' && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Tab navigation trapping for mobile menu
        if (e.key === 'Tab' && this.isMobileMenuOpen) {
            this.handleTabNavigation(e);
        }
    }

    // Handle tab navigation within mobile menu
    handleTabNavigation(e) {
        const focusableElements = this.mobileMenu.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If tabbing forward from last element, go to first
        if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
        
        // If shift+tabbing from first element, go to last
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
    }

    // Handle window resize
    handleResize() {
        this.debounce(() => {
            this.headerHeight = this.nav ? this.nav.offsetHeight : 0;
            
            // Close mobile menu on resize to desktop
            if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Update mobile menu layout
            this.updateMobileMenuLayout();
        }, 250)();
    }

    // Update mobile menu layout based on screen size
    updateMobileMenuLayout() {
        if (!this.mobileMenu) return;
        
        if (window.innerWidth < 768) {
            // Mobile layout adjustments
            this.mobileMenu.classList.add('mobile-layout');
        } else {
            // Desktop layout adjustments
            this.mobileMenu.classList.remove('mobile-layout');
        }
    }

    // Animate sticky transition
    animateStickyTransition() {
        if (!this.nav) return;
        
        this.nav.style.transition = 'all 0.3s ease';
        
        // Add shadow for better visibility
        setTimeout(() => {
            this.nav.classList.add('nav-shadow');
        }, 50);
    }

    // Get current page from URL
    getCurrentPage() {
        const path = window.location.pathname;
        return this.routes[path] || 'home';
    }

    // Utility: Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Utility: Debounce function for resize events
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
    getCurrentRoute() {
        return this.currentPage;
    }
    
    navigateToSection(sectionId) {
        this.scrollToSection(sectionId);
    }
    
    isMobile() {
        return window.innerWidth < 768;
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new Navigation();
    navigation.init();
    
    // Make navigation available globally if needed
    window.appNavigation = navigation;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}