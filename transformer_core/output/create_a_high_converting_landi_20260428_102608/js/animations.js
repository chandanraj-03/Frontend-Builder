// animations.js - Animation management for smooth transitions and interactive effects

import { throttle } from './utils/throttle.js';

// Animation configuration and state
const Animations = {
    config: {
        scrollThreshold: 0.8,
        animationDuration: 600,
        staggerDelay: 100,
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        hoverScale: 1.05,
        hoverTransition: 'transform 0.3s ease'
    },
    animatedElements: new Set(),
    intersectionObserver: null,
    scrollAnimations: new Map()
};

// Initialize animation system
function initAnimations() {
    console.log('Initializing animations...');
    
    // Setup animation styles
    setupAnimationStyles();
    
    // Initialize intersection observer for scroll animations
    initIntersectionObserver();
    
    // Setup scroll-based animations
    setupScrollAnimations();
    
    // Initialize hover effects
    initHoverEffects();
    
    // Initialize click animations
    initClickAnimations();
    
    // Initialize component-specific animations
    initComponentAnimations();
    
    console.log('Animations initialized successfully');
}

// Setup global animation styles
function setupAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity ${Animations.config.animationDuration}ms ${Animations.config.ease}, 
                        transform ${Animations.config.animationDuration}ms ${Animations.config.ease};
        }
        
        .animate-on-scroll.animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        .animate-fade-in {
            opacity: 0;
            animation: fadeIn ${Animations.config.animationDuration}ms ${Animations.config.ease} forwards;
        }
        
        .animate-slide-up {
            transform: translateY(50px);
            animation: slideUp ${Animations.config.animationDuration}ms ${Animations.config.ease} forwards;
        }
        
        .animate-slide-down {
            transform: translateY(-50px);
            animation: slideDown ${Animations.config.animationDuration}ms ${Animations.config.ease} forwards;
        }
        
        .animate-scale-in {
            transform: scale(0.8);
            animation: scaleIn ${Animations.config.animationDuration}ms ${Animations.config.ease} forwards;
        }
        
        .animate-bounce {
            animation: bounce 1s ${Animations.config.ease};
        }
        
        .hover-scale {
            transition: ${Animations.config.hoverTransition};
        }
        
        .hover-scale:hover {
            transform: scale(${Animations.config.hoverScale});
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(50px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideDown {
            from { 
                opacity: 0;
                transform: translateY(-50px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes scaleIn {
            from { 
                opacity: 0;
                transform: scale(0.8);
            }
            to { 
                opacity: 1;
                transform: scale(1);
            }
        }
        
        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
                transform: translateY(0);
            }
            40%, 43% {
                transform: translateY(-15px);
            }
            70% {
                transform: translateY(-7px);
            }
            90% {
                transform: translateY(-3px);
            }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .shake {
            animation: shake 0.5s;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize intersection observer for scroll animations
function initIntersectionObserver() {
    Animations.intersectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateOnScroll(entry.target);
                }
            });
        },
        {
            threshold: Animations.config.scrollThreshold,
            rootMargin: '0px 0px -100px 0px'
        }
    );
}

// Setup scroll-based animations
function setupScrollAnimations() {
    // Add scroll animation class to elements
    const scrollElements = document.querySelectorAll('[data-animate-on-scroll]');
    scrollElements.forEach(element => {
        element.classList.add('animate-on-scroll');
        Animations.intersectionObserver.observe(element);
        Animations.animatedElements.add(element);
    });
    
    // Handle window scroll for parallax effects
    window.addEventListener('scroll', throttle(handleScrollAnimations, 16));
}

// Handle scroll animations
function handleScrollAnimations() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Update parallax elements
    updateParallaxElements(scrollY);
    
    // Update sticky elements
    updateStickyAnimations(scrollY);
    
    // Update progress animations
    updateProgressAnimations(scrollY, windowHeight);
}

// Animate element when it comes into view
function animateOnScroll(element) {
    if (!element.classList.contains('animated')) {
        element.classList.add('animated');
        
        // Handle staggered animations
        const stagger = element.getAttribute('data-stagger');
        if (stagger) {
            const index = parseInt(stagger, 10);
            element.style.transitionDelay = `${index * Animations.config.staggerDelay}ms`;
        }
        
        // Remove from observer after animation
        setTimeout(() => {
            Animations.intersectionObserver.unobserve(element);
        }, Animations.config.animationDuration);
    }
}

// Initialize hover effects
function initHoverEffects() {
    // Add hover scale effects
    const hoverElements = document.querySelectorAll('[data-hover-scale]');
    hoverElements.forEach(element => {
        element.classList.add('hover-scale');
    });
    
    // Custom hover effects
    setupCustomHoverEffects();
}

// Setup custom hover effects
function setupCustomHoverEffects() {
    const hoverCards = document.querySelectorAll('.feature-card, .team-card, .pricing-card');
    hoverCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            animateCardHover(card, true);
        });
        
        card.addEventListener('mouseleave', () => {
            animateCardHover(card, false);
        });
    });
}

// Animate card hover effect
function animateCardHover(card, isHovering) {
    if (isHovering) {
        card.style.transform = `translateY(-8px) scale(${Animations.config.hoverScale})`;
        card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
    } else {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    }
}

// Initialize click animations
function initClickAnimations() {
    // CTA button animations
    const ctaButtons = document.querySelectorAll('.cta-button, .btn-primary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            animateButtonClick(button);
        });
    });
    
    // Toggle animations
    const toggleElements = document.querySelectorAll('[data-toggle-animation]');
    toggleElements.forEach(element => {
        element.addEventListener('click', () => {
            const target = element.getAttribute('data-toggle-target');
            const animation = element.getAttribute('data-toggle-animation');
            toggleAnimation(target, animation);
        });
    });
}

// Animate button click
function animateButtonClick(button) {
    button.classList.add('pulse');
    setTimeout(() => {
        button.classList.remove('pulse');
    }, 2000);
}

// Toggle animation on target element
function toggleAnimation(targetSelector, animationClass) {
    const target = document.querySelector(targetSelector);
    if (target) {
        target.classList.toggle(animationClass);
    }
}

// Initialize component-specific animations
function initComponentAnimations() {
    // Hero section animations
    initHeroAnimations();
    
    // Features grid animations
    initFeaturesGridAnimations();
    
    // Testimonial carousel animations
    initTestimonialAnimations();
    
    // FAQ accordion animations
    initFAQAnimations();
    
    // Pricing table animations
    initPricingAnimations();
}

// Initialize hero section animations
function initHeroAnimations() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    
    // Animate hero elements on load
    setTimeout(() => {
        const title = hero.querySelector('h1');
        const subtitle = hero.querySelector('p');
        const cta = hero.querySelector('.cta-button');
        
        if (title) animateElement(title, 'slide-down', 0);
        if (subtitle) animateElement(subtitle, 'fade-in', 300);
        if (cta) animateElement(cta, 'scale-in', 600);
    }, 500);
}

// Initialize features grid animations
function initFeaturesGridAnimations() {
    const features = document.querySelectorAll('.feature-item');
    features.forEach((feature, index) => {
        feature.setAttribute('data-stagger', index);
        feature.setAttribute('data-animate-on-scroll', 'true');
    });
}

// Initialize testimonial animations
function initTestimonialAnimations() {
    const testimonials = document.querySelector('.testimonial-carousel');
    if (testimonials) {
        testimonials.addEventListener('slideChange', (e) => {
            animateTestimonialTransition(e.detail);
        });
    }
}

// Animate testimonial transition
function animateTestimonialTransition(detail) {
    const { currentSlide, nextSlide } = detail;
    if (currentSlide) {
        currentSlide.style.animation = `fadeOut ${Animations.config.animationDuration}ms ${Animations.config.ease}`;
    }
    if (nextSlide) {
        nextSlide.style.animation = `fadeIn ${Animations.config.animationDuration}ms ${Animations.config.ease}`;
    }
}

// Initialize FAQ animations
function initFAQAnimations() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                animateFAQToggle(item, answer);
            });
        }
    });
}

// Animate FAQ toggle
function animateFAQToggle(item, answer) {
    const isExpanding = !item.classList.contains('active');
    
    if (isExpanding) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
    } else {
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        setTimeout(() => {
            item.classList.remove('active');
        }, Animations.config.animationDuration);
    }
}

// Initialize pricing animations
function initPricingAnimations() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            animatePricingCardHover(card, true);
        });
        
        card.addEventListener('mouseleave', () => {
            animatePricingCardHover(card, false);
        });
        
        card.addEventListener('click', () => {
            animatePricingCardSelect(card);
        });
    });
}

// Animate pricing card hover
function animatePricingCardHover(card, isHovering) {
    if (isHovering) {
        card.style.transform = 'scale(1.02)';
        card.style.zIndex = '10';
    } else {
        card.style.transform = 'scale(1)';
        card.style.zIndex = '';
    }
}

// Animate pricing card selection
function animatePricingCardSelect(card) {
    const allCards = document.querySelectorAll('.pricing-card');
    allCards.forEach(c => c.classList.remove('selected'));
    
    card.classList.add('selected');
    card.classList.add('pulse');
    
    setTimeout(() => {
        card.classList.remove('pulse');
    }, 1000);
}

// Update parallax elements on scroll
function updateParallaxElements(scrollY) {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(element => {
        const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.5;
        const offset = scrollY * speed;
        element.style.transform = `translateY(${offset}px)`;
    });
}

// Update sticky animations
function updateStickyAnimations(scrollY) {
    const stickyElements = document.querySelectorAll('[data-sticky]');
    stickyElements.forEach(element => {
        const threshold = parseInt(element.getAttribute('data-sticky-threshold')) || 100;
        
        if (scrollY > threshold) {
            element.classList.add('sticky-active');
        } else {
            element.classList.remove('sticky-active');
        }
    });
}

// Update progress animations
function updateProgressAnimations(scrollY, windowHeight) {
    const progressElements = document.querySelectorAll('[data-progress]');
    progressElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const progress = 1 - (rect.top / windowHeight);
        
        if (progress > 0 && progress < 1) {
            element.style.setProperty('--progress', progress);
        }
    });
}

// Animate element with specific animation
function animateElement(element, animationType, delay = 0) {
    setTimeout(() => {
        element.classList.add(`animate-${animationType}`);
        
        // Clean up after animation
        setTimeout(() => {
            element.classList.remove(`animate-${animationType}`);
        }, Animations.config.animationDuration);
    }, delay);
}

// Trigger bounce animation
export function bounce(element) {
    element.classList.add('animate-bounce');
    setTimeout(() => {
        element.classList.remove('animate-bounce');
    }, 1000);
}

// Trigger shake animation
export function shake(element) {
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 500);
}

// Trigger fade in animation
export function fadeIn(element, delay = 0) {
    setTimeout(() => {
        element.classList.add('animate-fade-in');
    }, delay);
}

// Trigger slide up animation
export function slideUp(element, delay = 0) {
    setTimeout(() => {
        element.classList.add('animate-slide-up');
    }, delay);
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initAnimations);

// Export animation functions
export {
    initAnimations,
    animateElement,
    bounce,
    shake,
    fadeIn,
    slideUp,
    toggleAnimation
};