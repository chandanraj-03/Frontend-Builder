// project-interactions.js - Project showcase interactions and animations
// Handles hover-triggered detail panels, animations, and interactive elements for project showcase

class ProjectInteractions {
    constructor() {
        this.projects = [];
        this.activeProject = null;
        this.isReducedMotion = false;
        this.init();
    }

    // Initialize project interactions
    init() {
        this.checkMotionPreference();
        this.findProjects();
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupStyles();
        this.observeVisibility();
    }

    // Check reduced motion preference
    checkMotionPreference() {
        this.isReducedMotion = document.documentElement.classList.contains('reduced-motion');
        
        // Listen for motion preference changes
        document.addEventListener('reducedMotionChanged', (e) => {
            this.isReducedMotion = e.detail.reducedMotion;
            this.updateAllAnimations();
        });
    }

    // Find all project elements
    findProjects() {
        this.projects = Array.from(document.querySelectorAll(
            '.project-card, [data-project], .project-item'
        ));
    }

    // Setup event listeners for projects
    setupEventListeners() {
        this.projects.forEach(project => {
            // Mouse events for desktop
            project.addEventListener('mouseenter', () => this.handleProjectHover(project));
            project.addEventListener('mouseleave', () => this.handleProjectLeave(project));
            
            // Touch events for mobile
            project.addEventListener('touchstart', (e) => this.handleProjectTouch(e, project));
            project.addEventListener('touchend', () => this.handleProjectTouchEnd(project));
            
            // Focus events for keyboard navigation
            project.addEventListener('focusin', () => this.handleProjectFocus(project));
            project.addEventListener('focusout', () => this.handleProjectBlur(project));
            
            // Click events for project details
            const detailsToggle = project.querySelector('.project-details-toggle, [data-details-toggle]');
            if (detailsToggle) {
                detailsToggle.addEventListener('click', (e) => this.toggleProjectDetails(e, project));
                detailsToggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleProjectDetails(e, project);
                    }
                });
            }
            
            // Live demo link interactions
            const liveDemoLink = project.querySelector('.live-demo-link, [data-live-demo]');
            if (liveDemoLink) {
                liveDemoLink.addEventListener('click', (e) => this.handleLiveDemoClick(e, project));
                liveDemoLink.addEventListener('mouseenter', () => this.animateDemoLink(liveDemoLink));
            }
            
            // Technology stack interactions
            const techStack = project.querySelector('.tech-stack, [data-tech-stack]');
            if (techStack) {
                this.setupTechStackInteractions(techStack);
            }
        });
    }

    // Handle project hover with smooth animations
    handleProjectHover(project) {
        if (this.isReducedMotion || this.activeProject === project) return;
        
        this.activeProject = project;
        
        // Add hover class
        project.classList.add('project-hover');
        
        // Animate project card
        this.animateProjectCard(project, true);
        
        // Show details panel with delay
        setTimeout(() => {
            this.showProjectDetails(project);
        }, 100);
        
        // Highlight related elements
        this.highlightProjectElements(project, true);
    }

    // Handle project mouse leave
    handleProjectLeave(project) {
        if (this.isReducedMotion || this.activeProject !== project) return;
        
        this.activeProject = null;
        project.classList.remove('project-hover');
        this.animateProjectCard(project, false);
        this.hideProjectDetails(project);
        this.highlightProjectElements(project, false);
    }

    // Handle project touch for mobile
    handleProjectTouch(event, project) {
        event.preventDefault();
        
        if (this.isReducedMotion) {
            this.toggleProjectDetails(event, project);
            return;
        }
        
        this.handleProjectHover(project);
        
        // Store touch reference
        project.dataset.touchActive = 'true';
    }

    // Handle project touch end
    handleProjectTouchEnd(project) {
        if (this.isReducedMotion) return;
        
        setTimeout(() => {
            if (project.dataset.touchActive) {
                delete project.dataset.touchActive;
                this.handleProjectLeave(project);
            }
        }, 300);
    }

    // Handle project focus for keyboard navigation
    handleProjectFocus(project) {
        if (this.isReducedMotion) return;
        
        this.handleProjectHover(project);
        project.classList.add('project-focused');
    }

    // Handle project blur
    handleProjectBlur(project) {
        if (this.isReducedMotion) return;
        
        this.handleProjectLeave(project);
        project.classList.remove('project-focused');
    }

    // Animate project card
    animateProjectCard(project, isHovering) {
        if (this.isReducedMotion) return;
        
        const card = project.querySelector('.project-card-inner') || project;
        
        if (isHovering) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
            card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }

    // Show project details panel
    showProjectDetails(project) {
        if (this.isReducedMotion) return;
        
        const detailsPanel = project.querySelector('.project-details, [data-project-details]');
        if (!detailsPanel) return;
        
        detailsPanel.style.display = 'block';
        
        // Animate in
        requestAnimationFrame(() => {
            detailsPanel.style.opacity = '1';
            detailsPanel.style.transform = 'translateY(0)';
            detailsPanel.style.transition = this.isReducedMotion 
                ? 'none' 
                : 'opacity 0.3s ease, transform 0.3s ease';
        });
        
        // Update ARIA attributes
        detailsPanel.setAttribute('aria-hidden', 'false');
    }

    // Hide project details panel
    hideProjectDetails(project) {
        if (this.isReducedMotion) return;
        
        const detailsPanel = project.querySelector('.project-details, [data-project-details]');
        if (!detailsPanel) return;
        
        detailsPanel.style.opacity = '0';
        detailsPanel.style.transform = 'translateY(10px)';
        detailsPanel.style.transition = this.isReducedMotion 
            ? 'none' 
            : 'opacity 0.2s ease, transform 0.2s ease';
        
        // Hide after animation
        setTimeout(() => {
            if (this.activeProject !== project) {
                detailsPanel.style.display = 'none';
            }
        }, 200);
        
        // Update ARIA attributes
        detailsPanel.setAttribute('aria-hidden', 'true');
    }

    // Toggle project details (for mobile/touch)
    toggleProjectDetails(event, project) {
        event.preventDefault();
        event.stopPropagation();
        
        const detailsPanel = project.querySelector('.project-details, [data-project-details]');
        if (!detailsPanel) return;
        
        const isHidden = detailsPanel.style.display === 'none' || 
                        detailsPanel.getAttribute('aria-hidden') === 'true';
        
        if (isHidden) {
            this.showProjectDetails(project);
        } else {
            this.hideProjectDetails(project);
        }
        
        // Update toggle button state
        const toggleButton = event.target.closest('[data-details-toggle]');
        if (toggleButton) {
            toggleButton.setAttribute('aria-expanded', (!isHidden).toString());
            toggleButton.setAttribute('aria-label', 
                isHidden ? 'Hide project details' : 'Show project details');
        }
    }

    // Handle live demo link click
    handleLiveDemoClick(event, project) {
        event.preventDefault();
        event.stopPropagation();
        
        const link = event.target.closest('a');
        const url = link.href;
        const projectTitle = project.querySelector('.project-title').textContent;
        
        // Add click animation
        this.animateButtonClick(link);
        
        // Log analytics event
        this.logProjectInteraction('live_demo_click', projectTitle, url);
        
        // Open in new tab after animation
        setTimeout(() => {
            window.open(url, '_blank', 'noopener,noreferrer');
        }, 300);
    }

    // Animate live demo link
    animateDemoLink(link) {
        if (this.isReducedMotion) return;
        
        link.style.transform = 'translateX(4px)';
        link.style.transition = 'transform 0.2s ease-in-out';
        
        setTimeout(() => {
            link.style.transform = '';
        }, 200);
    }

    // Setup technology stack interactions
    setupTechStackInteractions(techStack) {
        const techItems = techStack.querySelectorAll('.tech-item, [data-tech]');
        
        techItems.forEach(item => {
            item.addEventListener('mouseenter', () => this.handleTechHover(item));
            item.addEventListener('mouseleave', () => this.handleTechLeave(item));
            item.addEventListener('click', (e) => this.handleTechClick(e, item));
            
            // Add tooltip
            const techName = item.textContent || item.getAttribute('data-tech');
            item.setAttribute('title', techName);
            item.setAttribute('aria-label', `Technology: ${techName}`);
        });
    }

    // Handle technology item hover
    handleTechHover(item) {
        if (this.isReducedMotion) return;
        
        item.style.transform = 'scale(1.1)';
        item.style.zIndex = '10';
        item.style.transition = 'all 0.2s ease-in-out';
        
        // Show tooltip
        this.showTechTooltip(item);
    }

    // Handle technology item leave
    handleTechLeave(item) {
        if (this.isReducedMotion) return;
        
        item.style.transform = '';
        item.style.zIndex = '';
        
        // Hide tooltip
        this.hideTechTooltip(item);
    }

    // Handle technology item click
    handleTechClick(event, item) {
        event.stopPropagation();
        
        const techName = item.textContent || item.getAttribute('data-tech');
        this.logProjectInteraction('tech_click', techName);
        
        // Add pulse animation
        item.style.animation = 'techPulse 0.3s ease-in-out';
        
        setTimeout(() => {
            item.style.animation = '';
        }, 300);
    }

    // Show technology tooltip
    showTechTooltip(item) {
        if (this.isReducedMotion) return;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tech-tooltip';
        tooltip.textContent = item.textContent || item.getAttribute('data-tech');
        tooltip.style.cssText = `
            position: absolute;
            background: var(--tooltip-bg, #333);
            color: var(--tooltip-color, #fff);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
            transform: translateY(-100%) translateX(-50%);
            left: 50%;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        item.appendChild(tooltip);
        
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });
    }

    // Hide technology tooltip
    hideTechTooltip(item) {
        const tooltip = item.querySelector('.tech-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentNode === item) {
                    item.removeChild(tooltip);
                }
            }, 200);
        }
    }

    // Highlight related project elements
    highlightProjectElements(project, highlight) {
        if (this.isReducedMotion) return;
        
        const elements = project.querySelectorAll('.project-title, .project-description, .tech-item');
        
        elements.forEach(element => {
            if (highlight) {
                element.style.transition = 'all 0.3s ease';
                element.style.filter = 'brightness(1.1)';
            } else {
                element.style.filter = '';
            }
        });
    }

    // Animate button click
    animateButtonClick(button) {
        if (this.isReducedMotion) return;
        
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.1s ease-in-out';
        
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }

    // Setup accessibility features
    setupAccessibility() {
        this.projects.forEach(project => {
            // Ensure projects are focusable
            if (!project.hasAttribute('tabindex')) {
                project.setAttribute('tabindex', '0');
            }
            
            // Add ARIA labels
            const title = project.querySelector('.project-title');
            if (title) {
                project.setAttribute('aria-label', `Project: ${title.textContent}`);
                project.setAttribute('role', 'article');
            }
            
            // Setup details panel ARIA
            const detailsPanel = project.querySelector('.project-details');
            if (detailsPanel) {
                detailsPanel.setAttribute('aria-hidden', 'true');
                detailsPanel.setAttribute('role', 'region');
                detailsPanel.setAttribute('aria-label', 'Project details');
            }
        });
    }

    // Setup necessary styles
    setupStyles() {
        const styleId = 'project-interactions-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .project-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
            }
            
            .project-details {
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                display: none;
            }
            
            .tech-item {
                display: inline-block;
                transition: all 0.2s ease-in-out;
                cursor: pointer;
                position: relative;
            }
            
            .live-demo-link {
                transition: all 0.2s ease-in-out;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .live-demo-link:hover {
                transform: translateX(4px);
            }
            
            @keyframes techPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.15); }
                100% { transform: scale(1); }
            }
            
            .reduced-motion .project-card,
            .reduced-motion .project-details,
            .reduced-motion .tech-item,
            .reduced-motion .live-demo-link {
                transition: none !important;
                animation: none !important;
            }
            
            .project-focused {
                outline: 2px solid var(--accent-color, #007bff);
                outline-offset: 4px;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Observe project visibility for scroll animations
    observeVisibility() {
        if (this.isReducedMotion || !('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateProjectOnScroll(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        this.projects.forEach(project => {
            observer.observe(project);
        });
    }

    // Animate project on scroll into view
    animateProjectOnScroll(project) {
        project.style.opacity = '0';
        project.style.transform = 'translateY(20px)';
        project.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
            project.style.opacity = '1';
            project.style.transform = 'translateY(0)';
        });
    }

    // Update all animations based on motion preference
    updateAllAnimations() {
        if (this.isReducedMotion) {
            // Remove all animations
            this.projects.forEach(project => {
                project.style.transition = 'none';
                project.style.animation = 'none';
                
                const detailsPanel = project.querySelector('.project-details');
                if (detailsPanel) {
                    detailsPanel.style.transition = 'none';
                }
            });
        }
    }

    // Log project interactions for analytics
    logProjectInteraction(action, projectName, metadata = '') {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': 'project_interaction',
                'event_label': projectName,
                'value': metadata
            });
        }
        
        // Custom event for other scripts
        document.dispatchEvent(new CustomEvent('projectInteraction', {
            detail: {
                action: action,
                project: projectName,
                metadata: metadata,
                timestamp: new Date().toISOString()
            }
        }));
    }

    // Refresh project list (useful for dynamic content)
    refresh() {
        this.findProjects();
        this.setupEventListeners();
        this.setupAccessibility();
        this.observeVisibility();
    }
}

// Initialize project interactions when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.projectInteractions = new ProjectInteractions();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectInteractions;
}