// js/main.js - Core application logic, initialization, and shared utilities
// Handles application bootstrapping, utility functions, and core interactive behaviors

import { debounce, throttle } from './utils/performance.js';
import { animateElement, fadeIn, slideToggle } from './utils/animations.js';
import { formatDate, estimateReadingTime, truncateText } from './utils/formatting.js';

class BlogApp {
    constructor() {
        this.components = new Map();
        this.isInitialized = false;
        this.currentPage = this.detectCurrentPage();
        this.init();
    }

    // Initialize the application
    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.initializeComponents();
        this.setupServiceWorker();
        this.setupAnalytics();
        
        this.isInitialized = true;
        console.log('Blog application initialized');
    }

    // Detect current page type for context-aware functionality
    detectCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') return 'homepage';
        if (path.includes('/post/') || path.includes('/article/')) return 'post';
        if (path.includes('/category/')) return 'category';
        if (path.includes('/tag/')) return 'tag';
        if (path.includes('/author/')) return 'author';
        if (path.includes('/search/')) return 'search';
        if (path.includes('/about/')) return 'about';
        if (path.includes('/contact/')) return 'contact';
        return 'unknown';
    }

    // Set up global event listeners
    setupEventListeners() {
        // Debounced resize handler
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));

        // Scroll events with throttling
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 100));

        // Handle clicks on dynamically loaded content
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
    }

    // Initialize components based on current page
    initializeComponents() {
        const componentsToInitialize = this.getComponentsForPage();
        
        componentsToInitialize.forEach(componentName => {
            try {
                this.initializeComponent(componentName);
            } catch (error) {
                console.warn(`Failed to initialize ${componentName}:`, error);
            }
        });
    }

    // Get components relevant to current page
    getComponentsForPage() {
        const baseComponents = [
            'navigation_menu', 'search_bar', 'footer', 'home_link'
        ];

        switch (this.currentPage) {
            case 'homepage':
                return [...baseComponents, 'hero_section', 'featured_posts_grid', 
                        'recent_posts_section', 'newsletter_signup_form'];
            case 'post':
                return [...baseComponents, 'article_content', 'reading_progress_bar',
                        'reading_time_indicator', 'dynamic_table_of_contents',
                        'syntax_highlighting', 'share_buttons', 'author_bio',
                        'related_posts', 'comments_section', 'image_lightbox'];
            case 'category':
                return [...baseComponents, 'category_navigation', 'posts_by_category',
                        'category_filter', 'pagination'];
            case 'tag':
                return [...baseComponents, 'tag_filter', 'posts_by_tag', 'pagination'];
            case 'author':
                return [...baseComponents, 'author_bio', 'author_posts_list', 
                        'author_social_links', 'pagination'];
            case 'search':
                return [...baseComponents, 'search_bar_with_autocomplete',
                        'search_results_list', 'sort_options', 'pagination'];
            case 'about':
                return [...baseComponents, 'about_content', 'team_members',
                        'contact_information', 'social_media_links'];
            case 'contact':
                return [...baseComponents, 'contact_form', 'contact_information',
                        'social_media_links'];
            default:
                return baseComponents;
        }
    }

    // Component initialization handler
    initializeComponent(componentName) {
        if (this.components.has(componentName)) return;

        const element = document.querySelector(`[data-component="${componentName}"]`);
        if (!element) return;

        switch (componentName) {
            case 'navigation_menu':
                this.initNavigationMenu(element);
                break;
            case 'search_bar':
                this.initSearchBar(element);
                break;
            case 'hero_section':
                this.initHeroSection(element);
                break;
            // Additional component initializations would follow this pattern
            default:
                console.log(`Component ${componentName} found but no specific initialization defined`);
        }

        this.components.set(componentName, element);
    }

    // Navigation menu initialization
    initNavigationMenu(navElement) {
        const toggleBtn = navElement.querySelector('.menu-toggle');
        const menu = navElement.querySelector('.nav-menu');
        
        if (toggleBtn && menu) {
            toggleBtn.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggleBtn.classList.toggle('active');
                slideToggle(menu, 300);
            });
        }

        // Handle submenu toggles
        navElement.querySelectorAll('.has-submenu').forEach(item => {
            item.addEventListener('click', (e) => {
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    const submenu = item.querySelector('.submenu');
                    if (submenu) slideToggle(submenu, 200);
                }
            });
        });
    }

    // Search bar initialization
    initSearchBar(searchElement) {
        const searchInput = searchElement.querySelector('input[type="search"]');
        const searchBtn = searchElement.querySelector('button');
        
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchElement.classList.add('focused');
            });
            
            searchInput.addEventListener('blur', () => {
                searchElement.classList.remove('focused');
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSearch(searchInput.value);
            });
        }
    }

    // Hero section animations
    initHeroSection(heroElement) {
        // Animate hero elements on page load
        setTimeout(() => {
            const title = heroElement.querySelector('h1');
            const subtitle = heroElement.querySelector('p');
            const cta = heroElement.querySelector('.cta-button');
            
            if (title) fadeIn(title, 800);
            if (subtitle) fadeIn(subtitle, 1000);
            if (cta) fadeIn(cta, 1200);
        }, 300);
    }

    // Handle window resize
    handleResize() {
        this.components.forEach((element, componentName) => {
            // Add responsive behavior for components if needed
            if (componentName === 'navigation_menu') {
                const menu = element.querySelector('.nav-menu');
                if (window.innerWidth >= 768) {
                    menu.style.display = '';
                }
            }
        });
    }

    // Handle scroll events
    handleScroll() {
        // Update reading progress bar if on post page
        if (this.currentPage === 'post' && this.components.has('reading_progress_bar')) {
            this.updateReadingProgress();
        }

        // Handle sticky navigation
        if (this.components.has('navigation_menu')) {
            this.handleStickyNavigation();
        }
    }

    // Update reading progress indicator
    updateReadingProgress() {
        const article = document.querySelector('article');
        const progressBar = this.components.get('reading_progress_bar');
        
        if (article && progressBar) {
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.scrollY;
            const progress = (scrollTop / (articleHeight - windowHeight)) * 100;
            
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    }

    // Handle sticky navigation
    handleStickyNavigation() {
        const nav = this.components.get('navigation_menu');
        const scrollTop = window.scrollY;
        
        if (scrollTop > 100) {
            nav.classList.add('sticky');
        } else {
            nav.classList.remove('sticky');
        }
    }

    // Global click handler
    handleGlobalClick(e) {
        // Close dropdowns when clicking outside
        if (!e.target.closest('.dropdown') && !e.target.closest('.menu-toggle')) {
            document.querySelectorAll('.dropdown.active, .nav-menu.active').forEach(item => {
                item.classList.remove('active');
            });
        }

        // Handle smooth scrolling for anchor links
        if (e.target.hash && e.target.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            this.scrollToElement(e.target.hash);
        }
    }

    // Keyboard navigation handler
    handleKeydown(e) {
        // Escape key closes modals and menus
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active, .dropdown.active').forEach(item => {
                item.classList.remove('active');
            });
        }

        // Tab key handling for accessibility
        if (e.key === 'Tab') {
            this.handleTabNavigation(e);
        }
    }

    // Handle tab navigation for accessibility
    handleTabNavigation(e) {
        // Implement focus trapping for modals if needed
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const focusableElements = activeModal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    }

    // Smooth scroll to element
    scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            const offsetTop = element.offsetTop - 80; // Account for fixed header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // Handle search functionality
    handleSearch(query) {
        if (query.trim()) {
            window.location.href = `/search/?q=${encodeURIComponent(query)}`;
        }
    }

    // Service worker registration for PWA
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // Analytics setup
    setupAnalytics() {
        // Placeholder for analytics initialization
        console.log('Analytics setup complete');
    }

    // Utility method to get component instance
    getComponent(name) {
        return this.components.get(name);
    }

    // Utility method to register new components
    registerComponent(name, element) {
        this.components.set(name, element);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.BlogApp = new BlogApp();
});

// Export utilities for use in other modules
export { 
    debounce, 
    throttle, 
    animateElement, 
    fadeIn, 
    slideToggle,
    formatDate,
    estimateReadingTime,
    truncateText
};