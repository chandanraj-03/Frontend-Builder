// main.js - Core application logic, initialization, and shared utilities for single-page portfolio

// Application state and configuration
const AppConfig = {
    currentSection: 'hero',
    animationDuration: 300,
    contentData: {
        projects: [],
        bio: '',
        contactInfo: {}
    }
};

// DOM elements cache
const DOM = {
    sections: {},
    navLinks: null,
    projectCards: null,
    contactItems: null
};

// Initialize application
function initApp() {
    cacheDOM();
    loadContentData();
    setupEventListeners();
    setupIntersectionObserver();
    setupAnimations();
    updateActiveNav();
}

// Cache frequently used DOM elements
function cacheDOM() {
    // Cache all sections
    document.querySelectorAll('section').forEach(section => {
        const id = section.id;
        DOM.sections[id] = section;
    });

    // Cache navigation links
    DOM.navLinks = document.querySelectorAll('nav a');

    // Cache project cards
    DOM.projectCards = document.querySelectorAll('.project-card');

    // Cache contact information items
    DOM.contactItems = document.querySelectorAll('.contact-item');
}

// Load content data (simulated API call)
async function loadContentData() {
    try {
        // In a real application, this would fetch from an API
        const response = await simulateAPICall();
        AppConfig.contentData = response;
        populateContent();
    } catch (error) {
        console.error('Failed to load content data:', error);
        loadFallbackContent();
    }
}

// Simulate API call with timeout
function simulateAPICall() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                projects: [
                    { id: 1, title: 'Project One', description: 'Description of project one', details: 'Additional details about this project' },
                    { id: 2, title: 'Project Two', description: 'Description of project two', details: 'Additional details about this project' },
                    { id: 3, title: 'Project Three', description: 'Description of project three', details: 'Additional details about this project' }
                ],
                bio: 'Professional biography and background information',
                contactInfo: {
                    email: 'contact@example.com',
                    phone: '+1 (555) 123-4567',
                    social: ['linkedin.com/in/example', 'github.com/example']
                }
            });
        }, 500);
    });
}

// Populate content from loaded data
function populateContent() {
    // Populate projects
    if (DOM.sections['project-showcase'] && AppConfig.contentData.projects.length > 0) {
        const projectContainer = DOM.sections['project-showcase'].querySelector('.projects-container');
        if (projectContainer) {
            AppConfig.contentData.projects.forEach(project => {
                const projectCard = createProjectCard(project);
                projectContainer.appendChild(projectCard);
            });
            // Re-cache project cards after adding them
            DOM.projectCards = document.querySelectorAll('.project-card');
        }
    }

    // Populate about section
    if (DOM.sections['about-section']) {
        const bioElement = DOM.sections['about-section'].querySelector('.bio-content');
        if (bioElement) {
            bioElement.textContent = AppConfig.contentData.bio;
        }
    }

    // Populate contact section
    if (DOM.sections['contact-section']) {
        const emailElement = DOM.sections['contact-section'].querySelector('.contact-email');
        const phoneElement = DOM.sections['contact-section'].querySelector('.contact-phone');
        
        if (emailElement && AppConfig.contentData.contactInfo.email) {
            emailElement.textContent = AppConfig.contentData.contactInfo.email;
            emailElement.dataset.value = AppConfig.contentData.contactInfo.email;
        }
        
        if (phoneElement && AppConfig.contentData.contactInfo.phone) {
            phoneElement.textContent = AppConfig.contentData.contactInfo.phone;
            phoneElement.dataset.value = AppConfig.contentData.contactInfo.phone;
        }
    }
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.projectId = project.id;
    
    card.innerHTML = `
        <div class="project-front">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
        </div>
        <div class="project-details">
            <p>${project.details}</p>
        </div>
    `;
    
    return card;
}

// Load fallback content if API fails
function loadFallbackContent() {
    console.log('Loading fallback content');
    // Fallback content would be loaded here
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation click handlers
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Project card hover handlers
    DOM.projectCards.forEach(card => {
        card.addEventListener('mouseenter', handleProjectHover);
        card.addEventListener('mouseleave', handleProjectLeave);
    });

    // Contact information click-to-copy handlers
    DOM.contactItems.forEach(item => {
        item.addEventListener('click', handleContactClick);
    });

    // Window scroll for navigation update
    window.addEventListener('scroll', debounce(updateActiveNav, 100));
}

// Handle navigation clicks
function handleNavClick(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute('href').substring(1);
    
    if (DOM.sections[targetId]) {
        scrollToSection(targetId);
        AppConfig.currentSection = targetId;
        updateActiveNav();
    }
}

// Handle project card hover
function handleProjectHover(event) {
    const card = event.currentTarget;
    card.classList.add('hover-active');
    
    // Add smooth transition
    card.style.transition = `transform ${AppConfig.animationDuration}ms ease, box-shadow ${AppConfig.animationDuration}ms ease`;
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
}

// Handle project card leave
function handleProjectLeave(event) {
    const card = event.currentTarget;
    card.classList.remove('hover-active');
    
    // Reset transform
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
}

// Handle contact information click for copy
function handleContactClick(event) {
    const contactItem = event.currentTarget;
    const valueToCopy = contactItem.dataset.value || contactItem.textContent;
    
    copyToClipboard(valueToCopy);
    
    // Show feedback
    showCopyFeedback(contactItem, 'Copied!');
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

// Show copy feedback
function showCopyFeedback(element, message) {
    const originalText = element.textContent;
    element.textContent = message;
    element.style.color = '#4CAF50';
    
    setTimeout(() => {
        element.textContent = originalText;
        element.style.color = '';
    }, 1500);
}

// Setup intersection observer for animations
function setupIntersectionObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    // Observe all sections
    Object.values(DOM.sections).forEach(section => {
        observer.observe(section);
    });
}

// Setup CSS animations
function setupAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .in-view {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .project-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .project-details {
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .project-card.hover-active .project-details {
            opacity: 1;
            transform: translateY(0);
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Scroll to section with smooth behavior
function scrollToSection(sectionId) {
    const section = DOM.sections[sectionId];
    if (section) {
        window.scrollTo({
            top: section.offsetTop - 80, // Adjust for fixed header
            behavior: 'smooth'
        });
    }
}

// Update active navigation based on scroll position
function updateActiveNav() {
    const scrollPosition = window.scrollY + 100;
    
    // Find current section
    let currentSection = 'hero';
    Object.entries(DOM.sections).forEach(([id, section]) => {
        if (section.offsetTop <= scrollPosition) {
            currentSection = id;
        }
    });
    
    // Update active nav link
    DOM.navLinks.forEach(link => {
        const linkId = link.getAttribute('href').substring(1);
        if (linkId === currentSection) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    AppConfig.currentSection = currentSection;
}

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility function to update content dynamically
function updateContent(type, data) {
    switch (type) {
        case 'projects':
            AppConfig.contentData.projects = data;
            // Clear and repopulate projects
            const projectContainer = DOM.sections['project-showcase']?.querySelector('.projects-container');
            if (projectContainer) {
                projectContainer.innerHTML = '';
                data.forEach(project => {
                    const projectCard = createProjectCard(project);
                    projectContainer.appendChild(projectCard);
                });
                DOM.projectCards = document.querySelectorAll('.project-card');
            }
            break;
            
        case 'bio':
            AppConfig.contentData.bio = data;
            const bioElement = DOM.sections['about-section']?.querySelector('.bio-content');
            if (bioElement) {
                bioElement.textContent = data;
            }
            break;
            
        case 'contact':
            AppConfig.contentData.contactInfo = { ...AppConfig.contentData.contactInfo, ...data };
            // Update contact elements
            if (data.email) {
                const emailElement = DOM.sections['contact-section']?.querySelector('.contact-email');
                if (emailElement) {
                    emailElement.textContent = data.email;
                    emailElement.dataset.value = data.email;
                }
            }
            if (data.phone) {
                const phoneElement = DOM.sections['contact-section']?.querySelector('.contact-phone');
                if (phoneElement) {
                    phoneElement.textContent = data.phone;
                    phoneElement.dataset.value = data.phone;
                }
            }
            break;
    }
}

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export utilities for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApp,
        updateContent,
        scrollToSection,
        copyToClipboard
    };
}