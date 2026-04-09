// animations.js - Animation management and smooth transitions
// Handles all animations, transitions, and motion-related functionality

class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.isReducedMotion = window.app ? window.app.getMotionPreference() : false;
        this.init();
    }

    // Initialize animation manager
    init() {
        this.setupReducedMotionListener();
        this.registerCoreAnimations();
        this.setupScrollAnimations();
        this.setupHoverAnimations();
    }

    // Listen for reduced motion preference changes
    setupReducedMotionListener() {
        if (window.app) {
            window.app.components.forEach((component, name) => {
                if (component && typeof component.onMotionPreferenceChange === 'function') {
                    // Component will handle its own animation preferences
                    component.onMotionPreferenceChange(this.isReducedMotion);
                }
            });
        }
    }

    // Register core animations for components
    registerCoreAnimations() {
        this.animations.set('hero-entrance', this.createHeroEntranceAnimation());
        this.animations.set('project-hover', this.createProjectHoverAnimation());
        this.animations.set('section-transition', this.createSectionTransitionAnimation());
        this.animations.set('contact-reveal', this.createContactRevealAnimation());
        this.animations.set('navigation-slide', this.createNavigationSlideAnimation());
    }

    // Create hero section entrance animation
    createHeroEntranceAnimation() {
        return {
            play: () => {
                if (this.isReducedMotion) return;
                
                const hero = document.querySelector('.hero-section');
                if (!hero) return;

                const elements = hero.querySelectorAll('[data-animate]');
                elements.forEach((el, index) => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(30px)';
                    
                    setTimeout(() => {
                        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, index * 200);
                });
            },
            stop: () => {
                const hero = document.querySelector('.hero-section');
                if (hero) {
                    hero.querySelectorAll('[data-animate]').forEach(el => {
                        el.style.transition = 'none';
                        el.style.opacity = '1';
                        el.style.transform = 'none';
                    });
                }
            }
        };
    }

    // Create project showcase hover animation
    createProjectHoverAnimation() {
        return {
            init: () => {
                const projects = document.querySelectorAll('.project-item');
                projects.forEach(project => {
                    const details = project.querySelector('.project-details');
                    if (!details) return;

                    project.addEventListener('mouseenter', () => this.handleProjectHoverIn(project));
                    project.addEventListener('mouseleave', () => this.handleProjectHoverOut(project));
                });
            },
            handleProjectHoverIn: (project) => {
                if (this.isReducedMotion) return;
                
                const details = project.querySelector('.project-details');
                if (!details) return;

                details.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                details.style.opacity = '1';
                details.style.transform = 'translateY(0)';
            },
            handleProjectHoverOut: (project) => {
                if (this.isReducedMotion) return;
                
                const details = project.querySelector('.project-details');
                if (!details) return;

                details.style.opacity = '0';
                details.style.transform = 'translateY(10px)';
            }
        };
    }

    // Create smooth section transitions
    createSectionTransitionAnimation() {
        return {
            init: () => {
                // Set up intersection observer for section animations
                const sections = document.querySelectorAll('section');
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !this.isReducedMotion) {
                            this.animateSectionIn(entry.target);
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });

                sections.forEach(section => observer.observe(section));
            },
            animateSectionIn: (section) => {
                if (section.classList.contains('animated')) return;
                
                section.classList.add('animated');
                const content = section.querySelector('.section-content');
                
                if (content) {
                    content.style.opacity = '0';
                    content.style.transform = 'translateY(40px)';
                    
                    setTimeout(() => {
                        content.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                        content.style.opacity = '1';
                        content.style.transform = 'translateY(0)';
                    }, 100);
                }
            }
        };
    }

    // Create contact information reveal animation
    createContactRevealAnimation() {
        return {
            init: () => {
                const contacts = document.querySelectorAll('.contact-item');
                contacts.forEach((contact, index) => {
                    contact.style.opacity = '0';
                    contact.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        if (!this.isReducedMotion) {
                            contact.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        }
                        contact.style.opacity = '1';
                        contact.style.transform = 'scale(1)';
                    }, index * 150);
                });
            },
            animateCopyFeedback: (element) => {
                if (this.isReducedMotion) return;
                
                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transition = 'transform 0.2s ease';
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        };
    }

    // Create navigation menu slide animation
    createNavigationSlideAnimation() {
        return {
            toggle: (menu) => {
                if (this.isReducedMotion) {
                    menu.classList.toggle('active');
                    return;
                }

                if (menu.classList.contains('active')) {
                    menu.style.transform = 'translateX(-100%)';
                    setTimeout(() => menu.classList.remove('active'), 300);
                } else {
                    menu.classList.add('active');
                    menu.style.transform = 'translateX(0)';
                }
            },
            init: () => {
                const menu = document.querySelector('.navigation-menu');
                if (menu) {
                    menu.style.transition = 'transform 0.3s ease';
                }
            }
        };
    }

    // Set up scroll-based animations
    setupScrollAnimations() {
        if (this.isReducedMotion) return;

        // Parallax effect for hero section
        this.setupParallaxEffect();
        
        // Fade-in elements on scroll
        this.setupScrollFadeIn();
    }

    // Parallax effect for hero background
    setupParallaxEffect() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Fade in elements as they enter viewport
    setupScrollFadeIn() {
        const fadeElements = document.querySelectorAll('[data-fade-in]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isReducedMotion) {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        fadeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    }

    // Set up hover animations for interactive elements
    setupHoverAnimations() {
        if (this.isReducedMotion) return;

        // Button hover effects
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.transition = 'transform 0.2s ease';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });

        // Card hover effects
        const cards = document.querySelectorAll('.card, .project-item');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.transition = 'transform 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Play specific animation by name
    playAnimation(name) {
        const animation = this.animations.get(name);
        if (animation && animation.play && !this.isReducedMotion) {
            animation.play();
        }
    }

    // Stop specific animation by name
    stopAnimation(name) {
        const animation = this.animations.get(name);
        if (animation && animation.stop) {
            animation.stop();
        }
    }

    // Initialize all registered animations
    initializeAnimations() {
        this.animations.forEach((animation, name) => {
            if (animation.init) {
                animation.init();
            }
        });
    }

    // Update reduced motion preference
    updateReducedMotion(preference) {
        this.isReducedMotion = preference;
        
        if (preference) {
            this.disableAllAnimations();
        } else {
            this.enableAllAnimations();
        }
    }

    // Disable all non-essential animations
    disableAllAnimations() {
        document.documentElement.style.scrollBehavior = 'auto';
        
        // Remove transition styles
        document.querySelectorAll('*').forEach(el => {
            el.style.transition = 'none';
        });
    }

    // Enable animations
    enableAllAnimations() {
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    // Utility function for smooth element reveal
    revealElement(element, delay = 0) {
        if (this.isReducedMotion) {
            element.style.opacity = '1';
            return;
        }

        setTimeout(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }
}

// Initialize animation manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
    window.animationManager.initializeAnimations();
});