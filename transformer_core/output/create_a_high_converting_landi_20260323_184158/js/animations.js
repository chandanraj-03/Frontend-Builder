// animations.js - Animation system for smooth transitions, scroll effects, and interactive animations
// Handles all animation-related functionality including scroll-triggered animations and interactive effects

class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.intersectionObserver = null;
        this.scrollAnimations = new Set();
        this.parallaxElements = new Set();
        this.animatedElements = new Set();
        this.isReducedMotion = false;
        this.scrollPosition = 0;
        this.animationFrameId = null;
    }

    // Initialize animation system
    init() {
        this.detectReducedMotion();
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupHoverAnimations();
        this.setupCTAAnimations();
        this.setupPageTransitions();
        this.startAnimationLoop();
        
        console.log('Animation system initialized');
    }

    // Detect if user prefers reduced motion
    detectReducedMotion() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (this.isReducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        }
    }

    // Setup Intersection Observer for scroll-triggered animations
    setupIntersectionObserver() {
        const options = {
            threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
            rootMargin: '0px 0px -50px 0px'
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.handleIntersection(entry);
            });
        }, options);

        // Observe elements with animation attributes
        const animatableElements = document.querySelectorAll('[data-animate], .animate-on-scroll');
        animatableElements.forEach(el => {
            this.intersectionObserver.observe(el);
            this.animatedElements.add(el);
        });
    }

    // Handle intersection events for scroll animations
    handleIntersection(entry) {
        const element = entry.target;
        const isIntersecting = entry.isIntersecting;
        const intersectionRatio = entry.intersectionRatio;

        if (isIntersecting) {
            this.animateIn(element, intersectionRatio);
        } else if (entry.boundingClientRect.top < 0) {
            this.animateOut(element);
        }
    }

    // Animate element when it enters viewport
    animateIn(element, ratio) {
        if (this.isReducedMotion) {
            element.classList.add('animated');
            return;
        }

        const animationType = element.getAttribute('data-animate') || 'fade-up';
        const delay = element.getAttribute('data-delay') || 0;
        const duration = element.getAttribute('data-duration') || 600;

        // Calculate progress based on intersection ratio
        const progress = Math.min(ratio * 2, 1); // Accelerate appearance

        element.style.setProperty('--animation-progress', progress);
        element.classList.add('animating-in');

        // Apply specific animation based on type
        this.applyAnimation(element, animationType, progress, duration, delay);

        // Mark as animated
        setTimeout(() => {
            element.classList.add('animated');
            element.classList.remove('animating-in');
        }, parseInt(delay) + parseInt(duration));
    }

    // Animate element when it leaves viewport
    animateOut(element) {
        if (this.isReducedMotion) return;

        element.classList.add('animating-out');
        
        setTimeout(() => {
            element.classList.remove('animated', 'animating-out');
        }, 300);
    }

    // Apply specific animation based on type
    applyAnimation(element, type, progress, duration, delay) {
        const transforms = {
            'fade-up': `translateY(${50 * (1 - progress)}px)`,
            'fade-down': `translateY(${-50 * (1 - progress)}px)`,
            'fade-left': `translateX(${50 * (1 - progress)}px)`,
            'fade-right': `translateX(${-50 * (1 - progress)}px)`,
            'zoom-in': `scale(${0.8 + 0.2 * progress})`,
            'zoom-out': `scale(${1.2 - 0.2 * progress})`,
            'flip-x': `rotateX(${90 * (1 - progress)}deg)`,
            'flip-y': `rotateY(${90 * (1 - progress)}deg)`
        };

        const opacity = progress;

        if (transforms[type]) {
            element.style.transform = transforms[type];
        }
        element.style.opacity = opacity;
        element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;
    }

    // Setup scroll-based animations
    setupScrollAnimations() {
        const scrollElements = document.querySelectorAll('[data-scroll-animate]');
        scrollElements.forEach(el => {
            this.scrollAnimations.add(el);
        });

        // Throttled scroll handler
        const scrollHandler = this.throttle(() => {
            this.updateScrollAnimations();
        }, 16);

        window.addEventListener('scroll', scrollHandler);
    }

    // Update animations based on scroll position
    updateScrollAnimations() {
        this.scrollPosition = window.scrollY;
        const viewportHeight = window.innerHeight;

        this.scrollAnimations.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + this.scrollPosition;
            const elementHeight = rect.height;
            
            // Calculate progress through element
            const start = elementTop - viewportHeight * 0.8;
            const end = elementTop + elementHeight;
            const progress = Math.max(0, Math.min(1, (this.scrollPosition - start) / (end - start)));

            this.animateOnScroll(element, progress);
        });
    }

    // Animate element based on scroll progress
    animateOnScroll(element, progress) {
        const animationType = element.getAttribute('data-scroll-animate');
        
        switch (animationType) {
            case 'progress-bar':
                element.style.width = `${progress * 100}%`;
                break;
            case 'counter':
                const target = parseInt(element.getAttribute('data-target'));
                const current = Math.floor(progress * target);
                element.textContent = current.toLocaleString();
                break;
            case 'parallax':
                const speed = parseFloat(element.getAttribute('data-speed')) || 0.5;
                element.style.transform = `translateY(${this.scrollPosition * speed}px)`;
                break;
        }
    }

    // Setup parallax scrolling effects
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(el => {
            this.parallaxElements.add(el);
        });
    }

    // Update parallax effects in animation loop
    updateParallaxEffects() {
        if (this.isReducedMotion) return;

        this.parallaxElements.forEach(element => {
            const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.5;
            const direction = element.getAttribute('data-parallax-direction') || 'vertical';
            const limit = element.getAttribute('data-parallax-limit');
            
            let transformValue = '';
            
            if (direction === 'vertical') {
                const translateY = this.scrollPosition * speed;
                transformValue = `translateY(${translateY}px)`;
            } else if (direction === 'horizontal') {
                const translateX = this.scrollPosition * speed;
                transformValue = `translateX(${translateX}px)`;
            }

            // Apply limit if specified
            if (limit) {
                const maxTranslate = parseFloat(limit);
                transformValue = transformValue.replace(/(-?\d+)/, (match) => {
                    return Math.max(-maxTranslate, Math.min(maxTranslate, parseFloat(match)));
                });
            }

            element.style.transform = transformValue;
        });
    }

    // Setup hover animations for interactive elements
    setupHoverAnimations() {
        // Features grid hover effects
        const featureItems = document.querySelectorAll('.feature-item, .grid-item');
        featureItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                this.animateHoverIn(e.currentTarget);
            });
            
            item.addEventListener('mouseleave', (e) => {
                this.animateHoverOut(e.currentTarget);
            });
        });

        // Button hover animations
        const buttons = document.querySelectorAll('.btn, .cta-button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.animateButtonHover(e.currentTarget);
            });
            
            button.addEventListener('mouseleave', (e) => {
                this.animateButtonLeave(e.currentTarget);
            });
        });
    }

    // Animate element on hover in
    animateHoverIn(element) {
        if (this.isReducedMotion) return;

        element.style.transform = 'translateY(-5px) scale(1.02)';
        element.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
        element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }

    // Animate element on hover out
    animateHoverOut(element) {
        if (this.isReducedMotion) return;

        element.style.transform = '';
        element.style.boxShadow = '';
    }

    // Animate button hover effect
    animateButtonHover(button) {
        if (this.isReducedMotion) return;

        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    }

    // Animate button leave effect
    animateButtonLeave(button) {
        if (this.isReducedMotion) return;

        button.style.transform = '';
        button.style.boxShadow = '';
    }

    // Setup CTA button animations
    setupCTAAnimations() {
        const ctaButtons = document.querySelectorAll('.cta-button, .hero-cta');
        
        ctaButtons.forEach(button => {
            // Pulse animation for prominent CTAs
            if (button.classList.contains('pulse')) {
                this.startPulseAnimation(button);
            }

            // Bounce animation
            if (button.classList.contains('bounce')) {
                this.startBounceAnimation(button);
            }

            // Shimmer effect
            if (button.classList.contains('shimmer')) {
                this.addShimmerEffect(button);
            }
        });
    }

    // Start pulse animation for CTA buttons
    startPulseAnimation(button) {
        if (this.isReducedMotion) return;

        setInterval(() => {
            button.classList.add('pulsing');
            setTimeout(() => {
                button.classList.remove('pulsing');
            }, 600);
        }, 3000);
    }

    // Start bounce animation
    startBounceAnimation(button) {
        if (this.isReducedMotion) return;

        setInterval(() => {
            button.classList.add('bouncing');
            setTimeout(() => {
                button.classList.remove('bouncing');
            }, 1000);
        }, 5000);
    }

    // Add shimmer effect to button
    addShimmerEffect(button) {
        if (this.isReducedMotion) return;

        const shimmer = document.createElement('div');
        shimmer.className = 'shimmer-effect';
        button.appendChild(shimmer);

        setInterval(() => {
            shimmer.classList.add('active');
            setTimeout(() => {
                shimmer.classList.remove('active');
            }, 1000);
        }, 4000);
    }

    // Setup page transition animations
    setupPageTransitions() {
        // Handle link clicks for smooth page transitions
        const links = document.querySelectorAll('a[href^="/"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') === window.location.pathname) return;
                
                e.preventDefault();
                this.animatePageTransition(link.getAttribute('href'));
            });
        });
    }

    // Animate page transition
    animatePageTransition(url) {
        if (this.isReducedMotion) {
            window.location.href = url;
            return;
        }

        // Add fade-out animation to current content
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.opacity = '0';
            mainContent.style.transition = 'opacity 0.3s ease';
        }

        // Navigate after animation
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    // Main animation loop for continuous animations
    startAnimationLoop() {
        const animate = () => {
            this.updateParallaxEffects();
            this.updateContinuousAnimations();
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Update continuous animations (like loading bars, progress indicators)
    updateContinuousAnimations() {
        const continuousAnimations = document.querySelectorAll('[data-continuous-animate]');
        
        continuousAnimations.forEach(element => {
            const animationType = element.getAttribute('data-continuous-animate');
            
            switch (animationType) {
                case 'rotate':
                    const speed = parseFloat(element.getAttribute('data-rotate-speed')) || 1;
                    const rotation = (Date.now() * speed / 1000) % 360;
                    element.style.transform = `rotate(${rotation}deg)`;
                    break;
                    
                case 'pulse-opacity':
                    const pulseSpeed = parseFloat(element.getAttribute('data-pulse-speed')) || 1;
                    const opacity = 0.5 + 0.5 * Math.sin(Date.now() * pulseSpeed / 1000);
                    element.style.opacity = opacity;
                    break;
            }
        });
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

    // Utility: Debounce function
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
    animateElement(element, animationType, options = {}) {
        const {
            duration = 600,
            delay = 0,
            easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        } = options;

        if (this.isReducedMotion) {
            element.classList.add('animated');
            return;
        }

        this.applyAnimation(element, animationType, 1, duration, delay);
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.classList.add('animated');
                resolve();
            }, delay + duration);
        });
    }

    stopAnimation(element) {
        element.style.transition = 'none';
        element.classList.remove('animated', 'animating-in', 'animating-out');
    }

    // Cleanup method
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        this.animations.clear();
        this.scrollAnimations.clear();
        this.parallaxElements.clear();
        this.animatedElements.clear();
    }
}

// Initialize animation system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animationSystem = new AnimationSystem();
    animationSystem.init();
    
    // Make animation system available globally
    window.animations = animationSystem;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationSystem;
}