// navigation.js - Navigation menu, mobile menu toggle, and routing functionality
// Handles responsive navigation, smooth scrolling, mobile menu interactions, and page routing

class Navigation {
    constructor() {
        this.isMobileMenuOpen = false;
        this.currentSection = '';
        this.isReducedMotion = false;
        this.scrollThreshold = 100;
        this.init();
    }

    // Initialize navigation functionality
    init() {
        this.checkMotionPreference();
        this.setupNavigationElements();
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupStyles();
        this.setupScrollHandler();
        this.setupRouting();
        this.updateActiveSection();
    }

    // Check reduced motion preference
    checkMotionPreference() {
        this.isReducedMotion = document.documentElement.classList.contains('reduced-motion');
        
        // Listen for motion preference changes
        document.addEventListener('reducedMotionChanged', (e) => {
            this.isReducedMotion = e.detail.reducedMotion;
            this.updateNavigationAnimations();
        });
    }

    // Setup navigation elements
    setupNavigationElements() {
        this.nav = document.querySelector('nav, [role="navigation"]');
        this.navList = this.nav?.querySelector('ul, [role="menu"]');
        this.mobileMenuButton = document.getElementById('mobile-menu-button');
        this.navLinks = document.querySelectorAll('nav a[href^="#"], [data-nav-link]');
        this.backToTopButton = document.getElementById('back-to-top');
        this.skipLink = document.getElementById('skip-link');
    }

    // Setup event listeners
    setupEventListeners() {
        // Mobile menu toggle
        if (this.mobileMenuButton) {
            this.mobileMenuButton.addEventListener('click', () => this.toggleMobileMenu());
            this.mobileMenuButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMobileMenu();
                }
            });
        }

        // Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavLinkClick(e));
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleNavLinkClick(e);
                }
            });
        });

        // Back to top button
        if (this.backToTopButton) {
            this.backToTopButton.addEventListener('click', () => this.scrollToTop());
            this.backToTopButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.scrollToTop();
                }
            });
        }

        // Skip link
        if (this.skipLink) {
            this.skipLink.addEventListener('click', (e) => this.handleSkipLinkClick(e));
        }

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Escape key to close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Click outside to close mobile menu
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && !this.nav.contains(e.target) && 
                e.target !== this.mobileMenuButton) {
                this.closeMobileMenu();
            }
        });
    }

    // Setup accessibility features
    setupAccessibility() {
        // Mobile menu button ARIA
        if (this.mobileMenuButton) {
            this.mobileMenuButton.setAttribute('aria-expanded', 'false');
            this.mobileMenuButton.setAttribute('aria-controls', 'nav-menu');
            this.mobileMenuButton.setAttribute('aria-label', 'Toggle navigation menu');
        }

        // Navigation menu ARIA
        if (this.navList) {
            this.navList.setAttribute('role', 'menu');
            this.navList.setAttribute('aria-label', 'Main navigation');
            
            // Set ARIA for nav links
            this.navLinks.forEach(link => {
                link.setAttribute('role', 'menuitem');
            });
        }

        // Back to top button ARIA
        if (this.backToTopButton) {
            this.backToTopButton.setAttribute('aria-label', 'Scroll to top of page');
        }

        // Skip link ARIA
        if (this.skipLink) {
            this.skipLink.setAttribute('aria-label', 'Skip to main content');
        }
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    // Open mobile menu with animation
    openMobileMenu() {
        if (!this.navList) return;
        
        this.isMobileMenuOpen = true;
        
        // Update ARIA attributes
        this.mobileMenuButton?.setAttribute('aria-expanded', 'true');
        this.navList.setAttribute('aria-hidden', 'false');
        
        // Add open class
        this.navList.classList.add('nav-open');
        document.body.classList.add('nav-open');
        
        // Animate menu
        if (!this.isReducedMotion) {
            this.navList.style.transform = 'translateX(0)';
            this.navList.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Animate menu items with stagger
            const menuItems = this.navList.querySelectorAll('li');
            menuItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(-20px)';
                item.style.transition = `opacity 0.3s ease ${index * 0.1}s, transform 0.3s ease ${index * 0.1}s`;
                
                requestAnimationFrame(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                });
            });
        }
        
        // Trap focus in mobile menu
        this.trapFocus();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('mobileMenuOpened'));
    }

    // Close mobile menu with animation
    closeMobileMenu() {
        if (!this.navList) return;
        
        this.isMobileMenuOpen = false;
        
        // Update ARIA attributes
        this.mobileMenuButton?.setAttribute('aria-expanded', 'false');
        this.navList.setAttribute('aria-hidden', 'true');
        
        // Remove open class
        this.navList.classList.remove('nav-open');
        document.body.classList.remove('nav-open');
        
        // Animate menu close
        if (!this.isReducedMotion) {
            this.navList.style.transform = 'translateX(-100%)';
            
            // Reset menu items
            const menuItems = this.navList.querySelectorAll('li');
            menuItems.forEach(item => {
                item.style.opacity = '';
                item.style.transform = '';
                item.style.transition = '';
            });
        }
        
        // Release focus trap
        this.releaseFocusTrap();
        
        // Focus on menu button
        this.mobileMenuButton?.focus();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('mobileMenuClosed'));
    }

    // Handle navigation link clicks
    handleNavLinkClick(event) {
        event.preventDefault();
        
        const link = event.currentTarget;
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            // Close mobile menu if open
            if (this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Scroll to section
            this.scrollToSection(targetSection);
            
            // Update active link
            this.setActiveLink(link);
            
            // Update URL hash
            this.updateUrlHash(targetId);
            
            // Log navigation event
            this.logNavigation(targetId);
        }
    }

    // Scroll to section with smooth animation
    scrollToSection(section) {
        const headerHeight = this.getHeaderHeight();
        const sectionTop = section.offsetTop - headerHeight - 20; // Add some padding
        
        window.scrollTo({
            top: sectionTop,
            behavior: this.isReducedMotion ? 'auto' : 'smooth'
        });
    }

    // Scroll to top of page
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: this.isReducedMotion ? 'auto' : 'smooth'
        });
        
        // Update URL hash
        this.updateUrlHash('');
        
        // Reset active link
        this.resetActiveLink();
        
        // Log navigation event
        this.logNavigation('top');
    }

    // Handle skip link click
    handleSkipLinkClick(event) {
        event.preventDefault();
        
        const mainContent = document.getElementById('main-content') || 
                           document.querySelector('main') || 
                           document.querySelector('.main-content');
        
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            
            // Scroll to main content
            this.scrollToSection(mainContent);
        }
    }

    // Setup scroll handler for sticky navigation and active section
    setupScrollHandler() {
        let ticking = false;
        
        const updateOnScroll = () => {
            this.updateStickyNavigation();
            this.updateActiveSection();
            this.updateBackToTopButton();
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateOnScroll);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Update sticky navigation state
    updateStickyNavigation() {
        const scrollY = window.scrollY;
        const nav = this.nav;
        
        if (scrollY > this.scrollThreshold) {
            nav?.classList.add('nav-sticky');
            document.body.classList.add('nav-sticky-active');
        } else {
            nav?.classList.remove('nav-sticky');
            document.body.classList.remove('nav-sticky-active');
        }
    }

    // Update active section based on scroll position
    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 100; // Offset for better detection
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            this.updateActiveNavLink(currentSection);
        }
    }

    // Update active navigation link
    updateActiveNavLink(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
            
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    // Set active link manually
    setActiveLink(link) {
        this.navLinks.forEach(navLink => {
            navLink.classList.remove('active');
            navLink.setAttribute('aria-current', 'false');
        });
        
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
    }

    // Reset active link
    resetActiveLink() {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-current', 'false');
        });
    }

    // Update back to top button visibility
    updateBackToTopButton() {
        if (!this.backToTopButton) return;
        
        const scrollY = window.scrollY;
        
        if (scrollY > 300) {
            this.backToTopButton.classList.add('visible');
            this.backToTopButton.setAttribute('aria-hidden', 'false');
        } else {
            this.backToTopButton.classList.remove('visible');
            this.backToTopButton.setAttribute('aria-hidden', 'true');
        }
    }

    // Setup routing for multi-page navigation
    setupRouting() {
        // Handle initial page load
        this.handlePageLoad();
        
        // Handle browser navigation (back/forward)
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
    }

    // Handle page load routing
    handlePageLoad() {
        const hash = window.location.hash.substring(1);
        
        if (hash) {
            const targetSection = document.getElementById(hash);
            if (targetSection) {
                setTimeout(() => {
                    this.scrollToSection(targetSection);
                    this.setActiveLink(document.querySelector(`a[href="#${hash}"]`));
                }, 100);
            }
        }
    }

    // Handle route changes
    handleRouteChange() {
        const hash = window.location.hash.substring(1);
        this.updateActiveNavLink(hash);
    }

    // Update URL hash
    updateUrlHash(hash) {
        if (history.pushState) {
            const newUrl = hash ? `#${hash}` : window.location.pathname + window.location.search;
            history.pushState(null, null, newUrl);
        }
    }

    // Trap focus in mobile menu
    trapFocus() {
        const focusableElements = this.navList?.querySelectorAll(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        this.navList.addEventListener('keydown', this.handleTrapFocus.bind(this, firstElement, lastElement));
        
        // Focus first element
        firstElement.focus();
    }

    // Handle focus trapping
    handleTrapFocus(firstElement, lastElement, event) {
        if (event.key !== 'Tab') return;
        
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Release focus trap
    releaseFocusTrap() {
        this.navList?.removeEventListener('keydown', this.handleTrapFocus);
    }

    // Handle window resize
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Update header height
        this.updateHeaderHeight();
    }

    // Get header height for scroll calculations
    getHeaderHeight() {
        const header = document.querySelector('header');
        return header ? header.offsetHeight : 0;
    }

    // Update header height CSS variable
    updateHeaderHeight() {
        const headerHeight = this.getHeaderHeight();
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }

    // Update navigation animations based on motion preference
    updateNavigationAnimations() {
        if (this.isReducedMotion) {
            // Remove transitions
            if (this.navList) {
                this.navList.style.transition = 'none';
                const menuItems = this.navList.querySelectorAll('li');
                menuItems.forEach(item => {
                    item.style.transition = 'none';
                });
            }
        }
    }

    // Setup necessary styles
    setupStyles() {
        const styleId = 'navigation-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .nav-sticky {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: var(--nav-bg, rgba(255, 255, 255, 0.95));
                backdrop-filter: blur(10px);
                z-index: 1000;
                transition: all 0.3s ease;
            }
            
            .back-to-top {
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
            }
            
            .nav-open {
                transform: translateX(0) !important;
            }
            
            .reduced-motion .nav-sticky,
            .reduced-motion .back-to-top,
            .reduced-motion .nav-open {
                transition: none !important;
            }
            
            .nav-link.active {
                color: var(--accent-color, #007bff);
                font-weight: bold;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--accent-color, #007bff);
                color: white;
                padding: 8px;
                text-decoration: none;
                z-index: 1001;
                transition: top 0.3s ease;
            }
            
            .skip-link:focus {
                top: 6px;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Log navigation events
    logNavigation(sectionId) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'navigation', {
                'event_category': 'engagement',
                'event_label': sectionId || 'top'
            });
        }
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}