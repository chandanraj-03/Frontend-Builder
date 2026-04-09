// animations.js - Animation functionality for single-page portfolio

// Animation configuration
const AnimationConfig = {
    durations: {
        fadeIn: 600,
        slideUp: 500,
        scale: 300,
        staggerDelay: 100
    },
    easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    thresholds: {
        intersection: 0.15,
        scrollTrigger: 0.3
    }
};

// Animation manager class
class AnimationManager {
    constructor() {
        this.animatedElements = new Map();
        this.intersectionObservers = new Map();
        this.scrollAnimations = [];
        this.isReducedMotion = this.checkReducedMotion();
    }

    // Initialize all animations
    init() {
        if (this.isReducedMotion) {
            console.log('Reduced motion preference detected, limiting animations');
            return;
        }

        this.setupScrollAnimations();
        this.setupIntersectionAnimations();
        this.setupHoverAnimations();
        this.setupPageLoadAnimations();
        this.setupNavigationAnimations();
    }

    // Check if user prefers reduced motion
    checkReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Setup scroll-based animations
    setupScrollAnimations() {
        // Parallax effect for hero section
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
            window.addEventListener('scroll', () => {
                if (this.isReducedMotion) return;
                
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                heroSection.style.transform = `translate3d(0, ${rate}px, 0)`;
            });
        }

        // Fade in elements on scroll
        this.setupScrollFadeAnimations();
    }

    // Setup fade animations triggered by scroll
    setupScrollFadeAnimations() {
        const fadeElements = document.querySelectorAll('.fade-on-scroll');
        
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateFadeIn(entry.target);
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: AnimationConfig.thresholds.scrollTrigger,
            rootMargin: '0px 0px -50px 0px'
        });

        fadeElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.default}, 
                                      transform ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.default}`;
            fadeObserver.observe(element);
        });

        this.intersectionObservers.set('fade', fadeObserver);
    }

    // Setup intersection observer animations
    setupIntersectionAnimations() {
        const sections = document.querySelectorAll('section');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSectionIn(entry.target);
                }
            });
        }, {
            threshold: AnimationConfig.thresholds.intersection
        });

        sections.forEach(section => {
            sectionObserver.observe(section);
        });

        this.intersectionObservers.set('sections', sectionObserver);
    }

    // Animate section when it comes into view
    animateSectionIn(section) {
        if (this.isReducedMotion) {
            section.classList.add('visible');
            return;
        }

        const children = section.querySelectorAll(':scope > *');
        
        // Add staggered animation to children
        children.forEach((child, index) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                child.style.transition = `opacity ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.default}, 
                                        transform ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.default}`;
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
            }, index * AnimationConfig.durations.staggerDelay);
        });

        section.classList.add('animated');
    }

    // Setup hover animations
    setupHoverAnimations() {
        // Project card hover animations
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            // Store original transform
            const originalTransform = card.style.transform || '';
            
            card.addEventListener('mouseenter', (e) => {
                if (this.isReducedMotion) return;
                
                this.animateCardHover(e.currentTarget);
            });
            
            card.addEventListener('mouseleave', (e) => {
                if (this.isReducedMotion) return;
                
                this.animateCardLeave(e.currentTarget, originalTransform);
            });
        });

        // Navigation link hover animations
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                if (this.isReducedMotion) return;
                
                this.animateNavHover(e.currentTarget);
            });
            
            link.addEventListener('mouseleave', (e) => {
                if (this.isReducedMotion) return;
                
                this.animateNavLeave(e.currentTarget);
            });
        });
    }

    // Animate project card on hover
    animateCardHover(card) {
        card.style.transition = `transform ${AnimationConfig.durations.scale}ms ${AnimationConfig.easings.default}, 
                               box-shadow ${AnimationConfig.durations.scale}ms ${AnimationConfig.easings.default}`;
        card.style.transform = 'translateY(-10px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
        
        // Animate details reveal
        const details = card.querySelector('.project-details');
        if (details) {
            details.style.transition = `opacity ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.default}, 
                                      transform ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.default}`;
            details.style.opacity = '1';
            details.style.transform = 'translateY(0)';
        }
    }

    // Animate project card on leave
    animateCardLeave(card, originalTransform) {
        card.style.transform = originalTransform || 'translateY(0) scale(1)';
        card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        
        // Hide details
        const details = card.querySelector('.project-details');
        if (details) {
            details.style.opacity = '0';
            details.style.transform = 'translateY(10px)';
        }
    }

    // Animate navigation link on hover
    animateNavHover(link) {
        link.style.transition = `transform ${AnimationConfig.durations.scale}ms ${AnimationConfig.easings.bounce}`;
        link.style.transform = 'translateY(-2px)';
    }

    // Animate navigation link on leave
    animateNavLeave(link) {
        link.style.transform = 'translateY(0)';
    }

    // Setup page load animations
    setupPageLoadAnimations() {
        document.addEventListener('DOMContentLoaded', () => {
            // Animate hero section on load
            this.animateHeroOnLoad();
            
            // Stagger animate hero content
            setTimeout(() => {
                this.animateHeroContent();
            }, 300);
        });
    }

    // Animate hero section on page load
    animateHeroOnLoad() {
        const heroSection = document.getElementById('hero-section');
        if (!heroSection || this.isReducedMotion) return;

        heroSection.style.opacity = '0';
        
        setTimeout(() => {
            heroSection.style.transition = `opacity ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.smooth}`;
            heroSection.style.opacity = '1';
        }, 100);
    }

    // Animate hero content with stagger
    animateHeroContent() {
        if (this.isReducedMotion) return;

        const heroContent = document.querySelectorAll('#hero-section h1, #hero-section p, #hero-section .cta-button');
        
        heroContent.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = `opacity ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.default}, 
                                          transform ${AnimationConfig.durations.fadeIn}ms ${AnimationConfig.easings.default}`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Setup navigation animations
    setupNavigationAnimations() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        // Animate nav on scroll
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            if (this.isReducedMotion) return;

            const currentScroll = window.pageYOffset;
            const navHeight = nav.offsetHeight;
            
            if (currentScroll > lastScroll && currentScroll > navHeight) {
                // Scrolling down
                nav.style.transform = 'translateY(-100%)';
                nav.style.transition = `transform ${AnimationConfig.durations.slideUp}ms ${AnimationConfig.easings.default}`;
            } else {
                // Scrolling up
                nav.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }

    // Generic fade in animation
    animateFadeIn(element) {
        if (this.isReducedMotion) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            return;
        }

        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }

    // Animate element with bounce effect
    animateBounce(element) {
        if (this.isReducedMotion) return;

        element.style.transition = `transform ${AnimationConfig.durations.scale}ms ${AnimationConfig.easings.bounce}`;
        element.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, AnimationConfig.durations.scale);
    }

    // Animate copy feedback
    animateCopyFeedback(element) {
        if (this.isReducedMotion) return;

        element.style.transition = `transform ${AnimationConfig.durations.scale}ms ${AnimationConfig.easings.bounce}, 
                                  color ${AnimationConfig.durations.scale}ms ease`;
        this.animateBounce(element);
    }

    // Clean up animations
    cleanup() {
        this.intersectionObservers.forEach(observer => {
            observer.disconnect();
        });
        
        this.animatedElements.clear();
        this.scrollAnimations = [];
    }
}

// Initialize animation manager
const animationManager = new AnimationManager();

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = animationManager;
} else {
    // Initialize animations when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        animationManager.init();
    });
}