// js/navigation.js - Navigation menu, mobile menu toggle, and routing functionality

// ============================================
// NAVIGATION MODULE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Navigation module initialized');
    
    // Initialize all navigation components
    initNavigationMenu();
    initMobileMenu();
    initRouting();
    initScrollSpy();
    initBreadcrumbs();
    initFooterNavigation();
    
    // Setup navigation event listeners
    setupNavigationListeners();
    
    // Update active navigation based on current page
    updateActiveNavigation();
});

// ============================================
// MAIN NAVIGATION MENU
// ============================================

/**
 * Initialize main navigation menu
 */
function initNavigationMenu() {
    const navMenu = document.querySelector('.navigation-menu');
    if (!navMenu) return;
    
    // Add ARIA attributes for accessibility
    navMenu.setAttribute('role', 'navigation');
    navMenu.setAttribute('aria-label', 'Main navigation');
    
    // Setup dropdown menus
    setupDropdownMenus(navMenu);
    
    // Setup mega menu if present
    setupMegaMenu(navMenu);
    
    // Add current page indicator
    addCurrentPageIndicator(navMenu);
    
    // Setup keyboard navigation
    setupKeyboardNavigation(navMenu);
}

/**
 * Setup dropdown menus in navigation
 */
function setupDropdownMenus(navMenu) {
    const dropdownParents = navMenu.querySelectorAll('.has-dropdown, .menu-item-has-children');
    
    dropdownParents.forEach(parent => {
        const dropdown = parent.querySelector('.dropdown, .sub-menu');
        if (!dropdown) return;
        
        // Add ARIA attributes
        parent.setAttribute('aria-haspopup', 'true');
        parent.setAttribute('aria-expanded', 'false');
        
        // Create toggle button for mobile
        const toggleButton = document.createElement('button');
        toggleButton.className = 'dropdown-toggle';
        toggleButton.innerHTML = '▾';
        toggleButton.setAttribute('aria-label', 'Toggle submenu');
        toggleButton.style.cssText = `
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            margin-left: 5px;
        `;
        
        parent.appendChild(toggleButton);
        
        // Toggle dropdown on click
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(parent, dropdown);
        });
        
        // Show on hover for desktop
        if (window.innerWidth > 768) {
            parent.addEventListener('mouseenter', () => {
                if (!parent.classList.contains('active')) {
                    showDropdown(parent, dropdown);
                }
            });
            
            parent.addEventListener('mouseleave', () => {
                if (!parent.classList.contains('active')) {
                    hideDropdown(parent, dropdown);
                }
            });
        }
    });
}

/**
 * Toggle dropdown menu
 */
function toggleDropdown(parent, dropdown) {
    const isExpanded = parent.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
        hideDropdown(parent, dropdown);
    } else {
        showDropdown(parent, dropdown);
    }
}

/**
 * Show dropdown menu
 */
function showDropdown(parent, dropdown) {
    parent.classList.add('active');
    dropdown.style.display = 'block';
    parent.setAttribute('aria-expanded', 'true');
    
    // Animate dropdown
    dropdown.style.opacity = '0';
    dropdown.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        dropdown.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        dropdown.style.opacity = '1';
        dropdown.style.transform = 'translateY(0)';
    }, 10);
}

/**
 * Hide dropdown menu
 */
function hideDropdown(parent, dropdown) {
    parent.classList.remove('active');
    parent.setAttribute('aria-expanded', 'false');
    
    dropdown.style.opacity = '0';
    dropdown.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        dropdown.style.display = 'none';
    }, 300);
}

/**
 * Setup mega menu functionality
 */
function setupMegaMenu(navMenu) {
    const megaMenus = navMenu.querySelectorAll('.mega-menu');
    
    megaMenus.forEach(megaMenu => {
        const parent = megaMenu.parentElement;
        
        // Add close button for mobile
        const closeButton = document.createElement('button');
        closeButton.className = 'mega-menu-close';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close mega menu');
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            display: none;
        `;
        
        megaMenu.appendChild(closeButton);
        
        // Close mega menu
        closeButton.addEventListener('click', () => {
            hideMegaMenu(parent, megaMenu);
        });
        
        // Handle mega menu on mobile
        if (window.innerWidth <= 768) {
            megaMenu.style.position = 'fixed';
            megaMenu.style.top = '0';
            megaMenu.style.left = '0';
            megaMenu.style.width = '100%';
            megaMenu.style.height = '100%';
            megaMenu.style.overflowY = 'auto';
            closeButton.style.display = 'block';
        }
    });
}

/**
 * Show mega menu
 */
function showMegaMenu(parent, megaMenu) {
    parent.classList.add('active');
    megaMenu.style.display = 'block';
    parent.setAttribute('aria-expanded', 'true');
    
    if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
    }
    
    // Animate in
    megaMenu.style.opacity = '0';
    megaMenu.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        megaMenu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        megaMenu.style.opacity = '1';
        megaMenu.style.transform = 'translateY(0)';
    }, 10);
}

/**
 * Hide mega menu
 */
function hideMegaMenu(parent, megaMenu) {
    parent.classList.remove('active');
    parent.setAttribute('aria-expanded', 'false');
    
    if (window.innerWidth <= 768) {
        document.body.style.overflow = '';
    }
    
    megaMenu.style.opacity = '0';
    megaMenu.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        megaMenu.style.display = 'none';
    }, 300);
}

/**
 * Add current page indicator
 */
function addCurrentPageIndicator(navMenu) {
    const currentPath = window.location.pathname;
    const menuItems = navMenu.querySelectorAll('a');
    
    menuItems.forEach(item => {
        const itemPath = new URL(item.href).pathname;
        
        if (itemPath === currentPath || 
            (currentPath.includes(itemPath) && itemPath !== '/')) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
            
            // Mark parent items as active
            let parent = item.parentElement;
            while (parent && parent !== navMenu) {
                if (parent.classList.contains('has-dropdown') || 
                    parent.classList.contains('menu-item-has-children')) {
                    parent.classList.add('active');
                }
                parent = parent.parentElement;
            }
        }
    });
}

/**
 * Setup keyboard navigation for menu
 */
function setupKeyboardNavigation(navMenu) {
    const focusableElements = navMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    navMenu.addEventListener('keydown', (e) => {
        // Tab key navigation
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
        
        // Arrow key navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            let nextIndex;
            
            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % focusableElements.length;
            } else {
                nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            }
            
            focusableElements[nextIndex].focus();
        }
        
        // Escape key closes dropdowns
        if (e.key === 'Escape') {
            const activeDropdown = navMenu.querySelector('.has-dropdown.active');
            if (activeDropdown) {
                const dropdown = activeDropdown.querySelector('.dropdown, .sub-menu');
                hideDropdown(activeDropdown, dropdown);
                activeDropdown.querySelector('a').focus();
            }
        }
    });
}

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.navigation-menu');
    
    if (!mobileMenuToggle || !navMenu) return;
    
    // Create mobile menu container if it doesn't exist
    if (!navMenu.classList.contains('mobile-menu')) {
        navMenu.classList.add('mobile-menu');
        
        // Add overlay for mobile
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', () => {
            closeMobileMenu(mobileMenuToggle, navMenu, overlay);
        });
    }
    
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', () => {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        const overlay = document.querySelector('.mobile-menu-overlay');
        
        if (isExpanded) {
            closeMobileMenu(mobileMenuToggle, navMenu, overlay);
        } else {
            openMobileMenu(mobileMenuToggle, navMenu, overlay);
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > 768) {
            const overlay = document.querySelector('.mobile-menu-overlay');
            closeMobileMenu(mobileMenuToggle, navMenu, overlay);
        }
    }, 250));
}

/**
 * Open mobile menu
 */
function openMobileMenu(toggle, menu, overlay) {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('active');
    
    if (overlay) {
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
    }
    
    document.body.style.overflow = 'hidden';
    
    // Animate menu in
    menu.style.transform = 'translateX(0)';
    
    // Focus first menu item for keyboard navigation
    setTimeout(() => {
        const firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus();
    }, 300);
}

/**
 * Close mobile menu
 */
function closeMobileMenu(toggle, menu, overlay) {
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('active');
    
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    }
    
    document.body.style.overflow = '';
    
    // Animate menu out
    menu.style.transform = 'translateX(-100%)';
    
    // Return focus to toggle button
    toggle.focus();
}

// ============================================
// ROUTING AND NAVIGATION
// ============================================

/**
 * Initialize client-side routing
 */
function initRouting() {
    // Handle internal link clicks for smooth navigation
    document.addEventListener('click', handleInternalNavigation);
    
    // Handle browser navigation (back/forward)
    window.addEventListener('popstate', handlePopState);
    
    // Prefetch links on hover
    setupLinkPrefetching();
    
    // Handle anchor links
    setupAnchorLinks();
}

/**
 * Handle internal navigation clicks
 */
function handleInternalNavigation(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    
    // Skip if not an internal link
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || 
        href.startsWith('tel:') || href.startsWith('#') || link.target === '_blank') {
        return;
    }
    
    // Skip if modifier key is pressed
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
    }
    
    e.preventDefault();
    
    // Check if it's a same-page anchor
    if (href.startsWith(window.location.pathname + '#')) {
        const anchorId = href.split('#')[1];
        scrollToAnchor(anchorId);
        return;
    }
    
    // Navigate to new page
    navigateTo(href);
}

/**
 * Navigate to a new page
 */
async function navigateTo(url) {
    // Show loading indicator
    showNavigationLoading();
    
    try {
        // Fetch the new page
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
        
        const html = await response.text();
        
        // Parse the response
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        // Update page title
        document.title = newDoc.title;
        
        // Update main content
        const newContent = newDoc.querySelector('main') || newDoc.body;
        const currentContent = document.querySelector('main') || document.body;
        
        // Animate transition
        currentContent.style.opacity = '0';
        currentContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            currentContent.innerHTML = newContent.innerHTML;
            
            // Update URL in browser
            window.history.pushState({}, '', url);
            
            // Re-initialize components
            reinitializePageComponents();
            
            // Animate in new content
            currentContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            currentContent.style.opacity = '1';
            currentContent.style.transform = 'translateY(0)';
            
            // Update active navigation
            updateActiveNavigation();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Track navigation
            trackNavigation(url);
            
        }, 300);
        
    } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to traditional navigation
        window.location.href = url;
    } finally {
        hideNavigationLoading();
    }
}

/**
 * Handle browser back/forward navigation
 */
function handlePopState() {
    // Reload the page or implement SPA navigation
    window.location.reload();
}

/**
 * Setup link prefetching for faster navigation
 */
function setupLinkPrefetching() {
    const links = document.querySelectorAll('a[href^="/"]:not([href*="#"])');
    
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const href = link.getAttribute('href');
            if (href && !prefetchCache.has(href)) {
                prefetchPage(href);
            }
        });
    });
}

/**
 * Prefetch a page for faster loading
 */
function prefetchPage(url) {
    if (prefetchCache.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    
    document.head.appendChild(link);
    prefetchCache.add(url);
}

const prefetchCache = new Set();

/**
 * Setup anchor link handling
 */
function setupAnchorLinks() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        e.preventDefault();
        const anchorId = link.getAttribute('href').substring(1);
        scrollToAnchor(anchorId);
    });
}

/**
 * Scroll to anchor with smooth animation
 */
function scrollToAnchor(anchorId) {
    const target = document.getElementById(anchorId);
    if (!target) return;
    
    const offset = 80; // Account for fixed header
    const targetPosition = target.offsetTop - offset;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
    
    // Update URL without page reload
    window.history.replaceState(null, null, `#${anchorId}`);
    
    // Focus the target for accessibility
    target.setAttribute('tabindex', '-1');
    target.focus();
}

// ============================================
// SCROLL SPY AND ACTIVE NAVIGATION
// ============================================

/**
 * Initialize scroll spy for navigation highlighting
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], h2[id], h3[id]');
    const navLinks = document.querySelectorAll('.navigation-menu a[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveNavLink(id);
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0.1
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink(sectionId) {
    const navLinks = document.querySelectorAll('.navigation-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'section');
        }
    });
}

/**
 * Update active navigation based on current page
 */
function updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navigation-menu a[href]');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        if (linkPath === currentPath) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// ============================================
// BREADCRUMBS NAVIGATION
// ============================================

/**
 * Initialize breadcrumbs navigation
 */
function initBreadcrumbs() {
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (!breadcrumbs) return;
    
    // Generate breadcrumbs based on URL structure
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment);
    
    let breadcrumbHTML = '<a href="/">Home</a>';
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        
        if (isLast) {
            breadcrumbHTML += ` <span class="separator">/</span> <span class="current">${formatBreadcrumbText(segment)}</span>`;
        } else {
            breadcrumbHTML += ` <span class="separator">/</span> <a href="${currentPath}">${formatBreadcrumbText(segment)}</a>`;
        }
    });
    
    breadcrumbs.innerHTML = breadcrumbHTML;
}

/**
 * Format breadcrumb text for display
 */
function formatBreadcrumbText(text) {
    return text
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

// ============================================
// FOOTER NAVIGATION
// ============================================

/**
 * Initialize footer navigation
 */
function initFooterNavigation() {
    const footerLinks = document.querySelector('.footer-links');
    if (!footerLinks) return;
    
    // Add back to top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '↑';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        z-index: 100;
    `;
    
    document.body.appendChild(backToTop);
    
    // Show/hide back to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Setup footer accordions for mobile
    if (window.innerWidth <= 768) {
        setupFooterAccordions(footerLinks);
    }
}

/**
 * Setup footer accordions for mobile
 */
function setupFooterAccordions(footerLinks) {
    const footerSections = footerLinks.querySelectorAll('.footer-section');
    
    footerSections.forEach(section => {
        const heading = section.querySelector('h4, h5');
        if (!heading) return;
        
        const content = section.querySelector('ul, .footer-content');
        if (!content) return;
        
        // Create toggle button
        const toggle = document.createElement('button');
        toggle.className = 'footer-accordion-toggle';
        toggle.innerHTML = '▾';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.style.cssText = `
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            float: right;
        `;
        
        heading.appendChild(toggle);
        
        // Toggle content
        toggle.addEventListener('click', () => {
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                content.style.display = 'none';
                toggle.setAttribute('aria-expanded', 'false');
                toggle.innerHTML = '▾';
            } else {
                content.style.display = 'block';
                toggle.setAttribute('aria-expanded', 'true');
                toggle.innerHTML = '▴';
            }
        });
        
        // Initially hide content on mobile
        content.style.display = 'none';
    });
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

/**
 * Setup all navigation event listeners
 */
function setupNavigationListeners() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-dropdown')) {
            document.querySelectorAll('.has-dropdown.active').forEach(dropdown => {
                const menu = dropdown.querySelector('.dropdown, .sub-menu');
                if (menu) {
                    hideDropdown(dropdown, menu);
                }
            });
        }
    });
    
    // Handle escape key for closing menus
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close mobile menu
            const mobileMenu = document.querySelector('.navigation-menu.active');
            if (mobileMenu && window.innerWidth <= 768) {
                const toggle = document.querySelector('.mobile-menu-toggle');
                const overlay = document.querySelector('.mobile-menu-overlay');
                closeMobileMenu(toggle, mobileMenu, overlay);
            }
            
            // Close dropdowns
            document.querySelectorAll('.has-dropdown.active').forEach(dropdown => {
                const menu = dropdown.querySelector('.dropdown, .sub-menu');
                if (menu) {
                    hideDropdown(dropdown, menu);
                }
            });
        }
    });
    
    // Handle window resize for responsive navigation
    window.addEventListener('resize', debounce(handleWindowResize, 250));
}

/**
 * Handle window resize for responsive navigation
 */
function handleWindowResize() {
    const navMenu = document.querySelector('.navigation-menu');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth > 768) {
        // Desktop: Show all menus, hide mobile overlay
        navMenu?.classList.remove('active');
        mobileMenuToggle?.classList.remove('active');
        mobileMenuToggle?.setAttribute('aria-expanded', 'false');
        
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
        }
        
        document.body.style.overflow = '';
        
        // Reset footer accordions
        const footerLinks = document.querySelector('.footer-links');
        if (footerLinks) {
            footerLinks.querySelectorAll('.footer-section ul, .footer-section .footer-content').forEach(content => {
                content.style.display = '';
            });
        }
        
    } else {
        // Mobile: Hide dropdowns by default
        navMenu?.querySelectorAll('.dropdown, .sub-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Show navigation loading indicator
 */
function showNavigationLoading() {
    const loading = document.createElement('div');
    loading.className = 'navigation-loading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #007bff, #0056b3);
        z-index: 9999;
        animation: loadingProgress 1s infinite;
    `;
    
    document.body.appendChild(loading);
}

/**
 * Hide navigation loading indicator
 */
function hideNavigationLoading() {
    const loading = document.querySelector('.navigation-loading');
    if (loading) {
        loading.remove();
    }
}

/**
 * Reinitialize page components after navigation
 */
function reinitializePageComponents() {
    // Dispatch custom event for other modules to reinitialize
    window.dispatchEvent(new CustomEvent('page:loaded'));
    
    // Re-initialize common components
    if (typeof initLightboxSystem === 'function') initLightboxSystem();
    if (typeof initCommentsSystem === 'function') initCommentsSystem();
    if (typeof initSearchBar === 'function') initSearchBar();
    
    // Update any dynamic content
    updateActiveNavigation();
    initBreadcrumbs();
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Track navigation for analytics
 */
function trackNavigation(url) {
    console.log('Navigation to:', url);
    
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: url,
            page_path: new URL(url).pathname
        });
    }
}

// ============================================
// EXPORT FOR GLOBAL USAGE
// ============================================

// Make navigation functions available globally
window.Navigation = {
    navigateTo: navigateTo,
    scrollToAnchor: scrollToAnchor,
    openMobileMenu: openMobileMenu,
    closeMobileMenu: closeMobileMenu,
    updateActiveNavigation: updateActiveNavigation
};

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initNavigationMenu();
    initMobileMenu();
    initRouting();
    setupNavigationListeners();
});