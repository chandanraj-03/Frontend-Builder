// main.js - Core application logic, initialization, and shared utilities
// Handles application lifecycle, shared functionality, and smooth transitions

class App {
    constructor() {
        this.components = new Map();
        this.isReducedMotion = false;
        this.init();
    }

    // Initialize the application
    init() {
        this.detectReducedMotionPreference();
        this.initializeComponents();
        this.setupEventListeners();
        this.setupSmoothTransitions();
    }

    // Detect user's reduced motion preference
    detectReducedMotionPreference() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.isReducedMotion = mediaQuery.matches;
        
        mediaQuery.addEventListener('change', (e) => {
            this.isReducedMotion = e.matches;
            this.updateMotionPreferences();
        });
    }

    // Initialize all components
    initializeComponents() {
        const componentList = [
            'projects_showcase',
            'accessibility_controls',
            'reduced_motion_toggle',
            'about_section',
            'hero_section',
            'contact_section',
            'navigation_menu'
        ];

        componentList.forEach(componentName => {
            if (this.isComponentAvailable(componentName)) {
                this.components.set(componentName, this.createComponentInstance(componentName));
            }
        });
    }

    // Check if component HTML exists
    isComponentAvailable(name) {
        return document.querySelector(`[data-component="${name}"]`) !== null;
    }

    // Create component instance based on name
    createComponentInstance(name) {
        const componentMap = {
            'projects_showcase': ProjectsShowcase,
            'accessibility_controls': AccessibilityControls,
            'reduced_motion_toggle': ReducedMotionToggle,
            'about_section': AboutSection,
            'hero_section': HeroSection,
            'contact_section': ContactSection,
            'navigation_menu': NavigationMenu
        };

        const ComponentClass = componentMap[name];
        return ComponentClass ? new ComponentClass() : null;
    }

    // Setup global event listeners
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.throttle(this.handleResize.bind(this), 250));

        // Handle page load
        window.addEventListener('load', this.handlePageLoad.bind(this));

        // Handle before unload
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    // Setup smooth transitions between sections
    setupSmoothTransitions() {
        // CSS class for smooth transitions
        document.documentElement.classList.add('smooth-transitions');

        // Intersection Observer for section animations
        this.setupIntersectionObserver();
    }

    // Intersection Observer for animating sections on scroll
    setupIntersectionObserver() {
        const sections = document.querySelectorAll('section');
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isReducedMotion) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Update motion preferences across all components
    updateMotionPreferences() {
        document.documentElement.classList.toggle('reduced-motion', this.isReducedMotion);
        
        // Notify all components about the change
        this.components.forEach(component => {
            if (component && typeof component.onMotionPreferenceChange === 'function') {
                component.onMotionPreferenceChange(this.isReducedMotion);
            }
        });
    }

    // Handle window resize with throttling
    handleResize() {
        this.components.forEach(component => {
            if (component && typeof component.onResize === 'function') {
                component.onResize();
            }
        });
    }

    // Handle page load completion
    handlePageLoad() {
        document.body.classList.add('loaded');
        
        // Initialize components that require full page load
        this.components.forEach(component => {
            if (component && typeof component.onPageLoad === 'function') {
                component.onPageLoad();
            }
        });
    }

    // Handle before unload
    handleBeforeUnload() {
        // Clean up any pending operations
        this.components.forEach(component => {
            if (component && typeof component.onBeforeUnload === 'function') {
                component.onBeforeUnload();
            }
        });
    }

    // Utility function to throttle frequent calls
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

    // Public method to toggle reduced motion
    toggleReducedMotion() {
        this.isReducedMotion = !this.isReducedMotion;
        this.updateMotionPreferences();
        
        // Save preference to localStorage
        localStorage.setItem('reducedMotion', this.isReducedMotion.toString());
    }

    // Public method to get current motion preference
    getMotionPreference() {
        return this.isReducedMotion;
    }

    // Utility function for smooth scrolling
    smoothScrollTo(targetElement, duration = 500) {
        if (this.isReducedMotion) {
            targetElement.scrollIntoView({ behavior: 'auto' });
            return;
        }

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }
}

// Base component class for all components to extend
class BaseComponent {
    constructor() {
        this.element = document.querySelector(`[data-component="${this.constructor.name.toLowerCase()}"]`);
        this.initialized = false;
    }

    init() {
        if (this.element && !this.initialized) {
            this.setup();
            this.initialized = true;
        }
    }

    setup() {
        // To be implemented by child components
    }

    onMotionPreferenceChange(reducedMotion) {
        // To be implemented by child components if needed
    }

    onResize() {
        // To be implemented by child components if needed
    }

    onPageLoad() {
        // To be implemented by child components if needed
    }

    onBeforeUnload() {
        // To be implemented by child components if needed
    }
}

// Component classes (stubs - to be implemented in respective files)
class ProjectsShowcase extends BaseComponent {}
class AccessibilityControls extends BaseComponent {}
class ReducedMotionToggle extends BaseComponent {}
class AboutSection extends BaseComponent {}
class HeroSection extends BaseComponent {}
class ContactSection extends BaseComponent {}
class NavigationMenu extends BaseComponent {}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});